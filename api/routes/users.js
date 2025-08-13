const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// @route   GET api/users/profile
// @desc    Get user profile data
// @access  Private (to be implemented)
router.get('/profile', userController.getUserProfile);

module.exports = router;
