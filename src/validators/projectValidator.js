const { body } = require('express-validator');

const projectValidators = {
  createProject: [
    body('name')
      .notEmpty()
      .withMessage('Project name is required')
      .isLength({ min: 3, max: 20 })
      .withMessage('Project name must be between 3 and 20 characters'),

    body('description')
      .optional()
      .isLength({ max: 300 })
      .withMessage('Description must be at most 300 characters long'),
  ],
};

module.exports = projectValidators;
