import FoodListing from '../models/FoodListing.js';
import { AppError, asyncHandler, escapeRegex, haversineKm, str } from '../utils/helpers.js';
import { notify, logActivity } from '../services/activity.js';
import { emitListing, publicView } from '../services/realtime.js';

const PARTIES = [
  { path: 'donor', select: 'name organization phone isVerified' },
  { path: 'claimedBy', select: 'name organization phone isVerified' },
];
const id = (v) => String(v?._id ?? v);

/* ------------------------------ DONOR ------------------------------ */
export const createListing = asyncHandler(async (req, res) => {
  const { lat, lng, ...rest } = req.body;
  if (rest.availableFrom && rest.availableFrom >= rest.expiresAt)
    throw new AppError('Available-from must be earlier than the use-by time');
  const listing = await FoodListing.create({
    ...rest,
    donor: req.user._id,
    location: { type: 'Point', coordinates: [lng, lat] },
    history: [{ status: 'available', by: req.user._id, note: 'Listing created' }],
  });
  await listing.populate(PARTIES);
  const io = req.app.get('io');
  io.to('role:ngo').emit('listing:new', publicView(listing));
  await logActivity(req.user._id, 'LISTING_CREATED', listing._id, { title: listing.title });
  res.status(201).json(listing);
});

export const updateListing = asyncHandler(async (req, res) => {
  const l = await FoodListing.findById(req.params.id);
  if (!l) throw new AppError('Listing not found', 404);
  if (id(l.donor) !== id(req.user._id)) throw new AppError('Not your listing', 403);
  if (l.status !== 'available') throw new AppError('Only available listings can be edited', 409);
  const { lat, lng, ...rest } = req.body;
  Object.assign(l, rest);
  if (lat !== undefined && lng !== undefined) l.location = { type: 'Point', coordinates: [lng, lat] };
  l.history.push({ status: 'available', by: req.user._id, note: 'Listing edited' });
  await l.save();
  await l.populate(PARTIES);
  emitListing(req.app.get('io'), l);
  res.json(l);
});

export const cancelListing = asyncHandler(async (req, res) => {
  const l = await FoodListing.findById(req.params.id);
  if (!l) throw new AppError('Listing not found', 404);
  if (id(l.donor) !== id(req.user._id)) throw new AppError('Not your listing', 403);
  if (!['available', 'claimed'].includes(l.status))
    throw new AppError(`A ${l.status} listing cannot be cancelled`, 409);
  const hadClaimer = l.claimedBy;
  l.status = 'cancelled';
  l.history.push({ status: 'cancelled', by: req.user._id, note: 'Cancelled by donor' });
  await l.save();
  await l.populate(PARTIES);
  const io = req.app.get('io');
  if (hadClaimer)
    await notify(io, hadClaimer, { type: 'cancelled', message: `"${l.title}" was cancelled by the donor`, listing: l._id });
  emitListing(io, l);
  await logActivity(req.user._id, 'LISTING_CANCELLED', l._id, { title: l.title });
  res.json(l);
});

/* ------------------------------- NGO ------------------------------- */
export const browseListings = asyncHandler(async (req, res) => {
  const q = str(req.query.q), foodType = str(req.query.foodType);
  const lat = parseFloat(req.query.lat), lng = parseFloat(req.query.lng);
  const radius = Math.min(parseFloat(req.query.radius) || 15, 100);
  const hasPos = Number.isFinite(lat) && Number.isFinite(lng);

  const filter = { status: 'available', expiresAt: { $gt: new Date() } };
  if (foodType) filter.foodType = foodType;
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i');
    filter.$or = [{ title: rx }, { pickupAddress: rx }, { description: rx }];
  }
  if (hasPos)
    filter.location = {
      $nearSphere: { $geometry: { type: 'Point', coordinates: [lng, lat] }, $maxDistance: radius * 1000 },
    };

  let query = FoodListing.find(filter)
    .select('-contactPhone -history -claimedBy')
    .populate('donor', 'name organization isVerified')
    .limit(100);
  if (!hasPos) query = query.sort({ expiresAt: 1 }); // most urgent first
  const listings = await query.lean();

  res.json(listings.map((l) => ({
    ...l,
    distanceKm: hasPos
      ? +haversineKm(lat, lng, l.location.coordinates[1], l.location.coordinates[0]).toFixed(1)
      : undefined,
  })));
});

