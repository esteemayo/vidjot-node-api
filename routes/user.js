/* eslint-disable */
import express from 'express';

import * as authMiddleware from '../middlewares/authMiddleware.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.post('/register', userController.signup);

router.use(authMiddleware.protect);

router.get('/me', userController.getMe, userController.getUser);

router.patch('/update-me', userController.updateMe);

router.delete('/delete-me', userController.deleteMe);

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(authMiddleware.verifyUser, userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
