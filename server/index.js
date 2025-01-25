// server/index.js
require("dotenv").config({ path: "./server/.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Маршрут файл
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const postCategoryRoutes = require("./routes/postCategory");
const subscriptionRoutes = require("./routes/subscription");


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
        seedPostCategories(); // Хүсвэл default категори үүсгэх
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Жишээ: Default PostCategory seed
async function seedPostCategories() {
    const PostCategory = require("./models/PostCategory");
    const defaultCategories = [
        { name: "Арилжаа" },
        { name: "Түүх" },
        { name: "Эдийн засаг" },
        { name: "Англи хэл" },
        { name: "Хиймэл оюун ухаан" },
        { name: "Програм хангамж" },
        { name: "Хувь хүний хөгжил" },
        { name: "Харилцаа" },
    ];
    for (const cat of defaultCategories) {
        const existing = await PostCategory.findOne({ name: cat.name });
        if (!existing) {
            await PostCategory.create(cat);
            console.log("Seeded:", cat.name);
        }
    }
}

// Маршрутууд
app.use("/api/auth", authRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/post-categories", postCategoryRoutes);

app.get("/", (req, res) => {
    res.send("Server is working!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
