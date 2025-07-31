const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  const { items, deliveryAgentId, paymentMethod } = req.body;
  console.log('Order create request body:', req.body);
  const buyer = req.user._id;
  let status = 'accepted';
  let paymentStatus = 'paid';
  let codReleaseTime = null;
  let paidToFarmer = false;

  // Calculate total order price
  let totalPrice = 0;
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(400).json({ error: 'Product not found' });
    }
    totalPrice += product.price * item.quantity;
  }

  // Handle payment method logic
  if (paymentMethod === 'cod') {
    status = 'accepted';
    paymentStatus = 'pending';
    codReleaseTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
    paidToFarmer = false;
  } else if (['wallet', 'upi', 'card'].includes(paymentMethod)) {
    paymentStatus = 'paid';
    if (paymentMethod === 'wallet') {
      const user = await User.findById(buyer);
      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }
      if (user.wallet < totalPrice) {
        return res.status(400).json({ error: 'Insufficient wallet balance' });
      }
      user.wallet -= totalPrice;
      await user.save();
    }
    paidToFarmer = true;
  }

  console.log('[DEBUG] Creating order with paymentMethod:', paymentMethod, 'paidToFarmer:', paidToFarmer);
  const order = new Order({
    buyer,
    items: Array.isArray(items) ? items : [],
    deliveryAgent: deliveryAgentId,
    paymentMethod,
    paymentStatus,
    codReleaseTime,
    status,
    paidToFarmer: paidToFarmer
  });
  await order.save();
  console.log('[POST-SAVE DEBUG] Saved order:', {
    _id: order._id,
    paymentMethod: order.paymentMethod,
    paidToFarmer: order.paidToFarmer
  });
  res.json({ message: 'Order placed', order });
};

exports.getOrders = async (req, res) => {
  const orders = await Order.find()
    .populate('buyer deliveryAgent')
    .populate({ path: 'items.product', populate: { path: 'farmer' } });
  res.json(orders);
};

exports.getUserOrders = async (req, res) => {
  const userId = req.user._id;
  const orders = await Order.find({ buyer: userId })
    .populate('deliveryAgent')
    .populate({ path: 'items.product', populate: { path: 'farmer' } });
  res.json(orders);
};

// PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
      .populate('buyer deliveryAgent')
      .populate({ path: 'product', populate: { path: 'farmer' } });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
