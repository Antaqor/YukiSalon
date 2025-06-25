const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { createServer } = require('http');
const express = require('express');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const ChatMessage = require('./models/ChatMessage');

const app = express();
const http = createServer(app);
const io = new Server(http, { cors: { origin: '*' } });

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('Missing MONGODB_URI');
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log('Connected to MongoDB for chat'))
  .catch(err => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });

io.on('connection', socket => {
  socket.on('join', room => socket.join(room));

  socket.on('chat-message', async ({ room, text, sender }) => {
    if (!room || !text || !sender) return;
    try {
      const msg = await ChatMessage.create({ room, text, sender });
      const full = await msg.populate('sender', 'username profilePicture');
      io.to(room).emit('chat-message', full);
    } catch (err) {
      console.error('Chat message error', err);
    }
  });
});

const PORT = process.env.CHAT_PORT || 5003;
http.listen(PORT, () => console.log('Chat server ' + PORT));
