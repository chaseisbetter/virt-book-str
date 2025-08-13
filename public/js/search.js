document.addEventListener('DOMContentLoaded', () => {
    const searchGrid = document.getElementById('search-results-grid');
    const catalogTitle = document.getElementById('catalog-title');
    const sortBySelect = document.getElementById('sort-by');
    const filterForm = document.getElementById('filter-form');
    const ratingValueSpan = document.getElementById('rating-value');
    const minRatingSlider = document.getElementById('min-rating');
    const paginationContainer = document.getElementById('pagination-container');

    let currentBooks = [];
    let currentPage = 1;
    let totalPages = 1;
    let currentFilterParams = '';

    const renderBooks = (books) => {
        if (!books || books.length === 0) {
            searchGrid.innerHTML = '<p>No tomes found matching your criteria. Try another search.</p>';
            return;
        }
        let resultsHTML = '';
        books.forEach(book => {
            const stars = '★'.repeat(Math.floor(book.rating)) + '☆'.repeat(5 - Math.floor(book.rating));
            resultsHTML += `
                <a href="book.html?id=${book.id}" class="book-card-link">
                    <div class="book-card">
                        <div class="book-cover-wrapper"><img src="${book.cover_image}" alt="Cover of ${book.title}" class="book-cover"><div class="book-hover-info"><p>${book.tagline || 'A tale of magic and romance.'}</p></div></div>
                        <h3 class="book-title">${book.title}</h3>
                        <p class="book-author">${book.author}</p>
                        <div class="book-rating"><span class="stars">${stars}</span><span class="numeric-rating">${book.rating.toFixed(1)}</span></div>
                        <p class="book-price">$${book.price.toFixed(2)}</p>
                    </div>
                </a>`;
        });
        searchGrid.innerHTML = resultsHTML;
    };

    const manageLoadMoreButton = () => {
        paginationContainer.innerHTML = '';
        if (currentPage < totalPages) {
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.textContent = 'Load More Tomes';
            loadMoreBtn.classList.add('btn');
            loadMoreBtn.addEventListener('click', () => {
                currentPage++;
                fetchData(currentFilterParams, false); // Fetch next page, append results
            });
            paginationContainer.appendChild(loadMoreBtn);
        }
    };

    const sortAndRender = () => {
        let sortedBooks = [...currentBooks];
        const sortValue = sortBySelect.value;
        switch (sortValue) {
            case 'price-asc': sortedBooks.sort((a, b) => a.price - b.price); break;
            case 'price-desc': sortedBooks.sort((a, b) => b.price - a.price); break;
            case 'rating': sortedBooks.sort((a, b) => b.rating - a.rating); break;
            case 'newest': sortedBooks.reverse(); break;
        }
        renderBooks(sortedBooks);
    };

    const fetchData = async (filterParams = '', isNewSearch = true) => {
        if (isNewSearch) {
            currentPage = 1;
            currentFilterParams = filterParams;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');

        let baseUrl = '/api/search';
        let params = new URLSearchParams(filterParams);
        params.append('page', currentPage);

        if (query) {
            catalogTitle.innerHTML = `Search Results for "<em>${query}</em>"`;
            params.append('q', query);
        } else if (isNewSearch) {
            catalogTitle.textContent = 'All Tomes';
        }

        const url = `${baseUrl}?${params.toString()}`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('The tomes could not be retrieved from the library.');
            const data = await res.json();

            if (isNewSearch) {
                currentBooks = data.books;
            } else {
                currentBooks.push(...data.books); // Append new books
            }

            totalPages = data.totalPages;

            sortAndRender(); // Sort and render the full list
            manageLoadMoreButton();
        } catch (err) {
            searchGrid.innerHTML = `<p style="color: var(--burgundy);">${err.message}</p>`;
        }
    };

    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(filterForm);
        const params = new URLSearchParams();
        const genres = formData.getAll('genre');
        if (genres.length > 0) params.append('genre', genres[0]);
        const maxPrice = formData.get('maxPrice');
        if (maxPrice) params.append('maxPrice', maxPrice);
        const minRating = formData.get('minRating');
        if (minRating > 1) params.append('minRating', minRating);
        fetchData(params.toString(), true);
    });

    minRatingSlider.addEventListener('input', (e) => {
        ratingValueSpan.textContent = parseFloat(e.target.value).toFixed(1);
    });

    sortBySelect.addEventListener('change', sortAndRender);

    fetchData(); // Initial data fetch
});
