const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Product = require('../models/Product');

// Resolve uploads directory relative to this server regardless of CWD
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const safe = file.originalname
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/\s+/g, '_')
            .replace(/[^а-яА-ЯёЁa-zA-Z0-9.\-_]/g, '');
        cb(null, Date.now() + '-' + safe);
    },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Create product
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, saleActive, salePrice } = req.body;
        const imageUrl = req.file ? 'uploads/' + req.file.filename : '';
        const newProduct = await Product.create({
            name,
            description,
            price: Number(price) || 0,
            imageUrl,
            saleActive: saleActive === 'true',
            salePrice: Number(salePrice) || 0,
        });
        res.json(newProduct);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Server error while creating product.' });
    }
});

// Get all products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Server error while fetching products.' });
    }
});

// Get one product
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found.' });
        res.json(product);
    } catch (err) {
        console.error('Error fetching single product:', err);
        res.status(500).json({ error: 'Server error fetching that product.' });
    }
});

// Update product
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, description, price, saleActive, salePrice } = req.body;
        let imageUrl;
        if (req.file) {
            imageUrl = 'uploads/' + req.file.filename;
        }
        const updatedData = {
            name,
            description,
            price: Number(price) || 0,
            saleActive: saleActive === 'true',
            salePrice: Number(salePrice) || 0,
        };
        if (imageUrl) updatedData.imageUrl = imageUrl;
        const product = await Product.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!product) return res.status(404).json({ error: 'Product not found.' });
        res.json(product);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Server error updating product.' });
    }
});

// Delete product
router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found.' });
        res.json({ message: 'Product deleted successfully.' });
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).json({ error: 'Server error deleting product.' });
    }
});

module.exports = router;
