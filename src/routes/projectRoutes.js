const express = require('express');
const projectController = require('../controllers/projectController');
const projectValidators = require('../validators/projectValidator');
const validate = require('../middlewares/validate');
const protect = require('../middlewares/protect');
const authorizeProjectAccess = require('../middlewares/authorizeProjectAccess');
const restrictProjectRole = require('../middlewares/restrictProjectRole');
const { PROJECT_ROLE } = require('../constants/common');

const router = express.Router();

router
  .route('/')
  .post(protect, projectValidators.createProject, validate, projectController.createProject)
  .get(protect, projectController.getMyProjects);

router
  .route('/:projectId')
  .get(protect, authorizeProjectAccess, projectController.getProjectDetail);

router
  .route('/:projectId/members')
  .get(protect, authorizeProjectAccess, projectController.getProjectMembers)
  .post(
    protect,
    projectValidators.addProjectMember,
    validate,
    authorizeProjectAccess,
    restrictProjectRole(PROJECT_ROLE.OWNER, PROJECT_ROLE.EDITOR),
    projectController.addProjectMember,
  );

module.exports = router;
