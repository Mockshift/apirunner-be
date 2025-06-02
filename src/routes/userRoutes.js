const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

router.route('/').get(userController.getAllUsers);
router.route('/:id').delete(userController.deleteUser).patch(userController.updateUserRole);

module.exports = router;
