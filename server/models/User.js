const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    location: { type: String, required: true },
    gender: { type: String, required: true },
    birthday: {
        year: Number,
        month: String,
        day: Number,
    },
    profilePicture: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    subscriptionExpiresAt: { type: Date },
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    rating: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", UserSchema);
