import { Router } from 'express';
import { list, markRead, markAllRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const r = Router();
r.use(protect);
r.get('/', list);
r.patch('/read-all', markAllRead);
r.patch('/:id/read', markRead);
export default r;
