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

  const newUser = await User.create({ name, email, password, passwordConfirm });

  res.status(201).json({
    status: STATUS_TYPE.SUCCESS,
    token: signToken({ id: newUser._id, role: newUser.role }),
    data: {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
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
  // Check if the user account is active
  if (!user.active) {
    return next(
      new AppError(
        'Your account has been deactivated. Please contact support.',
        403,
        ERROR_CODES.AUTH.INACTIVE_USER,
      ),
    );
  }

  // If everythings ok send token to client
  const token = signToken({ id: user._id });

  return res.status(200).json({
    status: STATUS_TYPE.SUCCESS,
    token,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
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
  user.passwordChangedAt = Date.now() - 1000; // ewidated

  await user.save(); // 🔑 persist changes and trigger password hashing

  const token = signToken({ id: user.id });

  return res.status(200).json({
    status: STATUS_TYPE.SUCCESS,
    token,
  });
});

const protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check it's there
  const token = extractBearerToken(req);

  // 2) Verification token
  let decoded;

  try {
    decoded = await verifyToken(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(err);
  }

  // 3) Check if user still exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401,
        ERROR_CODES.AUTH.USER_NOT_FOUND,
      ),
    );
  }

  // 4) Check if user changed password after token was issued
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
