const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const PostSchema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        content: { type: String, required: true },
        image: { type: String }, // stores just the filename, e.g., "123456789-image.png"
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

const Post = models.Post || model("Post", PostSchema);
module.exports = Post;
