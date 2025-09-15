document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('new-releases-grid-container');

    if (container) {
        const fetchAndDisplayNewReleases = async () => {
            try {
                const res = await fetch('/api/books');
                if (!res.ok) {
                    throw new Error('Could not fetch new releases.');
                }
                let books = await res.json();

                // Sort books by publish date, newest first
                books.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));

                // Clear container and render cards
                container.innerHTML = '';
                books.forEach(book => {
                    const cardLink = document.createElement('a');
                    cardLink.href = `book.html?id=${book.id}`;
                    cardLink.className = 'book-card-link';

                    const card = document.createElement('div');
                    card.className = 'card book-card'; // Use the standard card styles

                    // Add "Just Dropped" badge for recent books (e.g., within last 30 days)
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    if (new Date(book.publish_date) > thirtyDaysAgo) {
                        const badge = document.createElement('div');
                        badge.className = 'card-badge';
                        badge.textContent = 'Just Dropped';
                        card.appendChild(badge);
                    }

                    card.innerHTML += `
                        <img src="${book.cover_image}" alt="Cover of ${book.title}" class="book-cover">
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-author">${book.author}</p>
                        <div class="book-rating">
                            <!-- Star rating could be added here -->
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

        fetchAndDisplayNewReleases();
    }
});