export const claimListing = asyncHandler(async (req, res) => {
  if (process.env.REQUIRE_NGO_VERIFICATION === 'true' && !req.user.isVerified)
    throw new AppError('Your organisation is awaiting admin verification', 403);

  // Atomic: only one NGO can win the claim, even under concurrent requests
  const l = await FoodListing.findOneAndUpdate(
    { _id: req.params.id, status: 'available', expiresAt: { $gt: new Date() } },
    {
      $set: { status: 'claimed', claimedBy: req.user._id, claimedAt: new Date() },
      $push: { history: { status: 'claimed', by: req.user._id, note: 'Claimed for pickup' } },
    },
    { new: true },
  ).populate(PARTIES);
  if (!l) throw new AppError('Sorry, this donation is no longer available', 409);

  const io = req.app.get('io');
  const who = req.user.organization || req.user.name;
  await notify(io, l.donor._id, { type: 'claimed', message: `${who} claimed "${l.title}"`, listing: l._id });
  emitListing(io, l);
  await logActivity(req.user._id, 'LISTING_CLAIMED', l._id, { title: l.title });
  res.json(l);
});

async function ownedClaim(req, expected) {
  const l = await FoodListing.findById(req.params.id);
  if (!l) throw new AppError('Listing not found', 404);
  if (id(l.claimedBy) !== id(req.user._id)) throw new AppError('This is not your pickup', 403);
  if (l.status !== expected) throw new AppError(`Listing is "${l.status}", expected "${expected}"`, 409);
  return l;
}

async function transition(req, res, l, status, note, message, action) {
  l.status = status;
  l.history.push({ status, by: req.user._id, note });
  await l.save();
  await l.populate(PARTIES);
  const io = req.app.get('io');
  await notify(io, l.donor._id, { type: status, message, listing: l._id });
  emitListing(io, l);
  await logActivity(req.user._id, action, l._id, { title: l.title });
  res.json(l);
}

export const markPickedUp = asyncHandler(async (req, res) => {
  const l = await ownedClaim(req, 'claimed');
  if (l.expiresAt <= new Date()) throw new AppError('Use-by time has passed; food is unsafe to collect', 409);
  l.pickedUpAt = new Date();
  await transition(req, res, l, 'picked_up', 'Food collected', `"${l.title}" has been picked up`, 'PICKED_UP');
});

export const markDelivered = asyncHandler(async (req, res) => {
  const l = await ownedClaim(req, 'picked_up');
  l.deliveredAt = new Date();
  l.peopleServed = req.body.peopleServed ?? 0;
  l.deliveryNote = req.body.note;
  await transition(
    req, res, l, 'delivered', req.body.note || 'Delivered to beneficiaries',
    `"${l.title}" was delivered${l.peopleServed ? ` to ${l.peopleServed} people` : ''}. Thank you!`, 'DELIVERED',
  );
});

export const releaseListing = asyncHandler(async (req, res) => {
  const l = await ownedClaim(req, 'claimed');
  l.status = 'available';
  l.claimedBy = undefined;
  l.claimedAt = undefined;
  l.history.push({ status: 'available', by: req.user._id, note: 'Claim released by NGO' });
  await l.save();
  await l.populate(PARTIES);
  const io = req.app.get('io');
  await notify(io, l.donor._id, { type: 'released', message: `A claim on "${l.title}" was released; it is available again`, listing: l._id });
  io.to('role:ngo').emit('listing:new', publicView(l));
  emitListing(io, l);
  res.json(l);
});

/* ------------------------------ SHARED ----------------------------- */
export const myListings = asyncHandler(async (req, res) => {
  const filter = req.user.role === 'donor' ? { donor: req.user._id } : { claimedBy: req.user._id };
  const status = str(req.query.status);
  if (status) filter.status = { $in: status.split(',') };
  const listings = await FoodListing.find(filter).sort('-updatedAt').limit(200).populate(PARTIES);
  res.json(listings);
});

export const getListing = asyncHandler(async (req, res) => {
  const l = await FoodListing.findById(req.params.id).populate(PARTIES).populate('history.by', 'name role');
  if (!l) throw new AppError('Listing not found', 404);
  const uid = id(req.user._id);
  const isOwner = id(l.donor) === uid;
  const isClaimer = l.claimedBy && id(l.claimedBy) === uid;
  const isAdmin = req.user.role === 'admin';
  if (isOwner || isClaimer || isAdmin) return res.json(l);
  if (req.user.role === 'ngo' && l.status === 'available') return res.json(publicView(l));
  throw new AppError('You do not have access to this listing', 403);
});

export const myStats = asyncHandler(async (req, res) => {
  const match = req.user.role === 'donor' ? { donor: req.user._id } : { claimedBy: req.user._id };
  const [byStatus, impact] = await Promise.all([
    FoodListing.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    FoodListing.aggregate([
      { $match: { ...match, status: 'delivered' } },
      { $group: { _id: null, people: { $sum: '$peopleServed' } } },
    ]),
  ]);
  const counts = Object.fromEntries(byStatus.map((s) => [s._id, s.count]));
  res.json({
    counts,
    total: Object.values(counts).reduce((a, b) => a + b, 0),
    active: (counts.available || 0) + (counts.claimed || 0) + (counts.picked_up || 0),
    delivered: counts.delivered || 0,
    people: impact[0]?.people || 0,
  });
});
