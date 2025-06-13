const express = require('express');
const { validateSignup, validateLogin } = require('../validators/authValidator');
const validate = require('../middlewares/validate');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(authController.protect, userController.getAllUsers);
router.route('/:id').delete(userController.deleteUser).patch(userController.updateUserRole);

router.post('/signup', validateSignup, validate, authController.signup);
router.post('/login', validateLogin, validate, authController.login);

module.exports = router;
