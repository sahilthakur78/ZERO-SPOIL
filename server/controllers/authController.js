import User from '../models/User.js';
import { AppError, asyncHandler, signToken } from '../utils/helpers.js';

export const register = asyncHandler(async (req, res) => {
  const user = await User.create(req.body); // role limited to donor|ngo by zod
  res.status(201).json({ token: signToken(user._id), user });
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.matchPassword(req.body.password)))
    throw new AppError('Invalid email or password', 401);
  if (user.isBlocked) throw new AppError('Your account has been suspended', 403);
  user.password = undefined;
  res.json({ token: signToken(user._id), user });
});

export const me = asyncHandler(async (req, res) => res.json(req.user));

export const updateProfile = asyncHandler(async (req, res) => {
  Object.assign(req.user, req.body);
  await req.user.save();
  res.json(req.user);
});
