const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');
const { STATUS_TYPE } = require('../constants/common');
const { signToken, verifyToken } = require('../utils/token');
const AppError = require('../utils/appError');
const { ERROR_CODES } = require('../constants/errorCodes');
const { extractBearerToken } = require('../utils/auth');

/**
 * Registers a new user and returns a JWT token.
 *
 * @route POST /api/v1/auth/signup
 */
const signup = catchAsync(async (req, res, _next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const newUser = await User.create({ name, email, password, passwordConfirm, role: 'user' });

  return res.status(201).json({
    status: STATUS_TYPE.SUCCESS,
    token: signToken({ id: newUser._id, role: newUser.role }),
    data: {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
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
        role: user.role,
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
        role: user.role,
      },
    },
  });
});

/**
 * Middleware: Verifies JWT token and attaches user to req.
 */
const protect = catchAsync(async (req, res, next) => {
  // Getting token and check it's there
  const token = extractBearerToken(req);

  // Verification token
  let decoded;
  try {
    decoded = await verifyToken(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(err);
  }

  // Check if user still exist
  const freshUser = await User.findOne({ _id: decoded.id, isDeleted: { $ne: true } });
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
        ERROR_CODES.AUTH.USER_NOT_FOUND,
      ),
    );
  }

  // Check if user changed password after token was issued
  if (freshUser.isChangedPassword(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password! Please log in again.',
        401,
        ERROR_CODES.AUTH.PASSWORD_CHANGED_AFTER_TOKEN,
      ),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  return next();
});

module.exports = {
  signup,
  login,
  updateMyPassword,
  protect,
};
