require("dotenv").config({ path: "./server/.env" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/post");
const postCategoryRoutes = require("./routes/postCategory");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
    cors({
        origin: ["http://localhost:3000", "https://vone.mn"],
        credentials: true,
    })
);
app.use(express.json());

// Connect to Mongo
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
        seedPostCategories();
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err);
    });

// Seed categories if needed
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

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/post-categories", postCategoryRoutes);

app.get("/", (req, res) => {
    res.send("Server is working!");
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
