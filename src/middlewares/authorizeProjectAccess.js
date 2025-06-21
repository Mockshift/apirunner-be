const ProjectMember = require('../models/projectMemberModel');
const AppError = require('../utils/appError');
const { ERROR_CODES } = require('../constants/errorCodes');

/**
 * Middleware: Checks if the authenticated user is an active member of the given projectId.
 *
 * - If membership exists, proceeds to the next middleware
 * - If not, responds with a 403 Forbidden error
 */
const authorizeProjectAccess = async (req, _res, next) => {
  const { projectId } = req.params;
  const userId = req.user.id;

  const membership = await ProjectMember.findOne({
    projectId,
    userId,
    active: true,
  }).lean();

  if (!membership) {
    return next(
      new AppError(
        'You are not authorized to access this project.',
        403,
        ERROR_CODES.PROJECT.NOT_FOUND_FOR_USER,
      ),
    );
  }

  // You can attach the membership info here for future role-based access control
  // Example: req.membership = membership;

  return next();
};

module.exports = authorizeProjectAccess;
