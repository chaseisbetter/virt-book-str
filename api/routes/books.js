const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// @route   GET api/books
// @desc    Get all featured books
// @access  Public
router.get('/', bookController.getBooks);

// @route   GET api/books/:id
// @desc    Get a single book by its ID
// @access  Public
router.get('/:id', bookController.getBookById);

// @route   POST api/books/:id/reviews
// @desc    Add a review for a book
// @access  Private (for now, public)
router.post('/:id/reviews', bookController.addBookReview);

module.exports = router;
