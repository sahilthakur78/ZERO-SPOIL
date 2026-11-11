import FoodListing from '../models/FoodListing.js';
import { notify } from '../services/activity.js';
import { emitListing } from '../services/realtime.js';

export function startExpiryJob(io) {
  const run = async () => {
    const stale = await FoodListing.find({
      status: { $in: ['available', 'claimed'] },
      expiresAt: { $lte: new Date() },
    });
    for (const l of stale) {
      l.status = 'expired';
      l.history.push({ status: 'expired', note: 'Use-by time passed before pickup' });
      await l.save();
      const message = `"${l.title}" expired before it could be picked up`;
      await notify(io, l.donor, { type: 'expired', message, listing: l._id });
      if (l.claimedBy) await notify(io, l.claimedBy, { type: 'expired', message, listing: l._id });
      emitListing(io, l);
    }
  };
  run().catch(console.error);
  setInterval(() => run().catch(console.error), 60_000);
}
