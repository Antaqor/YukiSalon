const { createServer } = require('http');
const express = require('express');
const { Server } = require('socket.io');
const Redis = require('ioredis');

const app = express();
const http = createServer(app);
const io = new Server(http, { cors: { origin: '*' } });

const redisUrl = process.env.REDIS_URL;
const pub = new Redis(redisUrl);
const sub = new Redis(redisUrl);

sub.subscribe('posts');

sub.on('message', (_channel, raw) => {
  try {
    const post = JSON.parse(raw);
    io.emit('new-post', post);
  } catch (err) {
    console.error('Invalid post message', err);
  }
});

io.on('connection', socket => {
  socket.on('join', room => socket.join(room));
});

const PORT = process.env.LIVE_PORT || 5002;
http.listen(PORT, () => console.log('Live server ' + PORT));

