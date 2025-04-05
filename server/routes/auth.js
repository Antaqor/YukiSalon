const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");

// -------------- MULTER FOR FILE UPLOADS --------------
const multer = require("multer");
const path = require("path");

const upload = multer({
    dest: path.join(__dirname, "..", "uploads"),
});

// -------------- REGISTER --------------
router.post("/register", upload.single("profilePicture"), async (req, res) => {
    try {
        // Debug logs: see exactly what's in req.body / req.file
        console.log("------ REGISTER BODY ------");
        console.log(req.body);
        console.log("------ REGISTER FILE ------");
        console.log(req.file);

        // Because it's multipart, fields are in req.body, file in req.file
        const {
            username,
            password,
            phoneNumber,
            location,
            gender,
        } = req.body;

        // The birthday was sent as a JSON string => parse it
        let birthday = {};
        try {
            birthday = JSON.parse(req.body.birthday);
        } catch (err) {
            return res.status(400).json({ error: "Invalid birthday format" });
        }

        // If file was uploaded, build a path
        let profilePicturePath = "";
        if (req.file) {
            profilePicturePath = "/uploads/" + req.file.filename;
        }

        // Validate required fields (NO 'name')
        if (
            !username ||
            !password ||
            !phoneNumber ||
            !location ||
            !gender ||
            !birthday.year ||
            !birthday.month ||
            !birthday.day
        ) {
            return res.status(400).json({
                error:
                    "Missing required fields (username, password, phoneNumber, location, gender, birthday)",
            });
        }

        // Check if username is taken
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ error: "Username already in use" });
        }

        // Hash the password
        const hashedPw = await bcrypt.hash(password, 10);

        // Create new user (NO 'name')
        const newUser = await User.create({
            username,
            password: hashedPw,
            phoneNumber,
            location,
            gender,
            birthday,
            profilePicture: profilePicturePath,
        });

        return res.status(201).json({
            message: "User registered!",
            user: {
                _id: newUser._id,
                username: newUser.username,
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

// -------------- LOGIN --------------
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

// -------------- PUBLIC PROFILE (by ID) --------------
router.get("/user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select(
            "username phoneNumber location gender birthday profilePicture rating subscriptionExpiresAt following followers"
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

// -------------- GET OWN PROFILE --------------
router.get("/profile", authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const user = await User.findById(userId).select(
            "username phoneNumber location gender birthday profilePicture rating subscriptionExpiresAt following followers"
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
