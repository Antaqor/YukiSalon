// server/models/User.js
const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const UserSchema = new Schema(
    {
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        age: { type: Number, required: true },

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
