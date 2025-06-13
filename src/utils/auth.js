const { ERROR_CODES } = require('../constants/errorCodes');
const AppError = require('./appError');

function extractBearerToken(req) {
  const header = req.headers.authorization?.trim();

  if (!header?.toLowerCase().startsWith('bearer')) {
    throw new AppError(
      'Authorization header is missing or malformed.',
      401,
      ERROR_CODES.AUTH.NOT_LOGGED_IN,
    );
  }

  const token = header.split(' ')[1];

  if (!token) {
    throw new AppError(
      'Token is missing in the Authorization header.',
      401,
      ERROR_CODES.AUTH.JWT_INVALID,
    );
  }

  return token;
}

module.exports = { extractBearerToken };
