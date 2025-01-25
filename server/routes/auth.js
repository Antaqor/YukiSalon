// server/routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * POST /api/auth/register
 * { username, password, age } => created user
 */
router.post("/register", async (req, res) => {
    try {
        const { username, password, age } = req.body;
        if (!username || !password || !age) {
            return res.status(400).json({ error: "username, password, age are required" });
        }

        // username давхцаж буй эсэх
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ error: "Username already used" });
        }

        // password hash
        const hashedPw = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPw,
            age: Number(age),
            subscriptionExpiresAt: null, // default
        });
        await newUser.save();

        return res.status(201).json({ message: "User registered!", user: {
                username: newUser.username,
                age: newUser.age,
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

        // JWT үүсгэх
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
            },
            token,
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
