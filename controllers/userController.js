const _ = require('lodash');
const { StatusCodes } = require('http-status-codes');

const User = require('../models/User');
const Idea = require('../models/Idea');
const factory = require('./handlerFactory');
const catchErrors = require('../utils/catchErrors');
const BadRequestError = require('../errors/badRequest');
const createSendToken = require('../middlewares/createSendToken');

exports.signup = catchErrors(async (req, res, next) => {
  const newUser = _.pick(req.body, [
    'name',
    'email',
    'role',
    'username',
    'password',
    'passwordConfirm',
    'passwordChangedAt',
  ]);

  const user = await User.create({ ...newUser });

  if (user) {
    createSendToken(user, StatusCodes.CREATED, res);
  }
});

exports.updateMe = catchErrors(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (password || passwordConfirm) {
    return next(
      new BadRequestError(
        `This route is not for password updates. Please use ${req.protocol
        }://${req.get('host')}/api/v1/auth/update-my-password`
      )
    );
  }

  const filterBody = _.pick(req.body, ['name', 'email', 'username']);
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { $set: { ...filterBody } },
    {
      new: true,
      runValidators: true,
    }
  );

  createSendToken(user, StatusCodes.OK, res);
});

exports.deleteMe = catchErrors(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, {
    active: false,
  });

  await Idea.deleteMany({ author: user.username });

  res.status(StatusCodes.NO_CONTENT).json({
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
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
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
