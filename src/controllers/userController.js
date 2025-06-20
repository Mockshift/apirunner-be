const User = require('../models/userModel');
const common = require('../constants/common');
const { ERROR_CODES } = require('../constants/errorCodes');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Retrieves all users from the database.
 * Responds with an array of user documents.
 *
 * @route GET /api/v1/users
 */
const getAllUsers = catchAsync(async (_req, res, _next) => {
  const users = await User.find().lean();

  return res.status(200).json({
    status: common.STATUS_TYPE.SUCCESS,
    result: users.length,
    data: {
      users,
    },
  });
});

/**
 * Soft deletes a user by setting their `isDeleted` flag to false.
 * Does not remove the user document from the database.
 *
 * @route DELETE /api/v1/users/:id
 */
const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isDeleted: true });

  if (!user) {
    return next(
      new AppError(`No user found with ID: ${req.params.id}`, 404, ERROR_CODES.USER.USER_NOT_FOUND),
    );
  }

  return res.status(204).json({
    status: common.STATUS_TYPE.SUCCESS,
    data: null,
  });
});

const updateUserRole = catchAsync(async (req, res, next) => {
  const { systemRole } = req.body;

  if (!systemRole) {
    return next(
      new AppError(
        'systemRole is required in the request body.',
        400,
        ERROR_CODES.VALIDATION.MISSING_FIELDS,
      ),
    );
  }

  const validRoles = Object.values(common.SYSTEM_ROLE);

  if (!validRoles.includes(systemRole)) {
    return next(
      new AppError(
        `Invalid systemRole: "${systemRole}". Allowed roles are: ${validRoles.join(', ')}`,
        400,
        ERROR_CODES.VALIDATION.INVALID_USER_ROLE,
      ),
    );
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    { systemRole },
    { new: true, runValidators: true },
  );

  if (!updatedUser) {
    return next(
      new AppError('No user found with the specified ID.', 404, ERROR_CODES.USER.USER_NOT_FOUND),
    );
  }

  return res.status(200).json({
    status: common.STATUS_TYPE.SUCCESS,
    data: {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        systemRole: updatedUser.systemRole,
      },
    },
  });
});

module.exports = {
  getAllUsers,
  deleteUser,
  updateUserRole,
};
