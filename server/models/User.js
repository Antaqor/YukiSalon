const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const BirthdaySchema = new Schema({
    year:  { type: String, required: true },
    month: { type: String, required: true },
    day:   { type: String, required: true },
});

const UserSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        // REMOVED "name" completely

        phoneNumber: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: true,
        },
        gender: {
            type: String,
            required: true,
        },
        birthday: {
            type: BirthdaySchema,
            required: true,
        },
        profilePicture: {
            type: String,
            default: "",
        },
        rating: {
            type: Number,
            default: 4.93,
        },
        subscriptionExpiresAt: {
            type: Date,
            default: null,
        },
        following: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        ],
        followers: [
            { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        ],
    },
    { timestamps: true }
);

const User = models.User || model("User", UserSchema);
module.exports = User;
