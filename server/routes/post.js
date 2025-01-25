// server/routes/post.js (Complete with Like Feature)
const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");

/**
 * GET /api/posts => fetch all posts with user and likes
 */
router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "username age mbti")
            .populate({
                path: "likes",
                select: "username mbti",
            })
            .sort({ createdAt: -1 });
        return res.json(posts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /api/posts => create a new post
 * Subscription check is already handled in the existing code
 */
router.post("/", authenticateToken, async (req, res) => {
    try {
        // 1) Subscription check
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        if (!user.subscriptionExpiresAt || user.subscriptionExpiresAt < new Date()) {
            return res.status(403).json({ error: "Subscription expired. Please pay subscription first." });
        }

        // 2) Post fields check
        const { title, content, category } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: "Title and content required." });
        }

        // 3) Create post
        const newPost = new Post({
            title,
            content,
            category: category || null,
            user: userId,
        });
        const saved = await newPost.save();

        // Populate user and category
        await saved.populate("user", "username age mbti");
        if (category) {
            await saved.populate("category", "name");
        }

        return res.status(201).json({
            message: "Post created",
            post: saved,
        });
    } catch (err) {
        console.error("Error creating post:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /api/posts/:id/like => like a post
 */
router.post("/:id/like", authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        if (!user.subscriptionExpiresAt || user.subscriptionExpiresAt < new Date()) {
            return res.status(403).json({ error: "Subscription expired. Please pay subscription first." });
        }

        const post = await Post.findById(postId).populate("likes", "username mbti");
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if user already liked the post
        if (post.likes.some((like) => like._id.toString() === userId)) {
            return res.status(400).json({ error: "You have already liked this post." });
        }

        // Add user to likes
        post.likes.push(userId);
        await post.save();

        // Populate likes again
        await post.populate({
            path: "likes",
            select: "username mbti",
        });

        return res.json({
            message: "Post liked.",
            likesCount: post.likes.length,
            likes: post.likes,
        });
    } catch (err) {
        console.error("Error liking post:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
