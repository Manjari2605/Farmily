const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getUsersByRole, getStats } = require('../controllers/userController');


// Get users by role
router.get('/', auth, getUsersByRole);
// Get stats
router.get('/stats', auth, getStats);

// Add money to wallet (POST /api/users/wallet/add)
router.post('/wallet/add', auth, async (req, res) => {
  try {
    const amount = parseInt(req.body.amount);
    if (!amount || amount < 1) return res.status(400).json({ error: 'Invalid amount' });
    const user = await require('../models/User').findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.wallet = (user.wallet || 0) + amount;
    await user.save();
    res.json({ success: true, wallet: user.wallet });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
