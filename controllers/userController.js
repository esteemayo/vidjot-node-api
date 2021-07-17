const _ = require('lodash');

const User = require('../models/User');
const Idea = require('../models/Idea');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const catchErrors = require('../utils/catchErrors');

exports.signup = catchErrors(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    username: req.body.username,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  const token = user.generateAuthToken();
  user.password = undefined;

  res
    .status(201)
    .header('x-auth-token', token)
    .header('access-control-expose-headers', 'x-auth-token')
    .send(user);
});

exports.updateMe = catchErrors(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (password || passwordConfirm) {
    return next(
      new AppError(
        `This route is not for password updates. Please use ${
          req.protocol
        }://${req.get('host')}/api/v1/auth/update-my-password`,
        400
      )
    );
  }

  const filterBody = _.pick(req.body, ['name', 'email', 'username']);
  const user = await User.findByIdAndUpdate(req.user._id, filterBody, {
    new: true,
    runValidators: true,
  });

  const token = user.generateAuthToken();
  user.password = undefined;

  res
    .status(200)
    .header('x-auth-token', token)
    .header('access-control-expose-headers', 'x-auth-token')
    .send(user);
});

exports.deleteMe = catchErrors(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, {
    active: false,
  });

  await Idea.deleteMany({ author: user.username });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

exports.createUser = (req, res, next) => {
  res
    .status(500)
    .send(
      `This route is not defined! Please use ${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/register instead!`
    );
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
