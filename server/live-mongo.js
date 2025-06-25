const { createServer } = require('http');
const express = require('express');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

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
  .then(() => console.log('Connected to MongoDB for change stream'))
  .catch(err => {
    console.error('MongoDB connection error', err);
    process.exit(1);
  });

const postSchema = new mongoose.Schema({}, { strict: false, collection: 'posts' });
const Post = mongoose.model('Post', postSchema);

Post.watch([{ $match: { operationType: 'insert' } }]).on('change', change => {
  if (change.fullDocument) {
    io.emit('new-post', change.fullDocument);
  }
});

io.on('connection', socket => {
  socket.on('join', room => socket.join(room));
});

const PORT = process.env.LIVE_PORT || 5002;
http.listen(PORT, () => console.log('Mongo live server ' + PORT));
