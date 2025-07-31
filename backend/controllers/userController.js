const User = require('../models/User');

exports.getUsersByRole = async (req, res) => {
  const role = req.query.role;
  const users = await User.find({ role });
  res.json(users);
};

exports.getStats = async (req, res) => {
  const buyers = await User.countDocuments({ role: 'buyer' });
  const farmers = await User.countDocuments({ role: 'farmer' });
  const delivery = await User.countDocuments({ role: 'delivery' });
  res.json({ buyers, farmers, delivery });
};
