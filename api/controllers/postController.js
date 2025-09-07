const posts = require('../../data/posts.json');

// Get all posts (for blog listing page)
const getAllPosts = (req, res) => {
    // Return a summary for the listing page
    const summaries = posts.map(post => ({
        id: post.id,
        title: post.title,
        author: post.author,
        publish_date: post.publish_date,
        tags: post.tags,
        hero_image: post.hero_image,
        snippet: post.content_html.substring(0, 200) + '...'
    }));
    res.json(summaries);
};

// Get a single post by ID
const getPostById = (req, res) => {
    const postId = parseInt(req.params.id, 10);
    const post = posts.find(p => p.id === postId);

    if (post) {
        res.json(post);
    } else {
        res.status(404).json({ message: 'Post not found in the ancient library.' });
    }
};

module.exports = {
    getAllPosts,
    getPostById,
};
