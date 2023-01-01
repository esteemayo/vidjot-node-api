/* eslint-disable */
import express from 'express';

import * as authController from '../controllers/authController.js';
import * as authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);

router.post('/reset-password/:token', authController.resetPassword);

router.patch(
  '/update-my-password',
  authMiddleware.protect,
  authController.updatePassword
);

export default router;
