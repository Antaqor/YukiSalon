// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: "No authorization header" });
    }
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        return res.status(401).json({ error: "Use 'Bearer <token>' format" });
    }

    const token = parts[1];
    const secret = process.env.JWT_SECRET || "change-me";

    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Token invalid or expired" });
        }
        // Амжилттай decode => req.user
        req.user = decoded; // { id, username, iat, exp }
        next();
    });
};
