const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Post = require("../models/Post");
const authenticateToken = require("../middleware/authMiddleware");

// Ensure "uploads" directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log("Created uploads folder at:", uploadDir);
}

// Configure multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log("Saving file to:", uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const finalName = uniqueSuffix + "-" + file.originalname;
        console.log("Generated filename:", finalName);
        cb(null, finalName);
    },
});
const upload = multer({ storage });

// GET /api/posts
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
            const posts = await Post.find(filter)
                .populate("user", "username")
                .sort({ createdAt: -1 });
            return res.json(posts);
        }
    } catch (err) {
        console.error("Error fetching posts:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /api/posts => create new post
 */
router.post("/", authenticateToken, upload.single("image"), async (req, res) => {
    try {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: "Content required" });
        }

        // If a file was uploaded, store a relative path "uploads/<filename>"
        let imagePath = null;
        if (req.file) {
            imagePath = "uploads/" + req.file.filename;
            console.log("Storing relative path in DB =>", imagePath);
        }

        const newPost = await Post.create({
            content,
            image: imagePath, // e.g. "uploads/1681234567-somePic.png"
            user: req.user._id,
        });

        await newPost.populate("user", "username");
        console.log("Created post =>", newPost); // see what actually stored

        return res.status(201).json({ message: "Post created", post: newPost });
    } catch (err) {
        console.error("Create post error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /api/posts/:id/like => like a post
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

module.exports = router;
