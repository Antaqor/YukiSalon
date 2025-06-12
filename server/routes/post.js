// routes/posts.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Post = require("../models/Post");
const authenticateToken = require("../middleware/authMiddleware");
const User = require("../models/User");

// ---------------------------------------------------------------------------
//  Upload setup
// ---------------------------------------------------------------------------
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created uploads folder at:", uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ---------------------------------------------------------------------------
//  Helpers for “smart” ranking
// ---------------------------------------------------------------------------
const logistic = (x) => 1 / (1 + Math.exp(-x));

const parseCoords = (str) => {
  if (!str) return null;
  const [lat, lon] = str.split(",").map((n) => parseFloat(n));
  return Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon } : null;
};

const haversine = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ---------------------------------------------------------------------------
//  GET /api/posts – fetch posts
// ---------------------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const { user, sort, currentLocation, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (user) filter.user = user;

    const pageNum = Math.max(parseInt(page), 1);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * limitNum;

    // ---------- 1. Recommendation sort ----------
    if (sort === "recommendation") {
      const posts = await Post.aggregate([
        { $match: filter },
        { $addFields: { likesCount: { $size: "$likes" } } },
        { $sort: { likesCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limitNum },
      ]);

      await Post.populate(posts, {
        path: "user",
        select: "username profilePicture location rating",
      });
      await Post.populate(posts, {
        path: "comments.user",
        select: "username profilePicture",
      });
      await Post.populate(posts, {
        path: "comments.replies.user",
        select: "username profilePicture",
      });

      return res.json(posts);
    }

    // ---------- 2. Smart sort (engagement + location) ----------
    if (sort === "smart") {
      const posts = await Post.find(filter)
        .populate("user", "username profilePicture location rating")
        .populate("comments.user", "username profilePicture")
        .populate("comments.replies.user", "username profilePicture")
        .sort({ createdAt: -1 });

      const viewerCoords = parseCoords(currentLocation);

      const scored = posts.map((p) => {
        const likes = p.likes.length;
        const comments = p.comments.length;
        const shares = p.shares || 0;
        const rating = p.user?.rating || 0;

        const engagement = logistic(
          0.3 * likes + 0.4 * comments + 0.2 * shares + 0.1 * rating
        );

        // Calculate location score (1 if within 50 km or exact match, else 0)
        let locationScore = 0;
        if (viewerCoords) {
          const postCoords = parseCoords(p.user?.location);
          if (postCoords) {
            const dist = haversine(
              viewerCoords.lat,
              viewerCoords.lon,
              postCoords.lat,
              postCoords.lon
            );
            if (dist < 50) locationScore = 1;
          } else if (p.user?.location === currentLocation) {
            locationScore = 1;
          }
        } else if (currentLocation && p.user?.location === currentLocation) {
          locationScore = 1;
        }

        return { post: p, score: engagement + locationScore * 2 };
      });

      scored.sort((a, b) => b.score - a.score);
      const sliced = scored.slice(skip, skip + limitNum);
      return res.json(sliced.map((s) => s.post));
    }

    // ---------- 3. Default (chronological) ----------
    const posts = await Post.find(filter)
      .populate("user", "username profilePicture")
      .populate("comments.user", "username profilePicture")
      .populate("comments.replies.user", "username profilePicture")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------------------------------------------------------
//  POST /api/posts – create a new post
// ---------------------------------------------------------------------------
router.post("/", authenticateToken, upload.single("image"), async (req, res) => {
  try {
    const { content, price } = req.body;
    if (!content) return res.status(400).json({ error: "Content required" });

    const imageFilename = req.file ? req.file.filename : null;

    const newPost = await Post.create({
      content,
      image: imageFilename,
      price: Number(price) || 0,
      user: req.user._id,
      unlockedBy: [req.user._id],
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { rating: 1 } });
    await newPost.populate("user", "username profilePicture");

    res.status(201).json({ message: "Post created", post: newPost });
  } catch (err) {
    console.error("Create post error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------------------------------------------------------
//  POST /api/posts/:id/like – like a post
// ---------------------------------------------------------------------------
router.post("/:id/like", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("likes", "username");
    if (!post) return res.status(404).json({ error: "Post not found" });

    const alreadyLiked = post.likes.some(
      (like) => like._id.toString() === req.user._id.toString()
    );
    if (alreadyLiked) return res.status(400).json({ error: "Already liked" });

    post.likes.push(req.user._id);
    await post.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { rating: 1 } });
    await post.populate("likes", "username");

    res.json({ message: "Post liked", likesCount: post.likes.length, likes: post.likes });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------------------------------------------------------
//  POST /api/posts/:id/comment – add a comment
// ---------------------------------------------------------------------------
router.post("/:id/comment", authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Content required" });

    const post = await Post.findById(req.params.id).populate("user", "username");
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.comments.push({ user: req.user._id, content });
    await post.save();
    await post.populate("comments.user", "username profilePicture");

    await User.findByIdAndUpdate(req.user._id, { $inc: { rating: 1 } });

    res.json({ comments: post.comments });
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------------------------------------------------------
//  POST /api/posts/:postId/comment/:commentId/reply – add a reply
// ---------------------------------------------------------------------------
router.post(
  "/:postId/comment/:commentId/reply",
  authenticateToken,
  async (req, res) => {
    try {
      const { content } = req.body;
      if (!content) return res.status(400).json({ error: "Content required" });

      const post = await Post.findById(req.params.postId).populate(
        "comments.user",
        "username profilePicture"
      );
      if (!post) return res.status(404).json({ error: "Post not found" });

      const comment = post.comments.id(req.params.commentId);
      if (!comment) return res.status(404).json({ error: "Comment not found" });

      comment.replies.push({ user: req.user._id, content });
      await post.save();
      await post.populate("comments.replies.user", "username profilePicture");

      await User.findByIdAndUpdate(req.user._id, { $inc: { rating: 1 } });

      res.json({ comments: post.comments });
    } catch (err) {
      console.error("Reply error:", err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// ---------------------------------------------------------------------------
//  POST /api/posts/:id/share – increment share count
// ---------------------------------------------------------------------------
router.post("/:id/share", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    post.shares = (post.shares || 0) + 1;
    await post.save();

    await User.findByIdAndUpdate(req.user._id, { $inc: { rating: 1 } });

    res.json({ shares: post.shares });
  } catch (err) {
    console.error("Share error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------------------------------------------------------------------------
//  POST /api/posts/:id/unlock – purchase a paid post
// ---------------------------------------------------------------------------
router.post("/:id/unlock", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("user");
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.price <= 0)
      return res.status(400).json({ error: "Post is free" });

    if (post.unlockedBy.some((u) => u.toString() === req.user._id.toString())) {
      return res.json({ message: "Already unlocked" });
    }

    const viewer = await User.findById(req.user._id);
    if (!viewer || viewer.vntBalance < post.price)
      return res.status(400).json({ error: "Insufficient balance" });

    viewer.vntBalance -= post.price;
    await viewer.save();

    const creator = await User.findById(post.user._id);
    if (creator) {
      creator.vntBalance += post.price;
      await creator.save();
    }

    post.unlockedBy.push(req.user._id);
    await post.save();

    res.json({ message: "Unlocked", vntBalance: viewer.vntBalance });
  } catch (err) {
    console.error("Unlock error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
