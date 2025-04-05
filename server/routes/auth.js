const express = require("express");
const router = express.Router();
const { imageSize } = require("image-size"); // <--- named import
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Example: 10KB min, 5MB max
const MIN_FILE_SIZE = 10 * 1024;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Example: 100–8000 px dimension
const MIN_WIDTH_PX = 100;
const MAX_WIDTH_PX = 8000;
const MIN_HEIGHT_PX = 100;
const MAX_HEIGHT_PX = 8000;

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

function removeUploadedFile(file) {
    if (file && file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
    }
}

router.post("/register", (req, res) => {
    upload.single("profilePicture")(req, res, async (err) => {
        if (err) {
            if (err.code === "LIMIT_FILE_SIZE") {
                return res.status(400).json({
                    error: "File exceeds 5MB limit.",
                });
            }
            return res.status(400).json({ error: err.message });
        }

        try {
            if (req.file) {
                if (req.file.size < MIN_FILE_SIZE) {
                    removeUploadedFile(req.file);
                    return res.status(400).json({
                        error: "Image must be at least 10KB.",
                    });
                }

                // Now use the named function:
                const dimensions = imageSize(req.file.path);
                if (
                    dimensions.width < MIN_WIDTH_PX ||
                    dimensions.width > MAX_WIDTH_PX ||
                    dimensions.height < MIN_HEIGHT_PX ||
                    dimensions.height > MAX_HEIGHT_PX
                ) {
                    removeUploadedFile(req.file);
                    return res.status(400).json({
                        error: `Dimensions out of range. Must be between ${MIN_WIDTH_PX}–${MAX_WIDTH_PX} px wide and ${MIN_HEIGHT_PX}–${MAX_HEIGHT_PX} px tall.`,
                    });
                }
            }

            // ... The rest of your registration logic ...
            return res.status(201).json({ message: "User registered!" });
        } catch (error) {
            console.error("Register error:", error);
            removeUploadedFile(req.file);
            return res.status(500).json({ error: "Server error" });
        }
    });
});

module.exports = router;
