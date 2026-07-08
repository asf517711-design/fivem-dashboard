const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// استيراد المسارات
const authRoutes = require('./routes/auth');
const playerRoutes = require('./routes/players');
const serverRoutes = require('./routes/server');

// المسارات
app.use('/api/auth', authRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/server', serverRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', message: 'Server is running ✅' });
});

// Socket.IO Events
io.on('connection', (socket) => {
  console.log('New connection:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  socket.on('get-players', (data) => {
    // بث إحصائيات اللاعبين
    io.emit('players-update', {
      count: 0,
      list: []
    });
  });
});

// معالج الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard ready!`);
});