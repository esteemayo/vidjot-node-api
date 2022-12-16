const { StatusCodes } = require('http-status-codes');

const Idea = require('../models/Idea');
const factory = require('./handlerFactory');
const catchErrors = require('../utils/catchErrors');
const NotFoundError = require('../errors/notFound');
const UnauthenticatedError = require('../errors/unauthenticated');

exports.sendAuthorId = (req, res, next) => {
  if (!req.body.author) req.body.author = req.user.username;
  next();
};

exports.updateIdea = catchErrors(async (req, res, next) => {
  const { id: ideaId } = req.params;

  let idea = await Idea.findById(ideaId);

  if (!idea) {
    return next(new NotFoundError(`No idea found with that ID → ${ideaId}`));
  }

  if (idea.author === req.user.username) {
    idea = await Idea.findByIdAndUpdate(ideaId, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(StatusCodes.OK).json(idea);
  }

  return next(new UnauthenticatedError('You can only update your idea.'));
});

exports.deleteIdea = catchErrors(async (req, res, next) => {
  const { id: ideaId } = req.params;

  const idea = await Idea.findById(ideaId);

  if (!idea) {
    return next(new NotFoundError(`No idea found with that ID → ${ideaId}`));
  }

  if (idea.author === req.user.username) {
    await Idea.findByIdAndDelete(ideaId);

    res.status(StatusCodes.NO_CONTENT).json(idea);
  }

  return next(new UnauthenticatedError('You can only delete your idea.'));
});

exports.getAllIdeas = factory.getAll(Idea, true);
exports.getIdea = factory.getOne(Idea);
exports.getIdeaWithSlug = factory.getWithSlug(Idea);
exports.createIdea = factory.createOne(Idea);
