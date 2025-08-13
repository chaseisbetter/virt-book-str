document.addEventListener('DOMContentLoaded', () => {
    const mainElement = document.getElementById('book-detail-main');
    const urlParams = new URLSearchParams(window.location.search);
    // This is incorrect for a path parameter. I should be getting it from the path,
    // but I haven't set up the server for that. I'll assume a query param for now.
    // A better way would be /book.html?id=1
    // I need to update the links in the catalog to use this format.
    const bookId = urlParams.get('id');

    if (!bookId) {
        mainElement.innerHTML = '<p>No book ID provided. Please select a book from the catalog.</p>';
        return;
    }

    const fetchBookData = async () => {
        try {
            const res = await fetch(`/api/books/${bookId}`);
            if (!res.ok) {
                throw new Error('This tome could not be found in our library.');
            }
            const book = await res.json();

            document.title = `${book.title} | Eternal Ink Books`;
            renderBookDetails(book);

        } catch (err) {
            mainElement.innerHTML = `<p class="error-message">${err.message}</p>`;
        }
    };

    const renderBookDetails = (book) => {
        const stars = '★'.repeat(Math.floor(book.rating)) + '☆'.repeat(5 - Math.floor(book.rating));
        const reviewCount = book.reviews ? book.reviews.length : 0;

        const html = `
            <div class="book-detail-container">
                <div class="book-detail-left">
                    <img src="${book.cover_image}" alt="Cover of ${book.title}" class="book-detail-cover">
                </div>
                <div class="book-detail-right">
                    <h1 class="book-detail-title">${book.title}</h1>
                    <p class="book-detail-author">by ${book.author}</p>
                    <div class="book-detail-rating">
                        <span class="stars">${stars}</span>
                        <span>${book.rating.toFixed(1)} (${reviewCount} reviews)</span>
                    </div>
                    <p class="book-detail-price">$${book.price.toFixed(2)}</p>
                    <p class="book-detail-tagline">${book.tagline}</p>
                    <div class="book-detail-actions">
                        <button class="btn btn-primary">Add to Cart</button>
                        <button class="btn btn-secondary">Buy Now</button>
                    </div>
                    <div class="book-long-description">
                        <h3>Description</h3>
                        <p>${book.long_description.replace(/\n/g, '<br>')}</p>
                    </div>
                </div>
            </div>
            <div id="extra-sections" class="container">
                <!-- Author/Reviews/Related sections will go here -->
            </div>
        `;
        mainElement.innerHTML = html;

        // --- Render extra sections ---
        const extraSectionsContainer = document.getElementById('extra-sections');
        const extraSectionsHTML = `
            <div class="author-section">
                <button class="collapsible-btn active" data-target="author-content">About the Author</button>
                <div id="author-content" class="collapsible-content" style="max-height: 100px;">
                    <p>${book.author_bio}</p>
                </div>
            </div>
            <div class="reviews-section">
                <h3>Customer Reviews</h3>
                <div id="reviews-list">
                    <!-- Reviews will be rendered in the next step -->
                </div>
                <form id="review-form">
                    <!-- Review form will be built in the next step -->
                </form>
            </div>
        `;
        extraSectionsContainer.innerHTML = extraSectionsHTML;

        // --- Add collapsible functionality ---
        document.querySelectorAll('.collapsible-btn').forEach(button => {
            button.addEventListener('click', function() {
                this.classList.toggle('active');
                const content = document.getElementById(this.dataset.target);
                if (content.style.maxHeight){
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                }
            });
        });

        // --- Render Reviews & Form ---
        const reviewsList = document.getElementById('reviews-list');
        const reviewFormContainer = document.getElementById('review-form');

        const renderReviews = (reviews) => {
            if (reviews && reviews.length > 0) {
                reviewsList.innerHTML = reviews.map(review => {
                    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                    return `
                        <div class="review-card">
                            <div class="review-rating stars">${stars}</div>
                            <p class="review-meta">by <strong>${review.user}</strong> on ${review.date}</p>
                            <p class="review-text">${review.text}</p>
                        </div>
                    `;
                }).join('');
            } else {
                reviewsList.innerHTML = '<p>No reviews yet. Be the first to write one!</p>';
            }
        };

        const renderReviewForm = () => {
            reviewFormContainer.innerHTML = `
                <h4>Write a Review</h4>
                <div class="form-group">
                    <label for="review-rating">Rating</label>
                    <select id="review-rating" name="rating">
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="review-text">Review</label>
                    <textarea id="review-text" name="text" rows="4" required></textarea>
                </div>
                <button type="submit" class="btn">Submit Review</button>
                <p id="review-form-message"></p>
            `;
        };

        renderReviews(book.reviews);
        renderReviewForm();

        // --- Handle Review Form Submission ---
        reviewFormContainer.addEventListener('submit', async (e) => {
            e.preventDefault();
            const messageEl = document.getElementById('review-form-message');
            const rating = e.target.rating.value;
            const text = e.target.text.value;

            try {
                const res = await fetch(`/api/books/${bookId}/reviews`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ rating, text, user: 'BookWyrm' }) // User is hardcoded for now
                });
                const newReview = await res.json();
                if (!res.ok) throw new Error(newReview.message || 'Failed to submit review.');

                // Optimistically add to UI
                book.reviews.push(newReview);
                renderReviews(book.reviews);
                e.target.reset(); // Clear the form
                messageEl.textContent = "Review submitted!";
                messageEl.style.color = 'var(--gold)';

            } catch (err) {
                messageEl.textContent = err.message;
                messageEl.style.color = 'var(--burgundy)';
            }
        });

        // --- Render Related Books ---
        const renderRelatedBooks = async (genre, currentBookId) => {
            const relatedBooksContainer = document.createElement('div');
            relatedBooksContainer.className = 'related-books-section';
            relatedBooksContainer.innerHTML = '<h3>Related Tomes</h3>';

            const bookGrid = document.createElement('div');
            bookGrid.className = 'book-grid';
            relatedBooksContainer.appendChild(bookGrid);

            extraSectionsContainer.appendChild(relatedBooksContainer);

            try {
                const res = await fetch(`/api/search?genre=${encodeURIComponent(genre)}`);
                const { books } = await res.json();

                const related = books
                    .filter(book => book.id !== currentBookId)
                    .slice(0, 4); // Show up to 4 related books

                if (related.length > 0) {
                    let relatedHTML = '';
                    related.forEach(book => {
                        const stars = '★'.repeat(Math.floor(book.rating)) + '☆'.repeat(5 - Math.floor(book.rating));
                        relatedHTML += `
                            <a href="book.html?id=${book.id}" class="book-card-link">
                                <div class="book-card">
                                    <div class="book-cover-wrapper"><img src="${book.cover_image}" alt="Cover of ${book.title}" class="book-cover"></div>
                                    <h3 class="book-title">${book.title}</h3>
                                    <p class="book-author">${book.author}</p>
                                    <div class="book-rating"><span class="stars">${stars}</span></div>
                                    <p class="book-price">$${book.price.toFixed(2)}</p>
                                </div>
                            </a>`;
                    });
                    bookGrid.innerHTML = relatedHTML;
                } else {
                    bookGrid.innerHTML = '<p>No other tomes found in this genre.</p>';
                }
            } catch (err) {
                bookGrid.innerHTML = '<p>Could not load related books.</p>';
            }
        };

        renderRelatedBooks(book.genre, book.id);
    };

    fetchBookData();
});
