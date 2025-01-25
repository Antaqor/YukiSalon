// server/models/Post.js
const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const PostSchema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        title: { type: String, required: true },
        content: { type: String, required: true },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PostCategory",
            required: false,
        },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // New field for likes
    },
    { timestamps: true }
);

const Post = models.Post || model("Post", PostSchema);
module.exports = Post;
