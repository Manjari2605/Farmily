const Product = require('../models/Product');
const User = require('../models/User');

exports.getProducts = async (req, res) => {
  const { search, category } = req.query;
  let query = {};
  if (search) query.name = { $regex: search, $options: 'i' };
  if (category) query.category = category;
  const products = await Product.find(query).populate('farmer', 'fullName');
  res.json(products);
};

exports.uploadProduct = async (req, res) => {
  const { name, description, price, quantity, category, image } = req.body;
  const farmer = req.user._id;
  const product = new Product({ name, description, price, quantity, category, image, farmer });
  await product.save();
  res.json({ message: 'Product uploaded' });
};

exports.approveProduct = async (req, res) => {
  const { id } = req.params;
  await Product.findByIdAndUpdate(id, { approved: true });
  res.json({ message: 'Product approved' });
};
