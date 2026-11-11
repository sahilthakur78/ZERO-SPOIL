import { Router } from 'express';
import * as c from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const r = Router();
r.use(protect, authorize('admin'));
r.get('/stats', c.getStats);
r.get('/users', c.listUsers);
r.patch('/users/:id', c.updateUser);
r.get('/listings', c.listAllListings);
r.delete('/listings/:id', c.deleteListing);
r.get('/activity', c.getActivity);
export default r;
