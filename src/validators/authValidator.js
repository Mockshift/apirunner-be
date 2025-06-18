// validators/authValidators.js

const { body } = require('express-validator');

const authValidators = {
  signup: [
    body('name')
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ min: 3, max: 20 })
      .withMessage('Name must be between 3 and 20 characters'),
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 8, max: 64 })
      .withMessage('Password must be between 8 and 64 characters long.'),
    body('passwordConfirm')
      .notEmpty()
      .withMessage('Please confirm your password')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
  ],

  login: [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],

  updatePassword: [
    body('password').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 8, max: 64 })
      .withMessage('Password must be between 8 and 64 characters long.'),
    body('newPasswordConfirm')
      .notEmpty()
      .withMessage('Please confirm your new password')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('New password and confirmation do not match');
        }
        return true;
      }),
  ],
};

module.exports = authValidators;
