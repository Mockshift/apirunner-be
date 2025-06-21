const jwt = require('jsonwebtoken');
const { promisify } = require('util');

/**
 * Creates a JWT token with provided payload and options.
 *
 * @param {Object} payload - Data to include in the token.
 * @param {Object} [options={}] - Optional JWT config (e.g., expiresIn).
 * @returns {string} - Signed token.
 */
const signToken = (payload, options = {}) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
    ...options,
  });
};

/**
 * Verifies a JWT token and returns the decoded payload.
 *
 * Returns a Promise that resolves to the payload object (e.g. { id, systemRole, iat, exp }).
 * Use with `await` inside a try/catch block to handle token verification errors.
 *
 * Example:
 *   const decoded = await verifyToken(token);
 *   console.log(decoded.id); // user ID from the token
 */
const verifyToken = promisify(jwt.verify);

module.exports = {
  signToken,
  verifyToken,
};
