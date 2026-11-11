import { Router } from 'express';
import { register, login, me, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, profileSchema } from '../validators/schemas.js';

const r = Router();
r.post('/register', validate(registerSchema), register);
r.post('/login', validate(loginSchema), login);
r.get('/me', protect, me);
r.patch('/me', protect, validate(profileSchema), updateProfile);
export default r;
