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
            mbti: { type: String, required: true, enum: mbtiTypes }, // MBTI талбар нэмэх

            /**
             * subscriptionExpiresAt: null => subscription байхгүй
             * new Date(...) => 30 хоногийн дараа гэх мэт
             */
            subscriptionExpiresAt: { type: Date, default: null },
    },
    { timestamps: true }
);

const User = models.User || model("User", UserSchema);
module.exports = User;
