const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");

// POST /api/auth/register
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ error: "username, email, and password are required" });
        }

        const existing = await User.findOne({ $or: [{ username }, { email }] });
        if (existing) {
            return res.status(400).json({ error: "Username or email already in use" });
        }

        const hashedPw = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: hashedPw,
        });

        return res.status(201).json({
            message: "User registered!",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "username and password required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || "change-me",
            { expiresIn: "1h" }
        );

        return res.json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                rating: user.rating,
                subscriptionExpiresAt: user.subscriptionExpiresAt,
            },
            token,
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// GET /api/auth/user/:id => fetch user by ID for public profile
router.get("/user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select(
            "username email profilePicture rating createdAt"
        );
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json(user);
    } catch (err) {
        console.error("Fetch user error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

router.get("/profile", authenticateToken, async (req, res) => {
    try {
        // req.user was set by authenticateToken
        const userId = req.user._id || req.user.id;
        const user = await User.findById(userId).select(
            "username email profilePicture rating subscriptionExpiresAt"
        );
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json(user);
    } catch (err) {
        console.error("Profile fetch error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});


module.exports = router;
