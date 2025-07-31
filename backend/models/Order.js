const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number
  }],
  deliveryAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryStatus: { type: String, enum: ['pending', 'picked_up', 'delivered'], default: 'pending' },
  status: { type: String, enum: ['pending', 'accepted', 'delivered', 'cancelled'], default: 'pending' },
  paymentMethod: { type: String, enum: ['wallet', 'upi', 'card', 'cod'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  codReleaseTime: { type: Date }, // for COD payout after 2 hours
  paidToFarmer: { type: Boolean },
  createdAt: { type: Date, default: Date.now },
});

OrderSchema.set('timestamps', true);
module.exports = mongoose.model('Order', OrderSchema);
