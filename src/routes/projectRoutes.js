const express = require('express');
const projectController = require('../controllers/projectController');
const authContoller = require('../controllers/authController');
const projectValidators = require('../validators/projectValidator');
const validate = require('../middlewares/validate');

const router = express.Router();

router
  .route('/')
  .post(
    projectValidators.createProject,
    validate,
    authContoller.protect,
    projectController.createProject,
  );

module.exports = router;
