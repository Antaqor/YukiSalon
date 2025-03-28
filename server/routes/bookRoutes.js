const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const Book = require("../models/Book");

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log("Created uploads folder:", uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        let safeName = file.originalname
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "_")
            .replace(/[^а-яА-ЯёЁa-zA-Z0-9.\-_]/g, "");
        const uniqueSuffix = Date.now() + "-" + safeName;
        cb(null, uniqueSuffix);
    },
});
const upload = multer({ storage });

// POST /api/books (Create)
router.post("/", upload.single("coverImage"), async (req, res) => {
    try {
        const {
            title,
            author,
            description,
            price,
            saleActive,
            salePrice,
        } = req.body;

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
        console.error("Error creating book:", err);
        res.status(500).json({ error: "Server error while creating book." });
    }
});

// GET /api/books (Read All)
router.get("/", async (req, res) => {
    try {
        const books = await Book.find().sort({ createdAt: -1 });
        res.json(books);
    } catch (err) {
        console.error("Error fetching books:", err);
        res.status(500).json({ error: "Server error while fetching books." });
    }
});

// GET /api/books/:id (Read One)
router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ error: "Book not found." });
        res.json(book);
    } catch (err) {
        console.error("Error fetching single book:", err);
        res.status(500).json({ error: "Server error fetching that book." });
    }
});

// PUT /api/books/:id (Update)
router.put("/:id", upload.single("coverImage"), async (req, res) => {
    try {
        const {
            title,
            author,
            description,
            price,
            saleActive,
            salePrice,
        } = req.body;
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

        const book = await Book.findByIdAndUpdate(req.params.id, updatedData, {
            new: true,
        });
        if (!book) return res.status(404).json({ error: "Book not found." });

        res.json(book);
    } catch (err) {
        console.error("Error updating book:", err);
        res.status(500).json({ error: "Server error updating book." });
    }
});

// DELETE /api/books/:id
router.delete("/:id", async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ error: "Book not found." });
        res.json({ message: "Book deleted successfully." });
    } catch (err) {
        console.error("Error deleting book:", err);
        res.status(500).json({ error: "Server error deleting book." });
    }
});

module.exports = router;