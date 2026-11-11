import { Link } from 'react-router-dom';
import { BadgeCheck, Clock, MapPin, Navigation, Scale } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { expiryInfo, foodMeta } from '../utils/format';

export default function ListingCard({ listing: l, children, showStatus = true }) {
  const ft = foodMeta(l.foodType);
  const exp = expiryInfo(l.expiresAt);
  const active = ['available', 'claimed', 'picked_up'].includes(l.status);
  return (
    <div className="card group flex animate-fadeUp flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start gap-3 p-5 pb-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-brand-50 text-2xl">{ft.emoji}</div>
        <div className="min-w-0 flex-1">
          <Link to={`/app/listing/${l._id}`} className="block truncate font-display text-lg font-bold text-slate-900 hover:text-brand-700">{l.title}</Link>
          <p className="flex items-center gap-1 truncate text-sm text-slate-500">
            {l.donor?.organization || l.donor?.name}
            {l.donor?.isVerified && <BadgeCheck size={14} className="shrink-0 text-brand-600" />}
          </p>
        </div>
        {showStatus && <StatusBadge status={l.status} />}
      </div>
      <dl className="space-y-2 px-5 pb-4 text-sm">
        <div className="flex items-center gap-2"><Scale size={15} className="text-slate-400" /><span className="font-semibold text-slate-800">{l.quantity} {l.unit}</span><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{ft.label}</span></div>
        <div className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" /><span className="line-clamp-2">{l.pickupAddress}</span></div>
        <div className="flex items-center justify-between">
          {active && <span className={`flex items-center gap-2 font-medium ${exp.tone}`}><Clock size={15} />{exp.text}</span>}
          {l.distanceKm !== undefined && <span className="flex items-center gap-1 text-xs font-semibold text-brand-700"><Navigation size={13} />{l.distanceKm} km</span>}
        </div>
      </dl>
      <div className="mt-auto flex gap-2 border-t border-slate-100 bg-slate-50/60 p-3 empty:hidden">{children}</div>
    </div>
  );
}
