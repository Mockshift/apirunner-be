const ProjectMember = require('../models/projectMemberModel');
const AppError = require('../utils/appError');
const { ERROR_CODES } = require('../constants/errorCodes');
const Project = require('../models/projectModel');

/**
 * Middleware to verify whether the authenticated user is a member of the given project.
 * Attaches populated project and membership info to the request object.
 */
const authorizeProjectAccess = async (req, _res, next) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  if (!projectId || !userId) {
    return next(
      new AppError(
        'Missing project or user information.',
        400,
        ERROR_CODES.VALIDATION.MISSING_FIELDS,
      ),
    );
  }

  const membership = await ProjectMember.findOne({
    projectId,
    userId,
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

  const project = await Project.findById(projectId)
    .populate({
      path: 'ownerId',
      select: 'id name email',
    })
    .lean();

  if (!project) {
    return next(new AppError('Project not found.', 404, ERROR_CODES.PROJECT.NOT_FOUND));
  }

  req.projectMember = membership;
  req.project = project;

  return next();
};

module.exports = authorizeProjectAccess;
