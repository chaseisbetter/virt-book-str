const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// @route   GET api/search
// @desc    Search for books
// @access  Public
router.get('/', searchController.searchBooks);

// @route   GET api/search/autocomplete
// @desc    Get autocomplete suggestions
// @access  Public
router.get('/autocomplete', searchController.getAutocompleteSuggestions);

module.exports = router;
