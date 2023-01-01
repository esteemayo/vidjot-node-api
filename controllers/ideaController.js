/* eslint-disable */
import { StatusCodes } from 'http-status-codes';

import Idea from '../models/Idea.js';
import * as factory from './handlerFactory.js';
import catchErrors from '../utils/catchErrors.js';
import NotFoundError from '../errors/notFound.js';
import UnauthenticatedError from '../errors/unauthenticated.js';

export const sendAuthorId = (req, res, next) => {
  if (!req.body.author) req.body.author = req.user.username;
  next();
};

export const updateIdea = catchErrors(async (req, res, next) => {
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

export const deleteIdea = catchErrors(async (req, res, next) => {
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

export const getAllIdeas = factory.getAll(Idea, true);
export const getIdea = factory.getOne(Idea);
export const getIdeaWithSlug = factory.getWithSlug(Idea);
export const createIdea = factory.createOne(Idea);
