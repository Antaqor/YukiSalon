// server/models/Book.js
const mongoose = require("mongoose");

const BookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        author: { type: String, default: "Unknown" },
        description: { type: String, default: "" },
        price: { type: Number, default: 0 },
        coverImageUrl: { type: String, default: "" },
        saleActive: { type: Boolean, default: false },
        salePrice: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Book", BookSchema);
