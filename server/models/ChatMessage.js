const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;

const ChatMessageSchema = new Schema(
  {
    room: { type: String, required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const ChatMessage = models.ChatMessage || model('ChatMessage', ChatMessageSchema);
module.exports = ChatMessage;
