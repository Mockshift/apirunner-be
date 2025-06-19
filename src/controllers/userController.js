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
  const users = await User.find(); // get all users

  res.status(200).json({
    status: common.STATUS_TYPE.SUCCESS,
    result: users.length,
    data: { users },
  });
});

/**
 * Soft deletes a user by setting their `isDeleted` flag to false.
 * Does not remove the user document from the database.
 *
 * @route DELETE /api/v1/users/:id
 */
const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isDeleted: false });

  if (!user) {
    next(
      new AppError(`No user found with ID: ${req.params.id}`, 404, ERROR_CODES.USER.USER_NOT_FOUND),
    );
  }

  res.status(204).json({
    status: common.STATUS_TYPE.SUCCESS,
    data: null,
  });
});

const updateUserRole = catchAsync(async (req, res, next) => {
  const validRoles = Object.values(common.USER_ROLE_TYPE);

  if (!validRoles.includes(req.body.role)) {
    next(
      new AppError(
        'The provided role is not recognized!',
        400,
        ERROR_CODES.VALIDATION.INVALID_USER_ROLE,
      ),
    );
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });

  if (!user) {
    next(
      new AppError('No user found with the specified ID.', 404, ERROR_CODES.USER.USER_NOT_FOUND),
    );
  }

  res.status(200).json({
    status: common.STATUS_TYPE.SUCCESS,
    data: user,
  });
});

module.exports = {
  getAllUsers,
  deleteUser,
  updateUserRole,
};
