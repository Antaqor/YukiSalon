const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Post = require("../models/Post");
const authenticateToken = require("../middleware/authMiddleware");
const User = require("../models/User");

// Ensure the "uploads" directory exists (if not already done in server/index.js)
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Created uploads folder at:", uploadDir);
}

// Configure multer with disk storage (up to 5MB)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("Saving file to:", uploadDir);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const finalName = uniqueSuffix + "-" + file.originalname;
        console.log("Generated filename:", finalName);
        cb(null, finalName);
    },
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// GET /api/posts – fetch posts
router.get("/", async (req, res) => {
    try {
        const { user, sort } = req.query;
        const filter = {};
        if (user) filter.user = user;

        if (sort === "recommendation") {
            const posts = await Post.aggregate([
                { $match: filter },
                { $addFields: { likesCount: { $size: "$likes" } } },
                { $sort: { likesCount: -1, createdAt: -1 } },
            ]);
            return res.json(posts);
        } else {
            // **IMPORTANT**: Populate both username and profilePicture.
            const posts = await Post.find(filter)
                .populate("user", "username profilePicture")
                .populate("comments.user", "username profilePicture")
                .populate("comments.replies.user", "username profilePicture")
                .sort({ createdAt: -1 });
            return res.json(posts);
        }
    } catch (err) {
        console.error("Error fetching posts:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /api/posts – Create new post.
 * Stores the image filename in the database.
 */
router.post("/", authenticateToken, upload.single("image"), async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: "Content required" });
        }

        // If a file was uploaded, store only the filename.
        let imageFilename = null;
        if (req.file) {
            imageFilename = req.file.filename;
            console.log("Storing image filename in DB:", imageFilename);
        }

        const newPost = await Post.create({
            content,
            image: imageFilename, // Just the filename
            user: req.user._id,
        });

        await User.findByIdAndUpdate(req.user._id, { $inc: { rating: 1 } });

        // Populate username and profilePicture
        await newPost.populate("user", "username profilePicture");
        console.log("Created post:", newPost);

        return res.status(201).json({ message: "Post created", post: newPost });
    } catch (err) {
        console.error("Create post error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /api/posts/:id/like – Like a post.
 */
router.post("/:id/like", authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.user._id;

        const post = await Post.findById(postId).populate("likes", "username");
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
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

/**
 * POST /api/posts/:id/comment – Add a comment to a post.
 */
router.post("/:id/comment", authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: "Content required" });
        }

        const post = await Post.findById(postId).populate("user", "username");
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = {
            user: req.user._id,
            content,
        };

        post.comments.push(comment);
        await post.save();
        await post.populate("comments.user", "username profilePicture");

        // increment user rating
        await User.findByIdAndUpdate(req.user._id, { $inc: { rating: 1 } });

        return res.json({ comments: post.comments });
    } catch (err) {
        console.error("Comment error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /api/posts/:postId/comment/:commentId/reply – Add a reply to a comment.
 */
router.post("/:postId/comment/:commentId/reply", authenticateToken, async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: "Content required" });
        }

        const post = await Post.findById(postId).populate("comments.user", "username profilePicture");
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }

        const comment = post.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: "Comment not found" });
        }

        comment.replies.push({ user: req.user._id, content });
        await post.save();
        await post.populate("comments.replies.user", "username profilePicture");

        // increment user rating
        await User.findByIdAndUpdate(req.user._id, { $inc: { rating: 1 } });

        return res.json({ comments: post.comments });
    } catch (err) {
        console.error("Reply error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /api/posts/:id/share – Increment share count.
 */
router.post("/:id/share", authenticateToken, async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        post.shares += 1;
        await post.save();

        // increment user rating
        await User.findByIdAndUpdate(req.user._id, { $inc: { rating: 1 } });

        return res.json({ shares: post.shares });
    } catch (err) {
        console.error("Share error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
