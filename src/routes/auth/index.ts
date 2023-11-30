import { PublicRequest, RoleRequest } from 'app.request.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import express from 'express';
import { createTokens } from '../../auth/authUtils.js';
import { AuthFailureError, BadRequestError } from '../../core/ApiError.js';
import { SuccessResponse } from '../../core/ApiResponse.js';
import { RoleCode } from '../../database/model/Role.js';
import User from '../../database/model/User.js';
import KeyStoreRepo from '../../database/repository/KeyStoreRepo.js';
import UserRepo from '../../database/repository/UserRepo.js';
import asyncHandler from '../../helpers/asyncHandler.js';
import validator from '../../helpers/validator.js';
import schema from './schema.js';
import { getUserData } from './utils.js';

const router = express.Router();

router.post(
  '/login',
  validator(schema.credential),
  asyncHandler(async (req: PublicRequest, res) => {
    console.log('REQ', res);
    const user = await UserRepo.findByEmail(req.body.email);

    if (!user) throw new BadRequestError('User not registered');
    if (!user.password) throw new BadRequestError('Credential not set');

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) throw new AuthFailureError('Authentication failure');

    const accessTokenKey = crypto.randomBytes(64).toString('hex');
    const refreshTokenKey = crypto.randomBytes(64).toString('hex');

    await KeyStoreRepo.create(user, accessTokenKey, refreshTokenKey);
    const tokens = await createTokens(user, accessTokenKey, refreshTokenKey);
    const userData = await getUserData(user);

    new SuccessResponse('Login Success', {
      user: userData,
      tokens: tokens,
    }).send(res);
  }),
);

router.post(
  '/signup',
  validator(schema.signup),
  asyncHandler(async (req: RoleRequest, res) => {
    const user = await UserRepo.findByEmail(req.body.email);

    if (user) throw new BadRequestError('User already registered');

    const accessTokenKey = crypto.randomBytes(64).toString('hex');
    const refreshTokenKey = crypto.randomBytes(64).toString('hex');

    const passwordHash = await bcrypt.hash(req.body.password, 10);

    const { user: createdUser, keystore } = await UserRepo.create(
      {
        name: req.body.name,
        email: req.body.email,
        profilePicUrl: req.body.profilePicUrl,
        password: passwordHash,
      } as User,
      accessTokenKey,
      refreshTokenKey,
      RoleCode.LEARNER,
    );

    const tokens = await createTokens(
      createdUser,
      keystore.primaryKey,
      keystore.secondaryKey,
    );
    const userData = await getUserData(createdUser);

    new SuccessResponse('Signup Successful', {
      user: userData,
      tokens: tokens,
    }).send(res);
  }),
);

export default router;
