const mongoose = require('mongoose');
const { USER_ROLE_TYPE } = require('../constants/common');

const userSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  passwordConfirm: String,
  active: {
    type: Boolean,
    default: true,
  },
  role: {
    type: String,
    default: USER_ROLE_TYPE.USER,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
