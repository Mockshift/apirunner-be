const AppError = require('../utils/appError');

// Error response in development environment
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    code: err.code || null,
    stack: err.stack,
  });
};

/**
 * Handles error responses in production environment.
 * Differentiates between operational (trusted) and programming/unknown errors.
 */
const sendErrorProd = (err, res) => {
  const statusCode = err.statusCode || 500;
  const status = err.status || 'error';

  if (err.isOperational) {
    // Trusted, expected error (e.g. AppError)
    return res.status(statusCode).json({
      status,
      message: err.message,
      code: err.code || null, // Include custom app error code
    });
  }

  // Unknown or programming error - don't expose internal details
  console.error('💥 UNEXPECTED ERROR:', {
    message: err.message,
    name: err.name,
    stack: err.stack,
    code: err.code,
  });

  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
};

// Specific error transformers
const handleCastErrorDB = (err) => new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  return new AppError(`Duplicate field: "${field}" with value "${value}"`, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid input data. ${errors.join('. ')}`, 400);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

// Global Error Handler
module.exports = (err, _req, res, _next) => {
  // eslint-disable-next-line no-param-reassign
  err.statusCode = err.statusCode || 500;
  // eslint-disable-next-line no-param-reassign
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    // Hataların referanslarını kopyalamak yeterli olmayabilir
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
