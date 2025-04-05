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

// CORS
app.use(
    cors({
        origin: ["https://vone.mn", "https://www.vone.mn", "http://localhost:3000"],
        credentials: true,
    })
);

// Parse JSON for non-file endpoints
app.use(express.json());

// Ensure "uploads" folder is ready
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    console.log(`Created uploads folder at: ${UPLOAD_DIR}`);
}

// Serve static files from "/uploads"
app.use("/uploads", express.static(UPLOAD_DIR));

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Mount API routes
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
