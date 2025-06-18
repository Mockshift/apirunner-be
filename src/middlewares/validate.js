const { validationResult } = require('express-validator');
const AppError = require('../utils/appError');
const { ERROR_CODES } = require('../constants/errorCodes');

module.exports = (req, _res, next) => {
  const errors = validationResult(req);

  // If there are no validation errors, continue to the next middleware
  if (errors.isEmpty()) return next();

  // Special case: custom message for login endpoint
  if (req.originalUrl === '/api/v1/users/login') {
    return next(
      new AppError(
        'Please provide both email and password.',
        400,
        ERROR_CODES.VALIDATION.MISSING_FIELDS,
      ),
    );
  }

  // General validation error: collect all error messages
  const message = errors
    .array()
    .map((err) => err.msg)
    .join('. ');

  return next(new AppError(message, 400, ERROR_CODES.VALIDATION.INPUT_VALIDATION_ERROR));
};
