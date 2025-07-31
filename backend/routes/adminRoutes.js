const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const role = require('../middleware/roleMiddleware');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Only admin can access
router.use(auth, role('admin'));

router.get('/users', async (req, res) => {
  const role = req.query.role;
  const users = await User.find(role ? { role } : {});
  res.json(users);
});

router.get('/stats', async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenue = await Order.aggregate([
    { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $group: { _id: null, revenue: { $sum: { $multiply: ['$quantity', '$product.price'] } } } }
  ]);
  res.json({
    totalOrders,
    totalRevenue: totalRevenue[0]?.revenue || 0
  });
});

router.get('/recent-orders', async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('buyer product deliveryAgent');
  res.json(orders);
});

router.get('/product-approvals', async (req, res) => {
  const products = await Product.find({ approved: false }).populate('farmer');
  res.json(products);
});

module.exports = router;
