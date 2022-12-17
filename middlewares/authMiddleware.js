const jwt = require('jsonwebtoken');

const catchErrors = require('../utils/catchErrors');
const ForbiddenError = require('../errors/forbidden');
const BadRequestError = require('../errors/badRequest');
const UnauthenticatedError = require('../errors/unauthenticated');

exports.protect = catchErrors(async (req, res, next) => {
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

exports.restrictTo =
  (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new ForbiddenError('You do not have permission to perform this action.')
        );
      }
      next();
    };


exports.verifyUser = (req, res, next) => {
  if (req.user._id === req.params.id) {
    return next();
  }
  return next(new ForbiddenError('You are not authorized to perform this operation'));
};
