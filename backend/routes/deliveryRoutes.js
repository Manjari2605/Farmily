const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Order = require('../models/Order');
const User = require('../models/User');

router.get('/assigned', auth, async (req, res) => {
  try {
    const orders = await Order.find({ deliveryAgent: req.user._id, status: { $in: ['accepted', 'delivered'] } })
      .populate('buyer product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:orderId/deliver', auth, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.orderId, deliveryAgent: req.user._id });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status === 'delivered') return res.status(400).json({ error: 'Already delivered' });
    order.status = 'delivered';
    await order.save();
    res.json({ success: true, message: 'Order marked as delivered' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/history', auth, async (req, res) => {
  try {
    const orders = await Order.find({ deliveryAgent: req.user._id, status: 'delivered' }).populate('product');
    const earnings = orders.length * 30;
    res.json({ orders, earnings });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
