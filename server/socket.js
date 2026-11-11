import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','), credentials: true },
  });

  io.use(async (socket, next) => {
    try {
      const { id } = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
      const user = await User.findById(id);
      if (!user || user.isBlocked) return next(new Error('unauthorized'));
      socket.user = user;
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user._id}`);
    socket.join(`role:${socket.user.role}`);
  });

  return io;
}
