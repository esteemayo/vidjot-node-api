/* eslint-disable */
import express from 'express';

import * as authMiddleware from '../middlewares/authMiddleware.js';
import * as ideaController from '../controllers/ideaController.js';

const router = express.Router();

router.use(authMiddleware.protect);

router
  .route('/')
  .get(ideaController.getAllIdeas)
  .post(
    authMiddleware.restrictTo('user'),
    ideaController.sendAuthorId,
    ideaController.createIdea
  );

router
  .route('/:id')
  .get(ideaController.getIdea)
  .patch(authMiddleware.restrictTo('user'), ideaController.updateIdea)
  .delete(
    authMiddleware.restrictTo('user', 'admin'),
    ideaController.deleteIdea
  );

router.get('/details/:slug', ideaController.getIdeaWithSlug);

export default router;
