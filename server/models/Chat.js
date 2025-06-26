const mongoose = require('mongoose');
const { Schema, model, models } = mongoose;

const ChatSchema = new Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }]
  },
  { timestamps: true }
);

const Chat = models.Chat || model('Chat', ChatSchema);
module.exports = Chat;
