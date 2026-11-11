import 'dotenv/config';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './socket.js';
import { startExpiryJob } from './jobs/expiry.js';

const PORT = process.env.PORT || 5000;

try {
  await connectDB();
  const server = http.createServer(app);
  const io = initSocket(server);
  app.set('io', io);
  startExpiryJob(io);
  server.listen(PORT, () => console.log(`ZeroSpoil API running on port ${PORT}`));
} catch (err) {
  console.error('Failed to start server:', err.message);
  process.exit(1);
}
