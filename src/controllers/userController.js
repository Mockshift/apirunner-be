const User = require('../models/userModel');
const common = require('../constants/common');
const errorCodes = require('../constants/errorCodes');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // get all users

    res.status(200).json({
      status: common.STATUS_TYPE.SUCCESS,
      result: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: common.STATUS_TYPE.ERROR,
      error: error.message,
      code: errorCodes.FETCH_USERS_ERROR,
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { active: false });

    if (!user) {
      res.status(404).json({
        status: common.STATUS_TYPE.FAIL,
        id: req.params.id,
        message: 'No user found with that ID!',
        code: errorCodes.USER_NOT_FOUND,
      });
    }

    res.status(204).json({
      status: common.STATUS_TYPE.SUCCESS,
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      status: common.STATUS_TYPE.ERROR,
      error: error.message,
      code: errorCodes.DELETE_USER_ERROR,
    });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const validRoles = Object.values(common.USER_ROLE_TYPE);
    console.log('💥 req.body: ', req.body);
    if (!validRoles.includes(req.body.role)) {
      res.status(404).json({
        status: common.STATUS_TYPE.FAIL,
        error: 'The provider role is not recognized !',
        code: errorCodes.INVALID_USER_ROLE,
      });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true },
    );

    if (!user) {
      res.status(404).json({
        status: common.STATUS_TYPE.FAIL,
        message: 'No user found with the specified ID.',
        code: errorCodes.USER_NOT_FOUND,
      });
    }

    res.status(200).json({
      status: common.STATUS_TYPE.SUCCESS,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: common.STATUS_TYPE.ERROR,
      error: error.message,
      code: errorCodes.UPDATE_USER_ROLE_ERROR,
    });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  updateUserRole,
};
