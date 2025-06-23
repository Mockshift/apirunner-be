const { ERROR_CODES } = require('../constants/errorCodes');
const AppError = require('../utils/appError');

module.exports = (...allowedRoles) => {
  return (req, _res, next) => {
    if (!req.projectMember || !allowedRoles.includes(req.projectMember.projectRole)) {
      return next(
        new AppError(
          'You do not have permission to perform this action on this project.',
          403,
          ERROR_CODES.AUTH.UNAUTHORIZED,
        ),
      );
    }

    return next();
  };
};
