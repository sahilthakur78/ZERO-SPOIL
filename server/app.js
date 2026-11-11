import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.js';
import foodRoutes from './routes/food.js';
import adminRoutes from './routes/admin.js';
import notificationRoutes from './routes/notifications.js';
import publicRoutes from './routes/public.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','),
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.use('/api', rateLimit({ windowMs: 60_000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60_000, limit: 40 }), authRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/public', publicRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.use(notFound);
app.use(errorHandler);

export default app;
