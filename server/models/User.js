// server/models/User.js
const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const mbtiTypes = [
    "INTJ", "INTP", "ENTJ", "ENTP",
    "INFJ", "INFP", "ENFJ", "ENFP",
    "ISTJ", "ISFJ", "ESTJ", "ESFJ",
    "ISTP", "ISFP", "ESTP", "ESFP"
];

const UserSchema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        age: { type: Number, required: true },
        mbti: { type: String, required: true, enum: mbtiTypes }, // MBTI field

        /**
         * subscriptionExpiresAt: null => no subscription
         * new Date(...) => subscription expiration date
         */
        subscriptionExpiresAt: { type: Date, default: null },
    },
    { timestamps: true }
);

const User = models.User || model("User", UserSchema);
module.exports = User;
