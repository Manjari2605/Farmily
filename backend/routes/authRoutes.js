const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const auth = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// Signup route (example, you may already have this)
router.post('/signup', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ message: 'Signup successful' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        console.log('LOGIN ATTEMPT:', { email, password, role });
        const user = await User.findOne({ email });
        console.log('USER FOUND:', user);
        if (!user) {
            console.log('No user found for email');
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        if (user.password !== password) {
            console.log('Password mismatch:', { entered: password, stored: user.password });
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        if (user.role !== role) {
            console.log('Role mismatch:', { entered: role, stored: user.role });
            return res.status(400).json({ error: 'Role mismatch' });
        }
        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.json({ message: 'Login successful', user, token });
    } catch (err) {
        console.log('Server error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Admin login route
router.post('/admin-login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const admin = await Admin.findOne({ email, password });
        if (!admin) {
            return res.json({ success: false, message: 'Invalid credentials.' });
        }
        // You can generate a JWT token here if needed
        res.json({ success: true, token: 'demo-admin-token' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// Get current user
router.get('/me', auth, (req, res) => {
    res.json(req.user);
});

module.exports = router;
