import { Router } from 'express';
import User from '../models/User.js';
import FoodListing from '../models/FoodListing.js';
import { asyncHandler } from '../utils/helpers.js';

const r = Router();
r.get('/stats', asyncHandler(async (req, res) => {
  const [agg, donors, ngos] = await Promise.all([
    FoodListing.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, deliveries: { $sum: 1 }, people: { $sum: '$peopleServed' } } },
    ]),
    User.countDocuments({ role: 'donor' }),
    User.countDocuments({ role: 'ngo' }),
  ]);
  res.json({ deliveries: agg[0]?.deliveries || 0, people: agg[0]?.people || 0, donors, ngos });
}));
export default r;
