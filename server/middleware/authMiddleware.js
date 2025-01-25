// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "change-me");
        const user = await User.findById(decoded.id).select("username age mbti subscriptionExpiresAt");
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        req.user = user; // Attach user to request
        next();
    } catch (err) {
        console.error("Authentication error:", err);
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = authenticateToken;
