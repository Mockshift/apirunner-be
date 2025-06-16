const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { USER_ROLE_TYPE } = require('../constants/common');
const applyBaseSchemaDefaults = require('../utils/baseModel');

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
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      // This only works on CREATE and SAVE!
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

/**
 * Hashes the user's password before saving, only if it was modified.
 * Also removes `passwordConfirm` field from the document.
 */
userSchema.pre('save', async function hashPasswordBeforeSave(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // Not persisted to the database
  this.passwordConfirm = undefined;

  return next();
});

/**
 * Filters out inactive users from all `find` queries.
 */
userSchema.pre(/^find/, function filterActiveUsers(next) {
  this.find({ active: { $ne: false } });
  next();
});

/**
 * Checks if the entered password matches the hashed one.
 *
 * @param {string} candidatePassword - Raw input password
 * @param {string} userPassword - Stored hashed password
 * @returns {Promise<boolean>} Whether the passwords match
 */
userSchema.methods.isPasswordCorrect = async function isPasswordCorrect(
  candidatePassword,
  userPassword,
) {
  return bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

applyBaseSchemaDefaults(userSchema);

module.exports = User;
