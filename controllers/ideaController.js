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
  let idea = await Idea.findById(req.params.id);

  if (!idea) {
    return next(new NotFoundError('No idea found with that ID'));
  }

  if (idea.author === req.user.username) {
    idea = await Idea.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(StatusCodes.OK).send(idea);
  }

  return next(new UnauthenticatedError('You can only update your idea.'));
});

exports.deleteIdea = catchErrors(async (req, res, next) => {
  const idea = await Idea.findById(req.params.id);

  if (!idea) {
    return next(new NotFoundError('No idea found with that ID'));
  }

  if (idea.author === req.user.username) {
    await Idea.findByIdAndDelete(req.params.id);

    res.status(StatusCodes.NO_CONTENT).send(idea);
  }

  return next(new UnauthenticatedError('You can only delete your idea.'));
});

exports.getAllIdeas = factory.getAll(Idea, true);
exports.getIdea = factory.getOne(Idea);
exports.getIdeaWithSlug = factory.getWithSlug(Idea);
exports.createIdea = factory.createOne(Idea);
