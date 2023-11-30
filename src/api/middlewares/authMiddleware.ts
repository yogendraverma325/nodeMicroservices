import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserModel } from '~/database/model/User.js';

// Extend the Express.Request type
interface CustomRequest extends Request {
  user?: User;
  token?: string;
  headers: any;
}

const authMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req?.headers?.authorization.split(' ')[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'defaultSecret',
    ) as any;
    const user = await UserModel.findOne({
      _id: decoded.id,
      jwtAccessToken: token,
    });

    if (!user) {
      throw new Error('invalid user logged in!');
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
