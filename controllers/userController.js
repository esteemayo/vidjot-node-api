/* eslint-disable */
import _ from 'lodash';
import { StatusCodes } from 'http-status-codes';

import User from '../models/User.js';
import Idea from '../models/Idea.js';
import * as factory from './handlerFactory.js';
import catchErrors from '../utils/catchErrors.js';
import BadRequestError from '../errors/badRequest.js';
import createSendToken from '../middlewares/createSendToken.js';

export const signup = catchErrors(async (req, res, next) => {
  const newUser = _.pick(req.body, [
    'name',
    'email',
    'role',
    'photo',
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

export const updateMe = catchErrors(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  if (password || passwordConfirm) {
    return next(
      new BadRequestError(
        `This route is not for password updates. Please use ${req.protocol
        }://${req.get('host')}/api/v1/auth/update-my-password`
      )
    );
  }

  const filterBody = _.pick(req.body, ['name', 'email', 'photo', 'username']);
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

export const deleteMe = catchErrors(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user._id, {
    active: false,
  });

  await Idea.deleteMany({ author: user.username });

  res.status(StatusCodes.NO_CONTENT).json({
    status: 'success',
    data: null,
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

export const createUser = (req, res, next) => {
  res
    .status(StatusCodes.INTERNAL_SERVER_ERROR)
    .send(
      `This route is not defined! Please use ${req.protocol}://${req.get(
        'host'
      )}/api/v1/users/register instead!`
    );
};

export const getAllUsers = factory.getAll(User);
export const getUser = factory.getOne(User);
export const updateUser = factory.updateOne(User);
export const deleteUser = factory.deleteOne(User);
