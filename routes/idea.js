const express = require('express');

const authMiddleware = require('../middlewares/authMiddleware');
const ideaController = require('../controllers/ideaController');

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

module.exports = router;
