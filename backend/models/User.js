const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['buyer', 'farmer', 'delivery', 'admin'] },
  address: String,
  phone: String,
  wallet: { type: Number, default: 0 },
  profile: Object, // for extra info (earnings, area, etc)
});

module.exports = mongoose.model('User', UserSchema);
