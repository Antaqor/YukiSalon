const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Book = require("../models/Book");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("Created uploads folder:", uploadDir);
}

// Multer configuration with disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_")
            .replace(/[^а-яА-ЯёЁa-zA-Z0-9.\-_]/g, "");
        const uniqueSuffix = Date.now() + "-" + safeName;
        cb(null, uniqueSuffix);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith("image/")) {
            return cb(new Error("Зөвхөн зураг оруулна уу!"));
        }
        cb(null, true);
    },
});

// CREATE new book with image upload
router.post("/", upload.single("coverImage"), async (req, res) => {
    // Debug logs to inspect incoming data
    console.log("Request body:", req.body);
    console.log("Uploaded file:", req.file);

    try {
        const { title, author, description, price, saleActive, salePrice } = req.body;
        let coverImageUrl = "";
        if (req.file) {
            coverImageUrl = "uploads/" + req.file.filename;
        }

        const newBook = await Book.create({
            title,
            author,
            description,
            price: Number(price) || 0,
            coverImageUrl,
            saleActive: saleActive === "true",
            salePrice: Number(salePrice) || 0,
        });

        res.json(newBook);
    } catch (err) {
        console.error("Error creating book:", err.message, err.stack);
        res.status(500).json({ error: "Server error while creating book." });
    }
});

// READ all books
router.get("/", async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.json(books);
    } catch (err) {
        console.error("Error fetching books:", err.message, err.stack);
        res.status(500).json({ error: "Server error while fetching books." });
    }
});

// READ a single book by ID
router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ error: "Book not found." });
        res.json(book);
    } catch (err) {
        console.error("Error fetching book:", err.message, err.stack);
        res.status(500).json({ error: "Server error while fetching book." });
    }
});

// UPDATE a book (with optional image upload)
router.put("/:id", upload.single("coverImage"), async (req, res) => {
    try {
        const { title, author, description, price, saleActive, salePrice } = req.body;
        let coverImageUrl;
        if (req.file) {
            coverImageUrl = "uploads/" + req.file.filename;
        }

        const updatedData = {
            title,
            author,
            description,
            price: Number(price) || 0,
            saleActive: saleActive === "true",
            salePrice: Number(salePrice) || 0,
        };

        if (coverImageUrl) updatedData.coverImageUrl = coverImageUrl;

        const updatedBook = await Book.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        if (!updatedBook) return res.status(404).json({ error: "Book not found." });
        res.json(updatedBook);
    } catch (err) {
        console.error("Error updating book:", err.message, err.stack);
        res.status(500).json({ error: "Server error while updating book." });
    }
});

// DELETE a book
router.delete("/:id", async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ error: "Book not found." });
        res.json({ message: "Book deleted successfully." });
    } catch (err) {
        console.error("Error deleting book:", err.message, err.stack);
        res.status(500).json({ error: "Server error while deleting book." });
    }
});

// Global error handler for Multer errors
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(400).json({ error: err.message });
    } else if (err) {
        console.error("Unknown error:", err);
        return res.status(500).json({ error: "An unknown error occurred." });
    }
    next();
});

module.exports = router;
