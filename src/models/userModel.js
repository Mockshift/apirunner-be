const mongoose = require('mongoose');
const { USER_ROLE_TYPE } = require('../constants/common');

const userSchema = new mongoose.Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  passwordConfirm: {
    type: String,
    select: false,
  },
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

// This middleware will be executed before every query that starts with 'find' and gets only active users
userSchema.pre(/^find/, function excludeInactiveUsers(next) {
  this.find({ active: { $ne: false } });
  this.select('-__v');
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;

// Admin
