/* eslint-disable */
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';

import User from '../models/User.js';
import sendEmail from '../utils/email.js';
import AppError from '../errors/appError.js';
import catchErrors from '../utils/catchErrors.js';
import NotFoundError from '../errors/notFound.js';
import BadRequestError from '../errors/badRequest.js';
import UnauthenticatedError from '../errors/unauthenticated.js';
import createSendToken from '../middlewares/createSendToken.js';

export const login = catchErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError('Please provide email and password.'));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new UnauthenticatedError('Incorrect email or password.'));
  }

  createSendToken(user, StatusCodes.OK, res);
});

export const forgotPassword = catchErrors(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new NotFoundError('There is no user with email address.'));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/reset-password/${resetToken}`;

  const message = `
    Hi ${user.name},
    There was a request to change your password!
    If you did not make this request then please ignore this email.
    Otherwise, please click this link to change your password: ${resetURL}
  `;

  const html = `
    <div style='background: #f7f7f7; color: #333; padding: 50px; text-align: left;'>
      <h3>Hi ${user.name},</h3>
      <p>There was a request to change your password!</p>
      <p>If you did not make this request then please ignore this email.</p>
      <p>Otherwise, please click this link to change your password: 
        <a style='text-decoration: none; background: #15847b; color: #fff; padding: 5px 10px; border-radius: 5px;' href='${resetURL}'>
          Reset my password →
        </a>
      </p>
    </div>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for only 10 minutes)',
      message,
      html,
    });

    res.status(StatusCodes.OK).send('Token sent to email.');
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later.')
    );
  }
});

export const resetPassword = catchErrors(async (req, res, next) => {
  const { token } = req.params;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new BadRequestError('Token is invalid or has expired.'));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  createSendToken(user, StatusCodes.OK, res);
});

export const updatePassword = catchErrors(async (req, res, next) => {
  const { password, passwordConfirm, passwordCurrent } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.correctPassword(passwordCurrent, user.password))) {
    return next(new BadRequestError('Your current password is wrong.'));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  createSendToken(user, StatusCodes.OK, res);
});
