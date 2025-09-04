document.addEventListener('DOMContentLoaded', () => {
    const postContent = document.getElementById('post-content');
    const pollSection = document.getElementById('poll-section');
    const commentsContainer = document.getElementById('comments-container');
    const commentForm = document.getElementById('comment-form');

    const getPostId = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    };

    const displayError = (message) => {
        postContent.innerHTML = `<p class="error-message">${message}</p>`;
    };

    const fetchPost = async (postId) => {
        try {
            const res = await fetch(`/api/posts/${postId}`);
            if (!res.ok) {
                throw new Error('Could not retrieve this story from the archives.');
            }
            const post = await res.json();
            renderPost(post);
            renderPoll(post.poll);
            renderComments(post.comments);
            handleCommentSubmission(postId);
        } catch (error) {
            displayError(error.message);
        }
    };

    const renderPost = (post) => {
        document.title = `${post.title} | Eternal Ink Blog`;
        const postHTML = `
            <h1>${post.title}</h1>
            <div class="post-meta">
                <span>By ${post.author}</span> |
                <span>${new Date(post.publish_date).toLocaleDateString()}</span>
            </div>
            <img src="${post.hero_image}" alt="${post.title}" class="post-hero-image">
            <div class="post-body">${post.content_html}</div>
        `;
        postContent.innerHTML = postHTML;
    };

    const renderPoll = (poll) => {
        if (!poll) {
            pollSection.style.display = 'none';
            return;
        }
        let pollHTML = `<h3>${poll.question}</h3>`;
        poll.options.forEach((option, index) => {
            pollHTML += `
                <div class="poll-option">
                    <label>${option}</label>
                    <button class="btn-vote" data-index="${index}">Vote</button>
                    <span>(${poll.votes[index]} votes)</span>
                </div>
            `;
        });
        pollSection.innerHTML = pollHTML;

        // Add basic voting logic (client-side only for now)
        document.querySelectorAll('.btn-vote').forEach(button => {
            button.addEventListener('click', (e) => {
                alert('Thank you for your vote!');
                // In a real app, this would send a request to the server.
            });
        });
    };

    const renderComments = (comments) => {
        if (!comments || comments.length === 0) {
            commentsContainer.innerHTML = '<p>Be the first to share your thoughts!</p>';
            return;
        }
        let commentsHTML = '';
        comments.forEach(comment => {
            commentsHTML += `
                <div class="comment-card">
                    <p><strong>${comment.user}</strong> - <em>${new Date(comment.date).toLocaleDateString()}</em></p>
                    <p>${comment.text}</p>
                </div>
            `;
        });
        commentsContainer.innerHTML = commentsHTML;
    };

    const handleCommentSubmission = (postId) => {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = e.target.user.value;
            const text = e.target.text.value;

            // Optimistically add the comment to the UI
            const newComment = { user, text, date: new Date().toISOString() };
            const commentCard = document.createElement('div');
            commentCard.className = 'comment-card';
            commentCard.innerHTML = `
                <p><strong>${newComment.user}</strong> - <em>${new Date(newComment.date).toLocaleDateString()}</em></p>
                <p>${newComment.text}</p>
            `;
            commentsContainer.appendChild(commentCard);

            // In a real app, you would send this to the server:
            // fetch(`/api/posts/${postId}/comments`, { method: 'POST', ... });

            e.target.reset();
        });
    };

    const postId = getPostId();
    if (postId) {
        fetchPost(postId);
    } else {
        displayError('No post specified. Please select an article from the blog.');
    }
});
