const { STATUS_TYPE } = require('../constants/common');
const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({
      status: STATUS_TYPE.ERROR,
      message: 'Something went very wrong!',
    });
  }
};

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

module.exports = (err, _req, res, _next) => {
  const error = {
    ...err,
    statusCode: err.statusCode || 500,
    status: err.status || STATUS_TYPE.ERROR,
  };

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    let processedError = { ...error };

    if (processedError.name === 'CastError') {
      processedError = handleCastErrorDB(processedError);
    }

    if (processedError.code === 11000) {
      processedError = handleDuplicateFieldsDB(processedError);
    }

    if (processedError.name === 'ValidationError') {
      processedError = handleValidationErrorDB(processedError);
    }

    if (processedError.name === 'JsonWebTokenError') {
      processedError = handleJWTError();
    }

    if (processedError.name === 'TokenExpiredError') {
      processedError = handleJWTExpiredError();
    }

    sendErrorProd(processedError, res);
  }
};
