// server/index.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") }); // loads ./server/.env

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const fs       = require("fs");

// ── routes ─────────────────────────────────────────────
const authRoutes    = require("./routes/auth");
const postRoutes    = require("./routes/post");
const userRoutes    = require("./routes/user");
const paymentRoutes = require("./routes/payment");
const bookRoutes    = require("./routes/bookRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes    = require("./routes/cartRoutes"); // ← feature branch win

const app  = express();
const PORT = process.env.PORT || 5001;

app.set("trust proxy", 1);

// ── CORS (tweak domains when you deploy) ──────────────
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://vone.mn",
      "https://www.vone.mn",
    ],
    credentials: true,
  }),
);

app.use(express.json());

// ── static uploads ────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log("Created uploads folder at:", UPLOAD_DIR);
}
app.use("/uploads",      express.static(UPLOAD_DIR));
app.use("/api/uploads",  express.static(UPLOAD_DIR));

// ── MongoDB ────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅  Connected to MongoDB"))
  .catch((err) => console.error("❌  MongoDB connection error:", err));

// ── route mounting ────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/posts",    postRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/books",    bookRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart",     cartRoutes); // ← now live

// ── heartbeat ─────────────────────────────────────────
app.get("/", (_, res) => res.send("Server is working!"));

// ── fire it up ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`⚡️ Server running on port ${PORT}`);
});
