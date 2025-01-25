// server/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const mbtiTypes = [
    "INTJ", "INTP", "ENTJ", "ENTP",
    "INFJ", "INFP", "ENFJ", "ENFP",
    "ISTJ", "ISFJ", "ESTJ", "ESFJ",
    "ISTP", "ISFP", "ESTP", "ESFP"
];

/**
 * POST /api/auth/register
 * { username, password, age, mbti } => created user
 */
router.post("/register", async (req, res) => {
    try {
        const { username, password, age, mbti } = req.body;
        if (!username || !password || !age || !mbti) { // Check MBTI
            return res.status(400).json({ error: "username, password, age, mbti are required" });
        }

        if (!mbtiTypes.includes(mbti)) { // Validate MBTI type
            return res.status(400).json({ error: "Invalid MBTI type" });
        }

        // Check if username is already taken
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ error: "Username already used" });
        }

        // Hash password
        const hashedPw = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPw,
            age: Number(age),
            mbti, // Save MBTI
            subscriptionExpiresAt: null, // default
        });
        await newUser.save();

        return res.status(201).json({ message: "User registered!", user: {
                username: newUser.username,
                age: newUser.age,
                mbti: newUser.mbti, // Return MBTI
            }});
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

/**
 * POST /api/auth/login
 * { username, password } => returns token
 */
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "username, password required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        // Create JWT
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || "change-me",
            { expiresIn: "1h" }
        );

        return res.json({
            user: {
                id: user._id,
                username: user.username,
                age: user.age,
                mbti: user.mbti, // Return MBTI
            },
            token,
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
