const fs = require('fs').promises;
const path = require('path');
const Fuse = require('fuse.js');

const booksDBPath = path.join(__dirname, '..', '..', 'data', 'books.json');

// @desc    Search for books by title or author, with filtering and pagination
exports.searchBooks = async (req, res) => {
    const { q, genre, minRating, maxPrice, page = 1, limit = 6 } = req.query;

    try {
        const data = await fs.readFile(booksDBPath, 'utf8');
        let results = JSON.parse(data);

        // Fuzzy search filter
        if (q) {
            const fuseOptions = {
                includeScore: true,
                keys: ['title', 'author'],
                threshold: 0.4 // Adjust for more or less fuzziness
            };
            const fuse = new Fuse(results, fuseOptions);
            results = fuse.search(q).map(result => result.item);
        }

        // --- Static Filters ---
        if (genre) {
            results = results.filter(book => book.genre === genre);
        }
        if (minRating) {
            results = results.filter(book => book.rating >= parseFloat(minRating));
        }
        if (maxPrice) {
            results = results.filter(book => book.price <= parseFloat(maxPrice));
        }

        // Pagination logic
        const totalResults = results.length;
        const totalPages = Math.ceil(totalResults / limit);
        const startIndex = (page - 1) * limit;
        const paginatedResults = results.slice(startIndex, startIndex + parseInt(limit));

        res.json({
            books: paginatedResults,
            currentPage: parseInt(page),
            totalPages: totalPages
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during search', error: error.message });
    }
};

// @desc    Get autocomplete suggestions for search
exports.getAutocompleteSuggestions = async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.json([]);
    }

    try {
        const data = await fs.readFile(booksDBPath, 'utf8');
        const books = JSON.parse(data);

        const fuseOptions = {
            keys: ['title', 'author'],
            threshold: 0.4
        };
        const fuse = new Fuse(books, fuseOptions);
        const fuseResults = fuse.search(q);

        const suggestions = fuseResults.slice(0, 5).map(result => ({
            title: result.item.title,
            url: `search.html?q=${encodeURIComponent(result.item.title)}`
        }));

        res.json(suggestions);

    } catch (error) {
        res.status(500).json({ message: 'Server error during autocomplete', error: error.message });
    }
};
