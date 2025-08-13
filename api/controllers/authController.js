const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const usersDBPath = path.join(__dirname, '..', '..', 'data', 'users.json');

// Helper function to read users
const readUsers = async () => {
    try {
        const data = await fs.readFile(usersDBPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or is empty, return empty array
        if (error.code === 'ENOENT') return [];
        throw error;
    }
};

// Helper function to write users
const writeUsers = async (users) => {
    await fs.writeFile(usersDBPath, JSON.stringify(users, null, 2));
};

// @desc    Register a new user
exports.registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const users = await readUsers();

        // Check if user already exists
        const userExists = users.find(user => user.email === email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = {
            id: users.length > 0 ? users[users.length - 1].id + 1 : 1,
            username,
            email,
            password: hashedPassword
        };

        users.push(newUser);
        await writeUsers(users);

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: newUser.id, username: newUser.username, email: newUser.email }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during registration', error: error.message });
    }
};

// @desc    Authenticate user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    try {
        const users = await readUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // For now, just a success message. JWT will be added later.
        res.status(200).json({
            message: 'Login successful',
            user: { id: user.id, username: user.username, email: user.email }
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error: error.message });
    }
};
