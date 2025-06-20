const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

// Active subscribers count
router.get("/active-subscribers", async (req, res) => {
    try {
        const count = await User.countDocuments({
            subscriptionExpiresAt: { $gt: new Date() },
        });
        res.json({ count });
    } catch (err) {
        console.error("Active subscribers error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Get all users (public)
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select(
            "username profilePicture rating location subscriptionExpiresAt phoneNumber birthday hasTransferred vntBalance"
        );
        res.json(users);
    } catch (err) {
        console.error("Fetch users error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Follow a user (idempotent)
router.post("/:id/follow", authenticateToken, async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ error: "Cannot follow yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // If already following, do nothing (idempotent)
        if (currentUser.following.includes(targetUserId)) {
            return res.json({ message: "Already following this user" });
        }

        currentUser.following.push(targetUserId);
        targetUser.followers.push(currentUserId);

        await currentUser.save();
        await targetUser.save();

        await Notification.create({
            recipient: targetUserId,
            sender: currentUserId,
            type: "follow",
        });

        return res.json({ message: "User followed successfully" });
    } catch (err) {
        console.error("Follow error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// Unfollow a user (idempotent)
router.post("/:id/unfollow", authenticateToken, async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const currentUserId = req.user._id;

        if (targetUserId === currentUserId.toString()) {
            return res.status(400).json({ error: "Cannot unfollow yourself" });
        }

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(currentUserId);

        if (!targetUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // If not following in the first place, do nothing
        if (!currentUser.following.includes(targetUserId)) {
            return res.json({ message: "User unfollowed successfully" });
        }

        currentUser.following = currentUser.following.filter(
            (id) => id.toString() !== targetUserId
        );
        targetUser.followers = targetUser.followers.filter(
            (id) => id.toString() !== currentUserId.toString()
        );

        await currentUser.save();
        await targetUser.save();

        return res.json({ message: "User unfollowed successfully" });
    } catch (err) {
        console.error("Unfollow error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// Update user's subscription expiration
router.put("/:id/subscription", authenticateToken, async (req, res) => {
    try {
        const { expiresAt } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.subscriptionExpiresAt = expiresAt
            ? new Date(expiresAt)
            : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await user.save();
        res.json({
            message: "Subscription updated",
            subscriptionExpiresAt: user.subscriptionExpiresAt,
        });
    } catch (err) {
        console.error("Update subscription error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Mark that user clicked "transferred" on subscription page
router.post("/:id/transferred", authenticateToken, async (req, res) => {
    try {
        if (req.user.username !== "Antaqor" && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({ error: "Forbidden" });
        }
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.hasTransferred = true;
        await user.save();
        res.json({ message: "Marked transferred" });
    } catch (err) {
        console.error("Mark transferred error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Update VNT balance
router.put("/:id/vnt", authenticateToken, async (req, res) => {
    try {
        if (req.user.username !== "Antaqor") {
            return res.status(403).json({ error: "Forbidden" });
        }
        const { amount } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        user.vntBalance = Number(amount) || 0;
        await user.save();
        res.json({ message: "VNT updated", vntBalance: user.vntBalance });
    } catch (err) {
        console.error("Update VNT error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Analytics summary (phone numbers and age distribution)
router.get("/analytics/summary", authenticateToken, async (req, res) => {
    try {
        if (req.user.username !== "Antaqor") {
            return res.status(403).json({ error: "Forbidden" });
        }
        const users = await User.find();
        const phoneNumbers = users.map((u) => u.phoneNumber);
        const nowYear = new Date().getFullYear();
        const ageDistribution = {};
        users.forEach((u) => {
            if (u.birthday && u.birthday.year) {
                const age = nowYear - u.birthday.year;
                ageDistribution[age] = (ageDistribution[age] || 0) + 1;
            }
        });
        res.json({ phoneNumbers, ageDistribution });
    } catch (err) {
        console.error("Analytics error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Update profile picture and cover image
router.put(
    "/me",
    authenticateToken,
    upload.fields([
        { name: "profilePicture", maxCount: 1 },
        { name: "coverImage", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const userId = req.user._id;
            const updates = {};
            if (req.files?.profilePicture?.[0]) {
                updates.profilePicture = "/uploads/" + req.files.profilePicture[0].filename;
            }
            if (req.files?.coverImage?.[0]) {
                updates.coverImage = "/uploads/" + req.files.coverImage[0].filename;
            }
            await User.findByIdAndUpdate(userId, updates, { new: true });
            res.json({ message: "Profile updated", ...updates });
        } catch (err) {
            console.error("Update profile error:", err);
            res.status(500).json({ error: "Server error" });
        }
    }
);

// Delete user and their posts (admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
    try {
        if (req.user.username !== "Antaqor") {
            return res.status(403).json({ error: "Forbidden" });
        }
        const userId = req.params.id;
        await Post.deleteMany({ user: userId });
        await User.findByIdAndDelete(userId);
        res.json({ message: "User and posts deleted" });
    } catch (err) {
        console.error("Delete user error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
