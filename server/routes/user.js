const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");

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

module.exports = router;
