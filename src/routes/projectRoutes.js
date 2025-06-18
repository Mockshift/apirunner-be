const express = require('express');
const projectController = require('../controllers/projectController');
const authContoller = require('../controllers/authController');

const router = express.Router();

// TODO: validate eklenecek
router.route('/').post(authContoller.protect, projectController.createProject);

module.exports = router;
