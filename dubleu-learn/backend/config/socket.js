const socketIO = require('socket.io');

let io;

const initSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-course', (courseId) => {
      socket.join(courseId);
      console.log(`User ${socket.id} joined course ${courseId}`);
    });

    socket.on('send-message', (data) => {
      io.to(data.courseId).emit('new-message', data);
    });

    socket.on('typing-start', (data) => {
      socket.to(data.courseId).emit('user-typing', data);
    });

    socket.on('typing-stop', (data) => {
      socket.to(data.courseId).emit('user-stop-typing', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };