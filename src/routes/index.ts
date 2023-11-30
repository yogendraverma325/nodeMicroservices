import express from 'express';
import apiKey from '../auth/apiKey.js';
import { Permission } from '../database/model/ApiKey.js';

// import credential from './access/credential';

import permission from '../helpers/permission.js';
import authRoutes from './auth/index.js';
// import token from './access/token';
// import blog from './blog';
// import blogs from './blogs';
// import profile from './profile';

const router = express.Router();

/*---------------------------------------------------------*/
router.use(apiKey);
/*---------------------------------------------------------*/
/*---------------------------------------------------------*/
router.use(permission(Permission.GENERAL));
/*---------------------------------------------------------*/
router.use('/auth', authRoutes);
// router.use('/signup', signup);
// router.use('/logout', logout);
// router.use('/token', token);
// router.use('/credential', credential);
// router.use('/profile', profile);
// router.use('/blog', blog);
// router.use('/blogs', blogs);

export default router;
