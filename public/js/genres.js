document.addEventListener('DOMContentLoaded', () => {
    const genresGridContainer = document.getElementById('genres-grid-container');

    if (genresGridContainer) {
        const fetchAndDisplayGenres = async () => {
            try {
                const res = await fetch('/api/books');
                if (!res.ok) {
                    throw new Error('Could not fetch book data.');
                }
                const books = await res.json();

                // Process data to group by genre
                const genres = books.reduce((acc, book) => {
                    const genreName = book.category.main;
                    if (!acc[genreName]) {
                        acc[genreName] = {
                            name: genreName,
                            books: [],
                            coverImage: book.cover_image, // Use the first book's cover as the default
                        };
                    }
                    acc[genreName].books.push(book);
                    return acc;
                }, {});

                // Convert to array and sort or whatever
                const genresArray = Object.values(genres);

                // Clear container and render cards
                genresGridContainer.innerHTML = '';
                genresArray.forEach((genre, index) => {
                    const card = document.createElement('div');
                    card.className = 'genre-card';

                    // Simple logic for bento layout
                    if (index === 0 || index === 5) {
                        card.classList.add('featured');
                    } else if (index === 3) {
                        card.classList.add('tall');
                    }

                    card.style.backgroundImage = `url('${genre.coverImage}')`;

                    card.innerHTML = `
                        <div class="genre-card-content">
                            <h3 class="genre-card-title">${genre.name}</h3>
                            <p class="genre-card-tagline">Explore ${genre.books.length} books</p>
                            <div class="genre-card-info">
                                <p>Featured: ${genre.books[0].title}</p>
                            </div>
                        </div>
                    `;
                    genresGridContainer.appendChild(card);
                });

            } catch (error) {
                genresGridContainer.innerHTML = `<p>Error loading genres: ${error.message}</p>`;
            }
        };

        fetchAndDisplayGenres();
    }
});
