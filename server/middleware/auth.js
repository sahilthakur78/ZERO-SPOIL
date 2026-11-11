import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../utils/helpers.js';

export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError('Not authenticated', 401);
  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    throw new AppError('Session expired, please log in again', 401);
  }
  const user = await User.findById(decoded.id);
  if (!user) throw new AppError('Account no longer exists', 401);
  if (user.isBlocked) throw new AppError('Your account has been suspended', 403);
  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role)
    ? next()
    : next(new AppError('You do not have permission to perform this action', 403));
