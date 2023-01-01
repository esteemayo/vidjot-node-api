/* eslint-disable */
import config from 'config';
import jwt from 'jsonwebtoken';

import catchErrors from '../utils/catchErrors.js';
import ForbiddenError from '../errors/forbidden.js';
import BadRequestError from '../errors/badRequest.js';
import UnauthenticatedError from '../errors/unauthenticated.js';

export const protect = catchErrors(async (req, res, next) => {
  if (!config.get('requiresAuth')) return next();

  const token = req.headers['x-auth-token'];
  if (!token) {
    return next(new UnauthenticatedError('Access denied. No token provided.'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new BadRequestError('Invalid token'));
  }
});

export const restrictTo =
  (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ForbiddenError('You do not have permission to perform this action.')
        );
      }
      next();
    };


export const verifyUser = (req, res, next) => {
  if (req.user._id === req.params.id) {
    return next();
  }
  return next(new ForbiddenError('You are not authorized to perform this operation'));
};
