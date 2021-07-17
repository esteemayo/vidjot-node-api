const express = require("express");

const authController = require("../controllers/authController");
const ideaController = require("../controllers/ideaController");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(ideaController.getAllIdeas)
  .post(
    authController.restrictTo("user"),
    ideaController.sendAuthorId,
    ideaController.createIdea
  );

router
  .route("/:id")
  .get(ideaController.getIdea)
  .patch(authController.restrictTo("user"), ideaController.updateIdea)
  .delete(
    authController.restrictTo("user", "admin"),
    ideaController.deleteIdea
  );

router.get("/details/:slug", ideaController.getIdeaWithSlug);

module.exports = router;
