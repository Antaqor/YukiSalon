// server/index.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") }); // loads ./server/.env

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
const fs       = require("fs");
const { createServer } = require("http");
const { Server } = require("socket.io");

// ── routes ─────────────────────────────────────────────
const authRoutes    = require("./routes/auth");
const postRoutes    = require("./routes/post");
const userRoutes    = require("./routes/user");
const paymentRoutes = require("./routes/payment");
const bookRoutes    = require("./routes/bookRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes    = require("./routes/cartRoutes"); // ← feature branch win
const notificationRoutes = require("./routes/notification");
const pushRoutes    = require("./routes/push");
const lessonRoutes  = require("./routes/lessonRoutes");
const webpush       = require("web-push");
const chatRoutesFn  = require("./routes/chat");

const app  = express();
const http = createServer(app);
const io = new Server(http, { cors: { origin: '*' } });
const PORT = process.env.PORT || 5001;

// ── Web Push VAPID setup ───────────────────────────────
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || 'example@example.com'}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

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
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("❌  MONGODB_URI environment variable is not set. Check server/.env");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅  Connected to MongoDB"))
  .catch((err) => {
    console.error("❌  MongoDB connection error:", err);
    process.exit(1);
  });

// ── route mounting ────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/posts",    postRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/books",    bookRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart",     cartRoutes); // ← now live
app.use("/api/notifications", notificationRoutes);
app.use("/api/push",     pushRoutes);
const chatRoutes = chatRoutesFn(io);
app.use("/api/chat",    chatRoutes);
app.use("/api/lessons", lessonRoutes);

// ── heartbeat ─────────────────────────────────────────
app.get("/", (_, res) => res.send("Server is working!"));

// ── Socket.IO events ──────────────────────────────────
io.on('connection', socket => {
  socket.on('join', room => socket.join(room));
  socket.on('typing', ({ room }) => {
    if (room) socket.to(room).emit('typing');
  });
});

// ── fire it up ────────────────────────────────────────
http.listen(PORT, () => {
  console.log(`⚡️ Server running on port ${PORT}`);
});
