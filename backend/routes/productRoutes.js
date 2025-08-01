const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { getProducts, uploadProduct, approveProduct } = require('../controllers/productController');
const Product = require('../models/Product');
const role = require('../middleware/roleMiddleware');

router.get('/', getProducts);
router.post('/upload', auth, role('farmer'), uploadProduct);
router.post('/approve/:id', auth, role('admin'), approveProduct);

router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
