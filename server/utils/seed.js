import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import FoodListing from '../models/FoodListing.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';

await connectDB();
await Promise.all([User.deleteMany(), FoodListing.deleteMany(), Notification.deleteMany(), ActivityLog.deleteMany()]);

await User.create({ name: 'Platform Admin', email: 'admin@zerospoil.com', password: 'Admin@123', role: 'admin', isVerified: true });
const donor = await User.create({
  name: 'Aman Verma', email: 'donor@zerospoil.com', password: 'Donor@123', role: 'donor',
  organization: 'Spice Route Restaurant', phone: '9876543210', isVerified: true,
  address: 'Phase 7, Mohali', lat: 30.7046, lng: 76.7179,
});
await User.create({
  name: 'Neha Sharma', email: 'ngo@zerospoil.com', password: 'Ngo@12345', role: 'ngo',
  organization: 'Hope Kitchen Foundation', phone: '9123456780', isVerified: true,
  address: 'Sector 17, Chandigarh', lat: 30.7398, lng: 76.7827,
});

const h = (n) => new Date(Date.now() + n * 36e5);
const samples = [
  ['Veg Biryani & Raita', 'veg', 40, 'servings', 'Phase 7 Market, Mohali', 76.7179, 30.7046, 5],
  ['Fresh Bread Loaves', 'bakery', 25, 'packets', 'Sector 70, Mohali', 76.7077, 30.7010, 3],
  ['Dal Makhani & Rice', 'veg', 60, 'servings', 'Phase 3B2, Mohali', 76.7230, 30.7110, 6],
  ['Packaged Fruit Boxes', 'packaged', 15, 'boxes', 'Sector 34, Chandigarh', 76.7679, 30.7230, 12],
  ['Paneer Wraps', 'veg', 30, 'servings', 'Industrial Area, Mohali', 76.7300, 30.6950, 1.5],
];
for (const [title, foodType, quantity, unit, pickupAddress, lng, lat, hours] of samples) {
  await FoodListing.create({
    donor: donor._id, title, foodType, quantity, unit, pickupAddress, contactPhone: '9876543210',
    expiresAt: h(hours), preparedAt: h(-1),
    description: 'Freshly prepared today. Packed in clean, sealed containers.',
    location: { type: 'Point', coordinates: [lng, lat] },
    history: [{ status: 'available', by: donor._id, note: 'Listing created' }],
  });
}
console.log('Seed complete.\n admin@zerospoil.com / Admin@123\n donor@zerospoil.com / Donor@123\n ngo@zerospoil.com / Ngo@12345');
await mongoose.disconnect();

