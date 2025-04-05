const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");

// ---------------------- FILE SIZE LIMITS (in bytes) ----------------------
const MIN_FILE_SIZE = 10 * 1024;          // 10KB
const MAX_FILE_SIZE = 5 * 1024 * 1024;    // 5MB

// ---------------------- MULTER CONFIG ----------------------
// We'll let Multer handle up to 5MB; for anything bigger, it fails immediately.
// We'll also do our own min-size check AFTER Multer stores the file.
const upload = multer({
    dest: path.join(__dirname, "..", "uploads"),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
        // Only allow image mime types
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed"), false);
        }
        cb(null, true);
    },
});

// ---------------------- UTILITY: Remove a file if we reject it after upload ----------------------
function removeUploadedFile(file) {
    if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
    }
}

// ---------------------- REGISTER ----------------------
router.post("/register", (req, res) => {
    // Wrap single-file upload so we can catch Multer errors
    upload.single("profilePicture")(req, res, async (err) => {
        // If Multer threw an error (e.g., bigger than 5MB, not an image, etc.)
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                // File is bigger than 5MB
                return res.status(400).json({
                    error: "Зурагны хэмжээ хамгийн ихдээ 5MB байх ёстой.",
                });
            }
            // Some other Multer or fileFilter error
            return res.status(400).json({ error: err.message });
        }

        try {
            // If user actually uploaded a file, do the MIN size check (10KB)
            if (req.file) {
                if (req.file.size < MIN_FILE_SIZE) {
                    removeUploadedFile(req.file);
                    return res.status(400).json({
                        error: "Зурагны хэмжээ хамгийн багадаа 10KB байх ёстой.",
                    });
                }
            }

            // Debug logs to see what’s incoming
            console.log("------ REGISTER BODY ------");
            console.log(req.body);
            console.log("------ REGISTER FILE ------");
            console.log(req.file);

            // Destructure fields
            const { username, password, phoneNumber, location, gender } = req.body;

            // Parse birthday from JSON string
            let birthday = {};
            try {
                birthday = JSON.parse(req.body.birthday);
            } catch (parseErr) {
                removeUploadedFile(req.file);
                return res.status(400).json({ error: "Invalid birthday format" });
            }

            // Build file path if a file was uploaded
            let profilePicturePath = "";
            if (req.file) {
                profilePicturePath = "/uploads/" + req.file.filename;
            }

            // Validate required fields
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
                removeUploadedFile(req.file);
                return res.status(400).json({
                    error:
                        "Missing required fields (username, password, phoneNumber, location, gender, birthday)",
                });
            }

            // Check if username is taken
            const existing = await User.findOne({ username });
            if (existing) {
                removeUploadedFile(req.file);
                return res.status(400).json({ error: "Username already in use" });
            }

            // Hash password
            const hashedPw = await bcrypt.hash(password, 10);

            // Create new user
            const newUser = await User.create({
                username,
                password: hashedPw,
                phoneNumber,
                location,
                gender,
                birthday,
                profilePicture: profilePicturePath,
            });

            // Success!
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
        } catch (error) {
            console.error("Register error:", error);
            removeUploadedFile(req.file);
            return res.status(500).json({ error: "Server error" });
        }
    });
});

// ---------------------- LOGIN ----------------------
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

        // Generate JWT
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

// ---------------------- PUBLIC PROFILE (by ID) ----------------------
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

// ---------------------- GET OWN PROFILE ----------------------
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
