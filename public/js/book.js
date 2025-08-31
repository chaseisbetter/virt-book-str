document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('book-detail-main');

    const getBookId = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    };

    const displayError = (message) => {
        mainContent.innerHTML = `<div class="container"><p class="error-message">${message}</p></div>`;
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 !== 0;
        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '★';
        }
        if (halfStar) {
            starsHTML += '½';
        }
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '☆';
        }
        return `<div class="stars">${starsHTML}</div>`;
    };

    const fetchBookData = async (bookId) => {
        try {
            const [bookRes, allBooksRes] = await Promise.all([
                fetch(`/api/books/${bookId}`),
                fetch('/api/books')
            ]);

            if (!bookRes.ok) {
                throw new Error('Could not find the tome you seek. It may have been lost to the shadows.');
            }

            const book = await bookRes.json();
            const allBooks = await allBooksRes.json();

            displayBookDetails(book);
            displaySimilarBooks(book, allBooks);
            setupCollapsibles();

        } catch (error) {
            displayError(error.message);
        }
    };

    const displayBookDetails = (book) => {
        document.title = `${book.title} | Eternal Ink Books`;

        document.getElementById('book-cover').src = book.cover_image;
        document.getElementById('book-cover').alt = `Cover of ${book.title}`;
        document.getElementById('book-title').textContent = book.title;
        document.getElementById('book-author').textContent = `by ${book.author}`;
        document.getElementById('book-tagline').textContent = book.tagline || '';

        if (book.rating) {
            document.getElementById('book-rating').innerHTML = renderStars(book.rating);
        }

        if (book.price && typeof book.price === 'object') {
            let priceHTML = `<span class="final-price">$${book.price.final.toFixed(2)}</span>`;
            if (book.price.discount_percent > 0) {
                priceHTML += ` <span class="base-price">$${book.price.base.toFixed(2)}</span>`;
            }
            document.getElementById('book-price').innerHTML = priceHTML;
        } else if (book.price) {
             document.getElementById('book-price').textContent = `$${book.price.toFixed(2)}`;
        }

        document.getElementById('book-long-description').textContent = book.long_description;
        document.getElementById('author-bio').textContent = book.author_bio;

        const reviewsSection = document.getElementById('reviews-section');
        if (book.reviews && book.reviews.length > 0) {
            let reviewsHTML = '';
            book.reviews.forEach(review => {
                reviewsHTML += `
                    <div class="review-card">
                        <div class="review-meta">
                            <strong>${review.user}</strong> - ${new Date(review.date).toLocaleDateString()}
                        </div>
                        <div class="review-rating">${renderStars(review.rating)}</div>
                        <p class="review-text">"${review.text}"</p>
                    </div>
                `;
            });
            reviewsSection.innerHTML = reviewsHTML;
        } else {
            reviewsSection.innerHTML = '<p>No reviews for this tome yet. Be the first to share your thoughts!</p>';
        }
    };

    const displaySimilarBooks = (currentBook, allBooks) => {
        const similarBooksGrid = document.getElementById('similar-books-grid');
        const similarBooks = allBooks.filter(book =>
            book.id !== currentBook.id && book.category && currentBook.category && book.category.main === currentBook.category.main
        ).slice(0, 4);

        if (similarBooks.length > 0) {
            let similarBooksHTML = '';
            similarBooks.forEach(book => {
                similarBooksHTML += `
                    <a href="book.html?id=${book.id}" class="book-card-link">
                        <div class="book-card">
                            <img src="${book.cover_image}" alt="Cover of ${book.title}" class="book-cover">
                            <h3 class="book-title">${book.title}</h3>
                            <p class="book-author">${book.author}</p>
                            ${renderStars(book.rating)}
                        </div>
                    </a>
                `;
            });
            similarBooksGrid.innerHTML = similarBooksHTML;
        } else {
            document.getElementById('similar-books').style.display = 'none';
        }
    };

    const setupCollapsibles = () => {
        const collapsibles = document.querySelectorAll('.collapsible-btn');
        collapsibles.forEach(btn => {
            btn.addEventListener('click', function() {
                this.classList.toggle('active');
                const content = this.nextElementSibling;
                if (content.style.maxHeight) {
                    content.style.maxHeight = null;
                } else {
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        });
    };

    const bookId = getBookId();
    if (bookId) {
        fetchBookData(bookId);
    } else {
        displayError('No book specified. Please select a tome from our collection.');
    }
});
