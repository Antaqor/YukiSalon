const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");

// Register
router.post("/register", async (req, res) => {
    try {
        // Destructure all fields from the request body
        const {
            username,
            password,
            name,
            phoneNumber,
            location,
            gender,
            birthday, // expects { year, month, day }
        } = req.body;

        // Validate all required fields
        if (
            !username ||
            !password ||
            !name ||
            !phoneNumber ||
            !location ||
            !gender ||
            !birthday ||
            !birthday.year ||
            !birthday.month ||
            !birthday.day
        ) {
            return res.status(400).json({
                error: "username, password, name, phoneNumber, location, gender, and birthday (year, month, day) are required",
            });
        }

        // Check for existing user with same username
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ error: "Username already in use" });
        }

        const hashedPw = await bcrypt.hash(password, 10);

        // Create new user with all the fields
        const newUser = await User.create({
            username,
            password: hashedPw,
            name,
            phoneNumber,
            location,
            gender,
            birthday,
        });

        return res.status(201).json({
            message: "User registered!",
            user: {
                _id: newUser._id,
                username: newUser.username,
                name: newUser.name,
                phoneNumber: newUser.phoneNumber,
                location: newUser.location,
                gender: newUser.gender,
                birthday: newUser.birthday,
                profilePicture: newUser.profilePicture,
                subscriptionExpiresAt: newUser.subscriptionExpiresAt,
            },
        });
    } catch (err) {
        console.error("Register error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// Login
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
                _id: user._id,
                username: user.username,
                name: user.name,
                phoneNumber: user.phoneNumber,
                location: user.location,
                gender: user.gender,
                birthday: user.birthday,
                profilePicture: user.profilePicture,
                rating: user.rating,
                subscriptionExpiresAt: user.subscriptionExpiresAt,
                following: user.following,
                followers: user.followers,
            },
            token,
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Server error" });
    }
});

// Get public user profile
router.get("/user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select(
            "username name phoneNumber location gender birthday profilePicture rating subscriptionExpiresAt following followers"
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

// Get own profile
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const user = await User.findById(userId).select(
            "username name phoneNumber location gender birthday profilePicture rating subscriptionExpiresAt following followers"
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
