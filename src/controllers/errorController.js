const { STATUS_TYPE } = require('../constants/common');

module.exports = (err, _req, res, _next) => {
  const customError = {
    ...err,
    statusCode: err.statusCode || 500,
    status: err.status || STATUS_TYPE.ERROR,
  };

  res.status(err.statusCode).json({
    status: customError.status,
    message: err.message,
  });
};
