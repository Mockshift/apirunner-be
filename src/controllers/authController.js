const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const { STATUS_TYPE } = require('../constants/common');
const { signToken } = require('../utils/token');
const AppError = require('../utils/appError');
const { ERROR_CODES } = require('../constants/errorCodes');

/**
 * Registers a new user and returns a JWT token.
 *
 * @route POST /api/v1/auth/signup
 */
const signup = catchAsync(async (req, res, _next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const newUser = await User.create({ name, email, password, passwordConfirm, systemRole: 'user' });

  return res.status(201).json({
    status: STATUS_TYPE.SUCCESS,
    token: signToken({ id: newUser._id, systemRole: newUser.systemRole }),
    data: {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        systemRole: newUser.systemRole,
      },
    },
  });
});

/**
 * Authenticates user credentials and returns a JWT token.
 *
 * @route POST /api/v1/auth/login
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check  user exist && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    return next(
      new AppError('Incorrect email or password', 401, ERROR_CODES.VALIDATION.INVALID_CREDENTIALS),
    );
  }

  return res.status(200).json({
    status: STATUS_TYPE.SUCCESS,
    token: signToken({ id: user.id }),
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        systemRole: user.systemRole,
      },
    },
  });
});

/**
 * Allows a logged-in user to update their password and returns a new JWT token.
 *
 * @route PATCH /api/v1/users/updateMyPassword
 */
const updateMyPassword = catchAsync(async (req, res, next) => {
  const { password, newPassword, newPasswordConfirm } = req.body;
  const { user } = req;

  const isPasswordCorrect = await user.isPasswordCorrect(password, user.password);

  if (!isPasswordCorrect) {
    return next(
      new AppError(
        'Your current password is incorrect. Please try again.',
        401,
        ERROR_CODES.AUTH.INVALID_CURRENT_PASSWORD,
      ),
    );
  }

  if (newPassword !== newPasswordConfirm) {
    return next(
      new AppError(
        'New password and confirmation do not match.',
        400,
        ERROR_CODES.VALIDATION.PASSWORD_CONFIRMATION_MISMATCH,
      ),
    );
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  user.passwordChangedAt = Date.now() - 1000;

  await user.save();

  return res.status(200).json({
    status: STATUS_TYPE.SUCCESS,
    token: signToken({ id: user.id }),
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        systemRole: user.systemRole,
      },
    },
  });
});

module.exports = {
  signup,
  login,
  updateMyPassword,
};
