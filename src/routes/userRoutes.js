const express = require('express');
const authValidators = require('../validators/authValidator');
const validate = require('../middlewares/validate');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const protect = require('../middlewares/protect');

const router = express.Router();

router.route('/').get(protect, userController.getAllUsers);

router.post('/signup', authValidators.signup, validate, authController.signup);
router.post('/login', authValidators.login, validate, authController.login);
router.patch(
  '/updateMyPassword',
  protect,
  authValidators.updatePassword,
  validate,
  authController.updateMyPassword,
);

router.route('/:id').delete(userController.deleteUser).patch(userController.updateUserRole);

module.exports = router;
