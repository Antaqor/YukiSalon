const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sizeOf = require("image-size"); // for reading pixel dimensions

const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");

// ---------------------- FILE SIZE LIMITS (in bytes) ----------------------
const MIN_FILE_SIZE = 10 * 1024;        // 10KB
const MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5MB

// ---------------------- PIXEL DIMENSION LIMITS ----------------------
const MIN_WIDTH_PX = 300;
const MIN_HEIGHT_PX = 300;
const MAX_WIDTH_PX = 3000;
const MAX_HEIGHT_PX = 3000;

// ---------------------- MULTER CONFIG ----------------------
const upload = multer({
    dest: path.join(__dirname, "..", "uploads"),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
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
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    error: "Зурагны хэмжээ хамгийн ихдээ 5MB байх ёстой.",
                });
            }
            return res.status(400).json({ error: err.message });
        }

        try {
            // If user uploaded a file, perform checks:
            if (req.file) {
                // Check minimum file size
                if (req.file.size < MIN_FILE_SIZE) {
                    removeUploadedFile(req.file);
                    return res.status(400).json({
                        error: "Зурагны хэмжээ хамгийн багадаа 10KB байх ёстой.",
                    });
                }

                // Get pixel dimensions
                const dimensions = sizeOf(req.file.path);
                if (
                    dimensions.width < MIN_WIDTH_PX ||
                    dimensions.height < MIN_HEIGHT_PX ||
                    dimensions.width > MAX_WIDTH_PX ||
                    dimensions.height > MAX_HEIGHT_PX
                ) {
                    removeUploadedFile(req.file);
                    return res.status(400).json({
                        error: `Image dimensions out of range. The image must be between ${MIN_WIDTH_PX}x${MIN_HEIGHT_PX} and ${MAX_WIDTH_PX}x${MAX_HEIGHT_PX} pixels.`,
                    });
                }
            }

            console.log("------ REGISTER BODY ------");
            console.log(req.body);
            console.log("------ REGISTER FILE ------");
            console.log(req.file);

            // Destructure fields
            const { username, password, phoneNumber, location, gender } = req.body;
            let birthday = {};
            try {
                birthday = JSON.parse(req.body.birthday);
            } catch (parseErr) {
                removeUploadedFile(req.file);
                return res.status(400).json({ error: "Invalid birthday format" });
            }

            let profilePicturePath = "";
            if (req.file) {
                profilePicturePath = "/uploads/" + req.file.filename;
            }

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

            // Hash password and create new user
            const hashedPw = await bcrypt.hash(password, 10);
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
