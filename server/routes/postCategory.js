// server/routes/postCategories.js
const express = require("express");
const router = express.Router();
const PostCategory = require("../models/PostCategory");

/**
 * GET /api/post-categories => fetch all post categories
 */
router.get("/", async (req, res) => {
    try {
        const categories = await PostCategory.find().sort({ name: 1 });
        return res.json(categories);
    } catch (err) {
        console.error("Error fetching post categories:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
