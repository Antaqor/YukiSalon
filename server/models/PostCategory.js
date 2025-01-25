// server/models/PostCategory.js
const mongoose = require("mongoose");
const { Schema, model, models } = mongoose;

const PostCategorySchema = new Schema(
    {
        name: { type: String, required: true, unique: true },
    },
    { timestamps: true }
);

const PostCategory = models.PostCategory || model("PostCategory", PostCategorySchema);
module.exports = PostCategory;
