const fs = require('fs').promises;
const path = require('path');

const booksDBPath = path.join(__dirname, '..', '..', 'data', 'books.json');

// @desc    Get all books
exports.getBooks = async (req, res) => {
    try {
        const data = await fs.readFile(booksDBPath, 'utf8');
        const books = JSON.parse(data);
        res.json(books);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Add a review to a book
exports.addBookReview = async (req, res) => {
    const { rating, text, user } = req.body;
    const bookId = parseInt(req.params.id);

    if (!rating || !text) {
        return res.status(400).json({ message: 'Please provide a rating and review text.' });
    }

    try {
        const data = await fs.readFile(booksDBPath, 'utf8');
        let books = JSON.parse(data);

        const bookIndex = books.findIndex(b => b.id === bookId);

        if (bookIndex === -1) {
            return res.status(404).json({ message: 'Book not found' });
        }

        const newReview = {
            user: user || 'Anonymous', // Default user if not provided
            rating: parseInt(rating),
            date: new Date().toISOString().split('T')[0], // Get YYYY-MM-DD
            text: text
        };

        books[bookIndex].reviews.push(newReview);

        await fs.writeFile(booksDBPath, JSON.stringify(books, null, 2));

        res.status(201).json(newReview);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get a single book by ID
exports.getBookById = async (req, res) => {
    try {
        const data = await fs.readFile(booksDBPath, 'utf8');
        const books = JSON.parse(data);
        const book = books.find(b => b.id === parseInt(req.params.id));

        if (book) {
            res.json(book);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
