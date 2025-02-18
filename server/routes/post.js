const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const authenticateToken = require("../middleware/authMiddleware");

/**
 * GET /api/posts
 * Optionally filter by ?category=<catId>
 * Also filter by ?user=<userId> for the user’s own posts
 */
router.get("/", async (req, res) => {
    try {
        // Grab query params
        const { category, user } = req.query;

        // Build filter object
        const filter = {};
        if (category) {
            filter.category = category;
        }
        if (user) {
            filter.user = user; // <-- IMPORTANT: filter by user ID
        }

        // Fetch from DB
        const posts = await Post.find(filter)
            .populate("user", "username") // show the author's username
            .populate("category", "name")
            .sort({ createdAt: -1 });

        return res.json(posts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /api/posts => create new post (login required)
 */
router.post("/", authenticateToken, async (req, res) => {
    try {
        const { title, content, category } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: "Title and content required" });
        }

        // Create post
        const newPost = await Post.create({
            title,
            content,
            category: category || null,
            user: req.user._id,
        });

        // Populate user and category
        await newPost.populate("user", "username");
        if (category) {
            await newPost.populate("category", "name");
        }

        return res.status(201).json({ message: "Post created", post: newPost });
    } catch (err) {
        console.error("Create post error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /api/posts/:id/like => like a post (login required)
 */
router.post("/:id/like", authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId).populate("likes", "username");
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        // Check if user already liked
        if (post.likes.some((like) => like._id.toString() === userId.toString())) {
            return res.status(400).json({ error: "You already liked this post" });
        }

        post.likes.push(userId);
        await post.save();
        await post.populate("likes", "username");

        return res.json({
            message: "Post liked",
            likesCount: post.likes.length,
            likes: post.likes,
        });
    } catch (err) {
        console.error("Like error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
