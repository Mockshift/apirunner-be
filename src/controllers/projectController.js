const { STATUS_TYPE, PROJECT_ROLE } = require('../constants/common');
const Project = require('../models/projectModel');
const ProjectMember = require('../models/projectMemberModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { ERROR_CODES } = require('../constants/errorCodes');

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
const getProjectDetail = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId).populate({
    path: 'ownerId',
    select: 'id name',
  });

  if (!project) {
    return next(new AppError('Project not found.', 404, ERROR_CODES.PROJECT.NOT_FOUND));
  }

  const membersCount = await ProjectMember.countDocuments({ projectId, active: true });

  return res.status(200).json({
    status: STATUS_TYPE.SUCCESS,
    data: {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      owner: project.ownerId, // populated { id, name }
      membersCount,
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
  const { projectId } = req.params;

  const members = await ProjectMember.find({
    projectId,
    active: true,
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

  const formatted = members.map((member) => ({
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

module.exports = {
  createProject,
  getMyProjects,
  getProjectDetail,
  getProjectMembers,
};
