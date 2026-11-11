import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing' },
  meta: mongoose.Schema.Types.Mixed,
}, { timestamps: true });

export default mongoose.model('ActivityLog', activitySchema);
