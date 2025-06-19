const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const ReplySchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const CommentSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    replies: [ReplySchema],
});

const PostSchema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        // If this is a shared post, reference the original post
        sharedFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
        content: { type: String, required: true },
        image: { type: String }, // stores just the filename, e.g., "123456789-image.png"
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        comments: [CommentSchema],
        shares: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Post = models.Post || model("Post", PostSchema);
module.exports = Post;
