import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  status: String,
  by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  note: String,
  at: { type: Date, default: Date.now },
}, { _id: false });

const foodSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 500 },
  foodType: { type: String, enum: ['veg', 'non-veg', 'vegan', 'bakery', 'packaged', 'other'], required: true },
  quantity: { type: Number, required: true, min: 1 },
  unit: { type: String, enum: ['servings', 'kg', 'packets', 'boxes'], default: 'servings' },
  pickupAddress: { type: String, required: true, trim: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [lng, lat]
  },
  contactPhone: String,
  preparedAt: Date,
  availableFrom: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  status: {
    type: String,
    enum: ['available', 'claimed', 'picked_up', 'delivered', 'expired', 'cancelled'],
    default: 'available',
    index: true,
  },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  claimedAt: Date,
  pickedUpAt: Date,
  deliveredAt: Date,
  peopleServed: { type: Number, default: 0 },
  deliveryNote: String,
  history: [historySchema],
}, { timestamps: true });

foodSchema.index({ location: '2dsphere' });
foodSchema.index({ status: 1, expiresAt: 1 });

export default mongoose.model('FoodListing', foodSchema);
