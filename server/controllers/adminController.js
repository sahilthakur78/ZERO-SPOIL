import User from '../models/User.js';
import FoodListing from '../models/FoodListing.js';
import ActivityLog from '../models/ActivityLog.js';
import { AppError, asyncHandler, escapeRegex, str } from '../utils/helpers.js';
import { notify, logActivity } from '../services/activity.js';

export const getStats = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 7 * 864e5);
  since.setHours(0, 0, 0, 0);
  const [users, byStatus, impact, trend, pendingNgos] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    FoodListing.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    FoodListing.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, people: { $sum: '$peopleServed' }, deliveries: { $sum: 1 } } },
    ]),
    FoodListing.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          created: { $sum: 1 },
          delivered: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
      } },
      { $sort: { _id: 1 } },
    ]),
    User.countDocuments({ role: 'ngo', isVerified: false }),
  ]);
  res.json({
    users: Object.fromEntries(users.map((u) => [u._id, u.count])),
    listings: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    people: impact[0]?.people || 0,
    deliveries: impact[0]?.deliveries || 0,
    pendingNgos,
    trend,
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  const role = str(req.query.role), q = str(req.query.q);
  if (role) filter.role = role;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ name: rx }, { email: rx }, { organization: rx }];
  }
  res.json(await User.find(filter).sort('-createdAt').limit(200));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === 'admin') throw new AppError('Admin accounts cannot be modified here', 403);
  const { isVerified, isBlocked } = req.body;
  if (typeof isVerified === 'boolean') user.isVerified = isVerified;
  if (typeof isBlocked === 'boolean') user.isBlocked = isBlocked;
  await user.save();
  if (typeof isVerified === 'boolean' && isVerified)
    await notify(req.app.get('io'), user._id, { type: 'verified', message: 'Your organisation has been verified. Welcome aboard!' });
  await logActivity(req.user._id, 'USER_UPDATED', undefined, { user: user.email, isVerified, isBlocked });
  res.json(user);
});

export const listAllListings = asyncHandler(async (req, res) => {
  const filter = {};
  const status = str(req.query.status);
  if (status) filter.status = status;
  res.json(await FoodListing.find(filter).sort('-createdAt').limit(200)
    .populate('donor', 'name organization').populate('claimedBy', 'name organization'));
});

export const deleteListing = asyncHandler(async (req, res) => {
  const l = await FoodListing.findByIdAndDelete(req.params.id);
  if (!l) throw new AppError('Listing not found', 404);
  await logActivity(req.user._id, 'LISTING_REMOVED_BY_ADMIN', undefined, { title: l.title });
  res.json({ message: 'Listing removed' });
});

export const getActivity = asyncHandler(async (req, res) => {
  res.json(await ActivityLog.find().sort('-createdAt').limit(100)
    .populate('actor', 'name role').populate('listing', 'title'));
});
