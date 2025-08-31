document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.getElementById('blog-posts-container');

    const displayError = (message) => {
        postsContainer.innerHTML = `<p class="error-message">${message}</p>`;
    };

    const fetchPosts = async () => {
        try {
            const res = await fetch('/api/posts');
            if (!res.ok) {
                throw new Error('Could not fetch stories from the archives.');
            }
            const posts = await res.json();
            renderPosts(posts);
        } catch (error) {
            displayError(error.message);
        }
    };

    const renderPosts = (posts) => {
        if (!posts || posts.length === 0) {
            postsContainer.innerHTML = '<p>The archives are quiet... no posts found.</p>';
            return;
        }

        let postsHTML = '';
        posts.forEach(post => {
            postsHTML += `
                <div class="post-summary-card">
                    <img src="${post.hero_image}" alt="${post.title}" class="post-summary-image">
                    <div class="post-summary-content">
                        <h2>${post.title}</h2>
                        <div class="post-meta">
                            <span>By ${post.author}</span> |
                            <span>${new Date(post.publish_date).toLocaleDateString()}</span>
                        </div>
                        <p>${post.snippet}</p>
                        <a href="post.html?id=${post.id}" class="btn">Read More</a>
                    </div>
                </div>
            `;
        });
        postsContainer.innerHTML = postsHTML;
    };

    fetchPosts();
});
