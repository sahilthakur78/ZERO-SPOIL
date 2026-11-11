// Strip private data before sending a listing to people who are not part of the pickup
export function publicView(listing) {
  const o = listing.toObject ? listing.toObject() : { ...listing };
  delete o.contactPhone;
  delete o.history;
  delete o.claimedBy;
  if (o.donor && typeof o.donor === 'object') delete o.donor.phone;
  return o;
}

export function emitListing(io, l) {
  const rooms = [l.donor?._id ?? l.donor, l.claimedBy?._id ?? l.claimedBy]
    .filter(Boolean)
    .map((id) => `user:${id}`);
  io.to([...rooms, 'role:admin']).emit('listing:update', l);
  io.to('role:ngo').emit('listing:changed', { _id: l._id, status: l.status });
}
