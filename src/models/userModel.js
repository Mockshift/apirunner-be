const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { USER_ROLE_TYPE } = require('../constants/common');
const applyBaseSchemaDefaults = require('../utils/baseModel');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
    minlength: [3, 'Name must be at least 3 characters long.'],
    maxlength: [20, 'Name must be at most 20 characters long.'],
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
    minlength: [3, 'Password must be at least 3 characters long.'],
    maxlength: [20, 'Password must be at most 20 characters long.'],
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
  passwordChangedAt: {
    type: Date,
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
  this.find({ isDeleted: { $ne: false } });
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

/**
 * Checks whether the user has changed their password **after** the JWT was issued.
 *
 * This is used to invalidate tokens if a password change occurred
 * after the token was created — a key security check for sensitive routes.
 *
 * @param {number} JWTTimestamp - The `iat` (issued at) timestamp from the JWT, in seconds
 * @returns {boolean} True if password was changed after token was issued, otherwise false
 */
userSchema.methods.isChangedPassword = function isChangedPassword(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

applyBaseSchemaDefaults(userSchema);
const User = mongoose.model('User', userSchema);

module.exports = User;
