const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const UserSchema = new Schema(
    {
            username: { type: String, required: true, unique: true },
            email:    { type: String, required: true, unique: true },
            password: { type: String, required: true },
            profilePicture: { type: String, default: "" },
            rating:   { type: Number, default: 4.93 },
            subscriptionExpiresAt: { type: Date, default: null },
            following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
            followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

const User = models.User || model("User", UserSchema);
module.exports = User;
