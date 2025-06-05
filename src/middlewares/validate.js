const { validationResult } = require('express-validator');
const AppError = require('../utils/appError'); // kendi error sınıfın varsa
const { ERROR_CODES } = require('../constants/errorCodes');

module.exports = (req, _res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((err) => err.msg)
      .join('. ');
    return next(new AppError(message, 400, ERROR_CODES.MONGOOSE_VALIDATION_ERROR));
  }

  return next();
};
