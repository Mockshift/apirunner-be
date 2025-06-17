const { ERROR_CODES } = require('../constants/errorCodes');
const AppError = require('./appError');

/**
 * Finds a document by ID and throws an AppError if not found.
 *
 * @param {Model} Model - A Mongoose model (e.g., User, Project)
 * @param {string} id - The document's _id
 * @param {Object} options
 * @param {string[]} [options.select] - Fields to select (e.g. ['+password'])
 * @param {string} [options.message] - Custom error message
 * @param {number} [options.statusCode=404] - HTTP status code
 * @param {string} [options.code] - Custom error code (e.g., ERROR_CODES.USER.NOT_FOUND)
 * @returns {Promise<Object>} - The found document
 */
const findByIdOrThrow = async (Model, id, options = {}) => {
  const query = Model.findById(id);

  if (options.select) {
    query.select(options.select.join(' '));
  }

  const doc = await query;

  if (!doc) {
    throw new AppError(
      options.message || `${Model.modelName} not found`,
      options.statusCode || 404,
      options.code || ERROR_CODES.GENERAL.GENERIC_SERVER_ERROR,
    );
  }

  return doc;
};

// TODO: find(), findByIdAndUpdate()

module.exports = { findByIdOrThrow };
