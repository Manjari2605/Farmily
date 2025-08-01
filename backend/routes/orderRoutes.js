
const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');

const Order = require('../models/Order');
const User = require('../models/User');
const { createOrder, getOrders, getUserOrders, updateOrderStatus } = require('../controllers/orderController');

router.post('/', auth, createOrder);
router.post('/create', auth, createOrder); 
router.get('/', auth, getOrders);
router.get('/my', auth, getUserOrders);

router.post('/:id/accept', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    console.log('ACCEPT order:', order);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    console.log('ACCEPT order.status:', order.status);
    if (!order.status || order.status.toLowerCase() !== 'pending') return res.status(400).json({ error: 'Order not pending' });

    order.status = 'Accepted';
    await order.save();
    res.json({ success: true, message: 'Order accepted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});


router.post('/:id/reject', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    console.log('REJECT order:', order);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    console.log('REJECT order.status:', order.status);
    if (!order.status || order.status.toLowerCase() !== 'pending') return res.status(400).json({ error: 'Order not pending' });

    order.status = 'Rejected';
    await order.save();

    if (order.paymentStatus === 'Paid') {
      const buyer = await User.findById(order.buyer);
      if (buyer) {
        buyer.wallet = (buyer.wallet || 0) + order.total;
        await buyer.save();
      }
    }

    res.json({ success: true, message: 'Order rejected and refunded if paid' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:id/status', auth, updateOrderStatus);

router.put('/:id/update-status', async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate({ path: 'items.product', populate: { path: 'farmer' } });
  if (!order) return res.status(404).send('Order not found');

  console.log('Order after populate:', JSON.stringify(order, null, 2));
  if (Array.isArray(order.items) && order.items.length > 0) {
    console.log('First item product:', JSON.stringify(order.items[0].product, null, 2));
    console.log('Farmer:', JSON.stringify(order.items[0].product.farmer, null, 2));
  }

  order.deliveryStatus = status;

  console.log('[DEBUG] paymentMethod:', order.paymentMethod, 'deliveryStatus:', order.deliveryStatus, 'paidToFarmer:', order.paidToFarmer);

  if (status === 'delivered' && !order.paidToFarmer) {
    if (order.paymentMethod && order.paymentMethod.toLowerCase() === 'cod') {
      order.paidToFarmer = true;
      order.paymentStatus = 'completed';
      console.log('[COD LOGIC] Set paidToFarmer=true, paymentStatus=completed for order', order._id);
     let farmerId = null;
      if (Array.isArray(order.items) && order.items.length > 0) {
        if (order.items[0].product && order.items[0].product.farmer) {
          farmerId = order.items[0].product.farmer;
        } else if (order.items[0].product) {
          const Product = require('../models/Product');
          const prodDoc = await Product.findById(order.items[0].product);
          if (prodDoc && prodDoc.farmer) {
            farmerId = prodDoc.farmer;
          }
        }
      }
      console.log('[COD LOGIC] FarmerId resolved:', farmerId);
      if (farmerId) {
        const farmer = await User.findById(farmerId);
        if (farmer) {
          let total = order.total;
          if (!total && Array.isArray(order.items)) {
            total = order.items.reduce((sum, item) => {
              const price = item.product && item.product.price ? item.product.price : 0;
              return sum + (item.quantity && price ? item.quantity * price : 0);
            }, 0);
          }
          farmer.wallet = (farmer.wallet || 0) + (total || 0);
          await farmer.save();
          console.log('[COD LOGIC] Credited farmer wallet:', farmer._id, 'amount:', total || 0);
        } else {
          console.log('[COD LOGIC] Farmer not found for id:', farmerId);
        }
      } else {
        console.log('[COD LOGIC] No farmerId found for order:', order._id);
      }
    }
    if (order.deliveryAgent) {
      const agent = await User.findById(order.deliveryAgent);
      if (agent) {
        agent.wallet = (agent.wallet || 0) + 100;
        await agent.save();
      }
    }
  }

  await order.save();
  res.send(order);
});


router.put('/:id/assign-delivery', auth, async (req, res) => {
  const { deliveryAgentId } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.deliveryAgent = deliveryAgentId;
  order.deliveryStatus = 'pending';
  await order.save();
  res.json({ success: true, message: 'Delivery agent assigned', order });
});

router.get('/delivery', auth, async (req, res) => {
  const agentId = req.user._id;
  const orders = await Order.find({ deliveryAgent: agentId, deliveryStatus: { $in: ['pending', 'picked_up'] } })
    .populate('buyer')
    .populate({ path: 'items.product', populate: { path: 'farmer' } });
  res.json(orders);
});

router.get('/delivery/stats', auth, async (req, res) => {
  const agentId = req.user._id;
  const activeDeliveries = await Order.countDocuments({ deliveryAgent: agentId, deliveryStatus: { $in: ['pending', 'picked_up'] } });
  const completedToday = await Order.countDocuments({
    deliveryAgent: agentId,
    deliveryStatus: 'delivered',
    updatedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
  });
  const deliveredOrders = await Order.find({
    deliveryAgent: agentId,
    deliveryStatus: 'delivered',
    updatedAt: { $gte: new Date(new Date().setHours(0,0,0,0)) }
  });
  const todaysEarnings = deliveredOrders.length * 100;
  res.json({
    activeDeliveries,
    completedToday,
    avgDeliveryTime: '-',
    todaysEarnings
  });
});

router.get('/delivery/history', auth, async (req, res) => {
  const agentId = req.user._id;
  const orders = await Order.find({ deliveryAgent: agentId, deliveryStatus: 'delivered' })
    .populate('buyer')
    .populate({ path: 'items.product', populate: { path: 'farmer' } })
    .sort({ updatedAt: -1 })
    .limit(20);
  res.json(orders);
});

router.get('/:id/accept', (req, res) => {
  res.status(405).json({ error: 'Use POST method for accepting orders.' });
});
router.get('/:id/reject', (req, res) => {
  res.status(405).json({ error: 'Use POST method for rejecting orders.' });
});

module.exports = router;
