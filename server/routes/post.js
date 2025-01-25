// server/routes/post.js
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");

/**
 * GET /api/posts => бүх постыг татах
 */
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "username age")
            .sort({ createdAt: -1 });
        return res.json(posts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /api/posts => Subscription дууссан бол хориглоно
 */
router.post("/", authenticateToken, async (req, res) => {
    try {
        // 1) Subscription шалгах
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        if (!user.subscriptionExpiresAt || user.subscriptionExpiresAt < new Date()) {
            return res.status(403).json({ error: "Subscription expired. Please pay subscription first." });
        }

        // 2) Постын талбар шалгах
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: "Title and content required" });
        }

        // 3) Пост үүсгэх
        const newPost = new Post({
            title,
            content,
            user: userId,
            // category: ... (Хэрэв таны code-д category дамжуулж байвал)
        });
        const saved = await newPost.save();

        // **Chain биш**, тус бүрд нь await populate
        await saved.populate("user", "username age");
        // await saved.populate("category", "name"); // Хэрэв category байгаа бол

        return res.status(201).json({
            message: "Post created",
            post: saved,
        });
    } catch (err) {
        console.error("Error creating post:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
