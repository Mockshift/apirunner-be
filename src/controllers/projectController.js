const { STATUS_TYPE, PROJECT_ROLE } = require('../constants/common');
const Project = require('../models/projectModel');
const ProjectMember = require('../models/projectMemberModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { ERROR_CODES } = require('../constants/errorCodes');
const User = require('../models/userModel');

/**
 * Creates a new project.
 * Responds with the created project including owner info.
 *
 * @route POST /api/v1/projects
 */
const createProject = catchAsync(async (req, res, _next) => {
  const { name, description } = req.body;

  const project = await Project.create({ name, description, ownerId: req.user.id });

  const populatedProject = await Project.findById(project.id).populate({
    path: 'ownerId',
    select: 'id name',
  });

  await ProjectMember.create({
    projectId: project.id,
    userId: req.user.id,
    projectRole: PROJECT_ROLE.OWNER,
  });

  return res.status(201).json({
    status: STATUS_TYPE.SUCCESS,
    data: {
      project: {
        id: populatedProject.id,
        name: populatedProject.name,
        description: populatedProject.description,
        createdAt: populatedProject.createdAt,
        owner: {
          id: populatedProject.ownerId.id,
          name: populatedProject.ownerId.name,
        },
      },
    },
  });
});

/**
 * Retrieves all projects the current user is a member of.
 * Includes project details and user's role in each project.
 *
 * @route GET /api/v1/projects
 */
const getMyProjects = catchAsync(async (req, res, next) => {
  const membershipRecords = await ProjectMember.find({ userId: req.user.id })
    .select('projectId projectRole')
    .populate({
      path: 'projectId',
      select: 'id name description',
    })
    .lean();

  const formattedProjects = membershipRecords
    .filter((entry) => entry.projectId)
    .map((entry) => ({
      id: entry.projectId._id,
      name: entry.projectId.name,
      description: entry.projectId.description,
      projectRole: entry.projectRole,
    }));

  if (formattedProjects.length === 0) {
    return next(
      new AppError('No projects found for this user.', 404, ERROR_CODES.PROJECT.NOT_FOUND_FOR_USER),
    );
  }

  return res.status(200).json({
    status: STATUS_TYPE.SUCCESS,
    result: formattedProjects.length,
    data: {
      projects: formattedProjects,
    },
  });
});

/**
 * Retrieves detailed information about a specific project.
 * Only accessible if the user is a member of the project.
 *
 * @route GET /api/v1/projects/:id
 */
const getProjectDetail = catchAsync(async (req, res, _next) => {
  const { project } = req;

  const membersCount = await ProjectMember.countDocuments({
    projectId: project._id,
    isDeleted: false,
  });

  return res.status(200).json({
    status: STATUS_TYPE.SUCCESS,
    data: {
      project: {
        id: project._id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt,
        owner: project.ownerId,
        membersCount,
      },
    },
  });
});

/**
 * Retrieves the list of active members for a specific project.
 * Only accessible if the authenticated user is a member of the project.
 *
 * @route GET /api/v1/projects/:projectId/members
 */
const getProjectMembers = catchAsync(async (req, res, next) => {
  const projectId = req.project._id;

  const members = await ProjectMember.find({
    projectId,
  })
    .populate({
      path: 'userId',
      select: 'id name email systemRole',
    })
    .lean();

  if (!members.length) {
    return next(
      new AppError('No members found for this project.', 404, ERROR_CODES.PROJECT.NOT_FOUND),
    );
  }
  const formatted = members
    .filter((m) => m.userId)
    .map((member) => ({
      id: member.userId._id,
      name: member.userId.name,
      email: member.userId.email,
      systemRole: member.userId.systemRole,
      projectRole: member.projectRole,
      joinedAt: member.joinedAt,
    }));

  return res.status(200).json({
    status: STATUS_TYPE.SUCCESS,
    result: formatted.length,
    data: {
      members: formatted,
    },
  });
});

/**
 * Lists active members of a project.
 * Accessible only to project members.
 *
 * @route GET /api/v1/projects/:projectId/members
 */
const addProjectMember = catchAsync(async (req, res, next) => {
  const { projectRole, email } = req.body;
  const { project } = req;

  // Check if an owner already exists
  if (projectRole === PROJECT_ROLE.OWNER) {
    return next(
      new AppError(
        'You cannot assign the owner role to another member. A project can have only one owner.',
        400,
        ERROR_CODES.PROJECT.OWNER_ALREADY_EXISTS,
      ),
    );
  }

  // Count current active members
  const memberCount = await ProjectMember.countDocuments({
    projectId: project._id,
    isDeleted: false,
  });

  if (memberCount >= 3) {
    return next(
      new AppError(
        'Maximum member limit reached for this project.',
        400,
        ERROR_CODES.PROJECT.MEMBER_LIMIT_REACHED,
      ),
    );
  }

  // Find user by email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError('User not found.', 404, ERROR_CODES.USER.USER_NOT_FOUND));
  }

  // Check if user is already a member of this project
  const existing = await ProjectMember.findOne({
    userId: user._id,
    projectId: project._id,
  });

  if (existing) {
    return next(
      new AppError(
        'User is already a member of this project.',
        409,
        ERROR_CODES.PROJECT.ALREADY_MEMBER,
      ),
    );
  }

  const member = await ProjectMember.create({
    userId: user._id,
    projectId: project._id,
    projectRole,
  });

  return res.status(201).json({
    status: STATUS_TYPE.SUCCESS,
    data: {
      member: {
        id: user._id,
        name: user.name,
        email: user.email,
        systemRole: user.systemRole,
        projectRoler: member.projectMember,
        joinedAt: member.joinedAt,
      },
    },
  });
});

/**
 * Removes a member from the project (soft delete).
 * Only owner or editor roles can perform this action.
 *
 * @route DELETE /api/v1/projects/:projectId/members/:userId
 */
const removeProjectMember = catchAsync(async (req, res, next) => {
  const { userId, projectId } = req.params;

  const memberToRemove = await ProjectMember.findOne({ projectId, userId });

  if (!memberToRemove) {
    return next(
      new AppError('No such member found in the project.', 404, ERROR_CODES.PROJECT.NOT_FOUND),
    );
  }

  const memberRole = memberToRemove.projectRole;

  // Prevent removal of the project owner
  if (memberRole === PROJECT_ROLE.OWNER) {
    return next(
      new AppError(
        'Owner cannot be removed from the project.',
        403,
        ERROR_CODES.PROJECT.OWNER_CANNOT_BE_REMOVED,
      ),
    );
  }

  memberToRemove.isDeleted = true;
  await memberToRemove.save();

  return res.sendStatus(204);
});

module.exports = {
  createProject,
  getMyProjects,
  getProjectDetail,
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
};
