const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String, default: '' },
        price: { type: Number, default: 0 },
        imageUrl: { type: String, default: '' },
        saleActive: { type: Boolean, default: false },
        salePrice: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Product', ProductSchema);
