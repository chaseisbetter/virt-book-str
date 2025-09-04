const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
// I will move the frontend files into a 'public' folder later.
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', require('./api/routes/auth'));
app.use('/api/users', require('./api/routes/users'));
app.use('/api/books', require('./api/routes/books'));
app.use('/api/posts', require('./api/routes/posts'));
app.use('/api/search', require('./api/routes/search'));

// Simple test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Welcome to the Eternal Ink API!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
