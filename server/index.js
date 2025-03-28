require("dotenv").config({ path: "./server/.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const userRoutes = require("./routes/user");
const paymentRoutes = require("./routes/payment");

// 1. Шинээр bookRoutes импортлох
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

// Serve static files from "uploads" folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// MongoDB connect
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// 2. Бусад route-уудаа дуудах
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);

// 3. Шинэ номын route - /api/books
app.use("/api/books", bookRoutes);

app.get("/", (req, res) => {
    res.send("Server is working!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
