const { STATUS_TYPE } = require('../constants/common');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Set the error message from the built-in Error class.

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? STATUS_TYPE.FAIL : STATUS_TYPE.ERROR;
    this.isOperational = true; // Mark as an operational error (not a programming error)

    Error.captureStackTrace(this, this.constructor);
    // Remove constructor from the stack trace for cleaner debugging
  }
}

module.exports = AppError;
