// server/index.js
require("dotenv").config({ path: "./server/.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Маршрут файл
const authRoutes = require("./routes/auth");
const subscriptionRoutes = require("./routes/subscription");
const postRoutes = require("./routes/post");

const app = express();
const PORT = process.env.PORT || 5001;

/**
 * CORS тохиргоо — frontend “http://localhost:3000” ажиллаж байвал origin-д нэм
 */
app.use(
    cors({
        origin: ["http://localhost:3000"],
        credentials: true,
    })
);

// JSON parse
app.use(express.json());

// MongoDB холболт
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Маршрутууд
app.use("/api/auth", authRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/posts", postRoutes);

app.get("/", (req, res) => {
    res.send("Server is working!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
