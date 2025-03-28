// server/index.js
require("dotenv").config({ path: "./server/.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

// Import routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const userRoutes = require("./routes/user");
const paymentRoutes = require("./routes/payment");
const bookRoutes = require("./routes/bookRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

app.set("trust proxy", 1);

app.use(
    cors({
        origin: ["https://vone.mn", "https://www.vone.mn", "http://localhost:3000"],
        credentials: true,
    })
);

app.use(express.json());

// Define uploads directory as "server/uploads" relative to the project root.
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "server", "uploads");
console.log("Uploads Directory:", UPLOAD_DIR);

// Ensure the uploads directory exists.
if (!fs.existsSync(UPLOAD_DIR)) {
    try {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        console.log(`Created uploads folder at: ${UPLOAD_DIR}`);
    } catch (err) {
        console.error("Error creating uploads folder:", err);
        process.exit(1);
    }
}

// Serve static files from the uploads folder.
// Requests to "/uploads" are mapped to the "server/uploads" folder.
app.use("/uploads", express.static(UPLOAD_DIR));

// Connect to MongoDB.
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Mount API routes.
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/books", bookRoutes);

app.get("/", (req, res) => {
    res.send("Server is working!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
