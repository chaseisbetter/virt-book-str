const fs = require('fs').promises;
const path = require('path');

const usersDBPath = path.join(__dirname, '..', '..', 'data', 'users.json');

// @desc    Get user profile
// @note    This is a placeholder. In a real app, we'd get the user ID
//          from a decoded JWT in an auth middleware.
exports.getUserProfile = async (req, res) => {
    try {
        const data = await fs.readFile(usersDBPath, 'utf8');
        const users = JSON.parse(data);

        // Simulate getting a logged-in user's profile.
        // We'll just return the first user for now.
        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        const userProfile = {
            id: users[0].id,
            username: users[0].username,
            email: users[0].email
        };

        res.json(userProfile);

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
