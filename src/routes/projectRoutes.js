const express = require('express');
const projectController = require('../controllers/projectController');
const projectValidators = require('../validators/projectValidator');
const validate = require('../middlewares/validate');
const protect = require('../middlewares/protect');
const authorizeProjectAccess = require('../middlewares/authorizeProjectAccess');

const router = express.Router();

router
  .route('/')
  .post(projectValidators.createProject, validate, protect, projectController.createProject)
  .get(protect, projectController.getMyProjects);

router
  .route('/:projectId')
  .get(protect, authorizeProjectAccess, projectController.getProjectDetail);

router
  .route('/:projectId/members')
  .get(protect, authorizeProjectAccess, projectController.getProjectMembers);

module.exports = router;
