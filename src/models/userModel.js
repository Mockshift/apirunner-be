const mongoose = require('mongoose');
const validator = require('validator');
const { USER_ROLE_TYPE } = require('../constants/common');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email!'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password!'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      validator(el) {
        return el === this.password;
      },
      message: 'Passwords do not match!',
    },
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
