const express = require('express');
const router = express.Router();
const { getAllPosts, getPostById } = require('../controllers/postController');

// @route   GET /api/posts
// @desc    Get all posts (summaries)
router.get('/', getAllPosts);

// @route   GET /api/posts/:id
// @desc    Get a single post by its ID
router.get('/:id', getPostById);

module.exports = router;
