const { ERROR_CODES } = require('../constants/errorCodes');
const AppError = require('../utils/appError');

// Error response for development
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    code: err.code || null,
    // trace: err.stack
    //   ?.split('\n')
    //   .filter((line) => line.includes('/src/'))
    //   .map((line) => line.trim()),
    // stack: err.stack?.split('\n').map((line) => line.trim()),
  });

  console.error({
    message: err.message,
    trace: err.stack
      ?.split('\n')
      .filter((line) => line.includes('/src/'))
      .map((line) => line.trim()),
  });
};

// Error response for production
const sendErrorProd = (err, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  // Operational: expected, handled error (AppError)
  if (err.isOperational) {
    return res.status(statusCode).json({
      status,
      message: err.message,
      code: err.code || null,
    });
  }

  // Programming or unknown error: don't leak details
  console.error('💥 UNEXPECTED ERROR:', {
    name: err.name,
    message: err.message,
    code: err.code,
    stack: err.stack,
  });

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
};

// Specific error transformations
const handleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400, ERROR_CODES.VALIDATION.INVALID_ID_FORMAT);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(
    `Duplicate field: "${field}" with value "${value}"`,
    400,
    ERROR_CODES.VALIDATION.DUPLICATE_FIELD_VALUE,
  );
};

const handleValidationErrorDB = (err) => {
  const messages = Object.values(err.errors).map((el) => el.message);
  return new AppError(
    `Invalid input data. ${messages.join('. ')}`,
    400,
    ERROR_CODES.VALIDATION.INPUT_VALIDATION_ERROR,
  );
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401, ERROR_CODES.AUTH.JWT_INVALID);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401, ERROR_CODES.AUTH.JWT_EXPIRED);

// Global error handler middleware
module.exports = (err, _req, res, _next) => {
  // eslint-disable-next-line no-param-reassign
  err.statusCode = err.statusCode || 500;
  // eslint-disable-next-line no-param-reassign
  err.status = err.status || 'error';

  // Development environment: show full error
  if (process.env.NODE_ENV === 'development') {
    return sendErrorDev(err, res);
  }

  // Production environment: transform known errors
  let error = err;

  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFieldsDB(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

  return sendErrorProd(error, res);
};
