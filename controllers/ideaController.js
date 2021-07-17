const Idea = require('../models/Idea');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const catchErrors = require('../utils/catchErrors');

exports.sendAuthorId = (req, res, next) => {
  if (!req.body.author) req.body.author = req.user.username;

  next();
};

exports.updateIdea = catchErrors(async (req, res, next) => {
  const idea = await Idea.findById(req.params.id);

  if (!idea) {
    return next(new AppError('No idea found with that ID', 404));
  }

  if (idea.author === req.user.username) {
    await Idea.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).send(idea);
  }

  return next(new AppError('You can only update your idea.', 401));
});

exports.deleteIdea = catchErrors(async (req, res, next) => {
  const idea = await Idea.findById(req.params.id);

  if (!idea) {
    return next(new AppError('No idea found with that ID', 404));
  }

  if (idea.author === req.user.username) {
    await Idea.findByIdAndDelete(req.params.id);

    res.status(204).send(idea);
  }

  return next(new AppError('You can only delete your idea.', 401));
});

exports.getAllIdeas = factory.getAll(Idea, true);
exports.getIdea = factory.getOne(Idea);
exports.getIdeaWithSlug = factory.getWithSlug(Idea);
exports.createIdea = factory.createOne(Idea);
