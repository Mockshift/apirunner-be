const User = require('../models/userModel');
const { STATUS_TYPE } = require('../constants/common');

exports.getAllUsers = async (req, res) => {
  const users = await User.find(); // get all users

  try {
    res.status(200).json({
      status: STATUS_TYPE.SUCCESS,
      result: users.length,
      data: users,
    });
  } catch (error) {
    console.error('getAllUsers error: ', error);

    res.status(500).json({
      status: STATUS_TYPE.ERROR,
      message: 'An error occurred while fetching users.',
      error: error.message,
    });
  }
};
