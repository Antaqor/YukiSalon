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
        // Select only the fields we actually have now
        const user = await User.findById(decoded.id).select(
            "username name phoneNumber location gender birthday profilePicture subscriptionExpiresAt following followers"
        );
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        req.user = user;
        next();
    } catch (err) {
        console.error("Authentication error:", err);
        return res.status(401).json({ error: "Invalid token" });
    }
};

module.exports = authenticateToken;
