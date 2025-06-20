const catchAsync = require('../utils/catchAsync');
const { extractBearerToken } = require('../utils/auth');
const { verifyToken } = require('../utils/token');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const { ERROR_CODES } = require('../constants/errorCodes');
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

module.exports = protect;
