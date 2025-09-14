document.addEventListener('DOMContentLoaded', () => {
    const featuredPostContainer = document.getElementById('featured-post-container');
    const postsGridContainer = document.getElementById('blog-posts-container');

    const displayError = (message) => {
        if(postsGridContainer) {
            postsGridContainer.innerHTML = `<p class="error-message">${message}</p>`;
        }
    };

    const fetchAndRenderPosts = async () => {
        try {
            const res = await fetch('/api/posts');
            if (!res.ok) {
                throw new Error('Could not fetch stories from the archives.');
            }
            const posts = await res.json();

            if (!posts || posts.length === 0) {
                displayError('The archives are quiet... no posts found.');
                return;
            }

            // Separate featured post (the first one) from the rest
            const [featuredPost, ...otherPosts] = posts;

            renderFeaturedPost(featuredPost);
            renderPostGrid(otherPosts);

        } catch (error) {
            displayError(error.message);
        }
    };

    const renderFeaturedPost = (post) => {
        if (!featuredPostContainer || !post) return;

        // Using the post-summary-card style for the featured post as well
        const featuredHTML = `
            <a href="post.html?id=${post.id}" style="text-decoration: none; color: inherit;">
                <div class="post-summary-card">
                    <img src="${post.hero_image}" alt="${post.title}" class="post-summary-image">
                    <div class="post-summary-content">
                        <h2>${post.title}</h2>
                        <div class="post-meta">
                            <span>By ${post.author}</span> |
                            <span>${new Date(post.publish_date).toLocaleDateString()}</span>
                        </div>
                        <p>${post.snippet}</p>
                    </div>
                </div>
            </a>
        `;
        featuredPostContainer.innerHTML = featuredHTML;
    };

    const renderPostGrid = (posts) => {
        if (!postsGridContainer || !posts || posts.length === 0) {
            // It's okay if there are no other posts, just the featured one
            postsGridContainer.innerHTML = '';
            return;
        }

        const postsHTML = posts.map(post => `
            <a href="post.html?id=${post.id}" style="text-decoration: none; color: inherit;">
                <div class="blog-post-card">
                    <div class="blog-post-card-image-wrapper">
                        <img src="${post.hero_image}" alt="${post.title}" class="blog-post-card-image">
                    </div>
                    <div class="blog-post-card-content">
                        <h3 class="blog-post-card-title">${post.title}</h3>
                        <div class="blog-post-card-meta">
                            <span>By ${post.author}</span> |
                            <span>${new Date(post.publish_date).toLocaleDateString()}</span>
                        </div>
                        <p class="blog-post-card-excerpt">${post.snippet}</p>
                    </div>
                </div>
            </a>
        `).join('');

        postsGridContainer.innerHTML = postsHTML;
    };

    fetchAndRenderPosts();
});
