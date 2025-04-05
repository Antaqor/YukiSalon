const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const User = require("../models/User");
const authenticateToken = require("../middleware/authMiddleware");

// ---------------------- MULTER CONFIG ----------------------
// We'll limit files to 5 MB max. Then we’ll do an *additional* min-size check afterward (10 KB).
const upload = multer({
    dest: path.join(__dirname, "..", "uploads"),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (req, file, cb) => {
        // Only allow image mime types
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Only image files are allowed"), false);
        }
        cb(null, true);
    },
});

// Helper for removing an unwanted file (e.g. if we fail validation after upload)
function removeUploadedFile(file) {
    if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
    }
}

// ---------------------- REGISTER ----------------------
router.post("/register", (req, res) => {
    // Wrap the single-file upload so we can properly catch Multer errors
    upload.single("profilePicture")(req, res, async (err) => {
        if (err) {
            // Multer-specific error -> check if it's a file-size limit
            if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    error: "Image size must be between 10KB and 5MB.",
                });
            }
            // Some other Multer error (mime type, etc.)
            return res.status(400).json({ error: err.message });
        }

        try {
            // If we have a file, do the min-size check (10KB)
            if (req.file) {
                if (req.file.size < 10 * 1024) {
                    removeUploadedFile(req.file);
                    return res.status(400).json({
                        error: "Image size must be between 10KB and 5MB.",
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
                // If we fail, remove file so it doesn't linger
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
                // If fails, remove file
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
            // On any server error, remove file
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
