const { STATUS_TYPE, PROJECT_MEMBER_ROLE } = require('../constants/common');
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
    role: PROJECT_MEMBER_ROLE.OWNER,
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

const getMyProjects = catchAsync(async (req, res, next) => {
  const membershipRecords = await ProjectMember.find({ userId: req.user.id })
    .select('projectId role')
    .populate({
      path: 'projectId',
      select: 'id name description',
    })
    .lean();

  const formattedProjects = membershipRecords
    .filter((entry) => entry.projectId)
    .map((entry) => ({
      id: entry.projectId.id,
      name: entry.projectId.name,
      description: entry.projectId.description,
      role: entry.role,
    }));

  if (formattedProjects.length === 0) {
    return next(
      new AppError('No projects found for this user.', 404, ERROR_CODES.PROJECT.NOT_FOUND_FOR_USER),
    );
  }

  return res.status(200).json({
    status: STATUS_TYPE.SUCCESS,
    result: formattedProjects.length,
    data: { projects: formattedProjects },
  });
});

module.exports = {
  createProject,
  getMyProjects,
};
