require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const ideaRoutes = require('./routes/ideas');
const profileRoutes = require('./routes/profile');

const app = express();
app.use(cors());
app.use(express.json());

// ensure uploads folder exists and serve it
fs.mkdirSync(path.join(__dirname, 'uploads', 'avatars'), { recursive: true });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
app.set('io', io);

io.on('connection', socket => {
  console.log('Socket connected', socket.id);
  socket.on('disconnect', ()=>{})
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ideas-app')
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => console.log('Server listening on', PORT));
  })
  .catch(err => {
    console.error('MongoDB connection error', err);
  });
