import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';

export async function notify(io, userId, { type, message, listing }) {
  const n = await Notification.create({ user: userId, type, message, listing });
  io.to(`user:${userId}`).emit('notification', n);
  return n;
}

export const logActivity = (actor, action, listing, meta) =>
  ActivityLog.create({ actor, action, listing, meta }).catch(console.error);
