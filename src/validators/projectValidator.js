const { body } = require('express-validator');
const { PROJECT_ROLE } = require('../constants/common');

const projectValidators = {
  createProject: [
    body('name')
      .notEmpty()
      .withMessage('name is required')
      .isLength({ min: 3, max: 20 })
      .withMessage('name must be between 3 and 20 characters'),

    body('description')
      .optional()
      .isLength({ max: 300 })
      .withMessage('Description must be at most 300 characters long'),
  ],
  addProjectMember: [
    body('email')
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email must be a valid format'),

    body('projectRole')
      .optional()
      .isIn(Object.values(PROJECT_ROLE))
      .withMessage(`projectRole must be one of: ${Object.values(PROJECT_ROLE).join(', ')}`),
  ],
};

module.exports = projectValidators;
