const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const authenticateToken = require('../middleware/authMiddleware');

router.use(authenticateToken);

// Get current user's cart
router.get('/', async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
        if (!cart) return res.json({ items: [] });
        res.json(cart);
    } catch (err) {
        console.error('Fetch cart error:', err);
        res.status(500).json({ error: 'Server error fetching cart.' });
    }
});

// Add product to cart
router.post('/', async (req, res) => {
    try {
        const { productId } = req.body;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: 'Product not found' });

        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = await Cart.create({ user: req.user.id, items: [{ product: productId, quantity: 1 }] });
        } else {
            const item = cart.items.find(i => i.product.toString() === productId);
            if (item) {
                item.quantity += 1;
            } else {
                cart.items.push({ product: productId, quantity: 1 });
            }
            await cart.save();
        }
        cart = await cart.populate('items.product');
        res.json(cart);
    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({ error: 'Server error adding item.' });
    }
});

// Remove product
router.delete('/:productId', async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) return res.status(404).json({ error: 'Cart not found' });
        cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
        await cart.save();
        const populated = await cart.populate('items.product');
        res.json(populated);
    } catch (err) {
        console.error('Remove from cart error:', err);
        res.status(500).json({ error: 'Server error removing item.' });
    }
});

// Clear cart
router.delete('/', async (req, res) => {
    try {
        await Cart.findOneAndDelete({ user: req.user.id });
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        console.error('Clear cart error:', err);
        res.status(500).json({ error: 'Server error clearing cart.' });
    }
});

module.exports = router;
