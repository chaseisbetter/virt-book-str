document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('bestsellers-grid-container');

    if (container) {
        const fetchAndDisplayBestsellers = async () => {
            try {
                const res = await fetch('/api/books');
                if (!res.ok) {
                    throw new Error('Could not fetch bestsellers.');
                }
                let books = await res.json();

                // Sort books by rating, highest first
                books.sort((a, b) => b.rating.average - a.rating.average);

                // Clear container and render cards
                container.innerHTML = '';
                books.forEach((book, index) => {
                    const cardLink = document.createElement('a');
                    cardLink.href = `book.html?id=${book.id}`;
                    cardLink.className = 'book-card-link';

                    const card = document.createElement('div');
                    card.className = 'card book-card';

                    // Add rank badge for top 10
                    if (index < 10) {
                        const badge = document.createElement('div');
                        badge.className = 'card-badge rank';
                        badge.textContent = `#${index + 1}`;
                        card.appendChild(badge);
                    }

                    card.innerHTML += `
                        <img src="${book.cover_image}" alt="Cover of ${book.title}" class="book-cover">
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-author">${book.author}</p>
                        <div class="book-rating">
                            <!-- Star rating could be added here -->
                            <span>${book.rating.average.toFixed(1)}/5.0</span>
                        </div>
                        <div class="book-price">$${book.price.final.toFixed(2)}</div>
                    `;
                    cardLink.appendChild(card);
                    container.appendChild(cardLink);
                });

            } catch (error) {
                container.innerHTML = `<p>Error loading books: ${error.message}</p>`;
            }
        };

        fetchAndDisplayBestsellers();
    }
});
