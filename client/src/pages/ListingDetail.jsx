import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BadgeCheck, Clock, MapPin, Phone, Lock } from 'lucide-react';
import api, { errMsg } from '../api/axios';
import { useSocketEvent } from '../context/SocketContext';
import MapView from '../components/MapView';
import StatusBadge from '../components/StatusBadge';
import StatusStepper from '../components/StatusStepper';
import ListingActions from '../components/ListingActions';
import { EmptyState, PageSpinner } from '../components/Ui';
import { expiryInfo, fmtDate, foodMeta } from '../utils/format';
import { ShieldAlert } from 'lucide-react';

export default function ListingDetail() {
  const { id } = useParams();
  const [l, setL] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() =>
    api.get(`/food/${id}`).then((r) => setL(r.data)).catch((e) => setError(errMsg(e))), [id]);
  useEffect(() => { load(); }, [load]);
  useSocketEvent('listing:update', (u) => u._id === id && load());

  if (error) return <EmptyState icon={ShieldAlert} title="Unavailable" text={error} action={<Link to="/app" className="btn-primary">Back to dashboard</Link>} />;
  if (!l) return <PageSpinner />;

  const ft = foodMeta(l.foodType);
  const exp = expiryInfo(l.expiresAt);
  const phone = l.contactPhone || l.donor?.phone;
  const row = (label, value) => value ? <div className="flex justify-between gap-4 py-2.5 text-sm"><dt className="text-slate-500">{label}</dt><dd className="text-right font-medium text-slate-900">{value}</dd></div> : null;

  return (
    <>
      <Link to="/app" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-brand-700"><ArrowLeft size={16} />Back</Link>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-6">
            <div className="flex items-start gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-brand-50 text-4xl">{ft.emoji}</span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-extrabold">{l.title}</h1><StatusBadge status={l.status} /></div>
                <p className="mt-1 flex items-center gap-1 text-slate-500">{l.donor?.organization || l.donor?.name}{l.donor?.isVerified && <BadgeCheck size={16} className="text-brand-600" />}</p>
              </div>
            </div>
            {l.description && <p className="mt-4 text-slate-600">{l.description}</p>}
            <div className="mt-6"><StatusStepper status={l.status} /></div>
          </section>

          <section className="card overflow-hidden p-2"><MapView listings={[l]} height="320px" link={false} /></section>

          {l.history?.length > 0 && (
            <section className="card p-6">
              <h2 className="mb-4 font-bold">Activity timeline</h2>
              <ol className="relative space-y-5 border-l-2 border-brand-100 pl-6">
                {[...l.history].reverse().map((h, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-brand-500 ring-4 ring-white" />
                    <p className="text-sm font-semibold capitalize text-slate-900">{h.status.replace('_', ' ')}</p>
                    <p className="text-sm text-slate-500">{h.note}{h.by?.name && ` · ${h.by.name}`}</p>
                    <p className="text-xs text-slate-400">{fmtDate(h.at)}</p>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="card p-6">
            <h2 className="mb-2 font-bold">Details</h2>
            <dl className="divide-y divide-slate-100">
              {row('Quantity', `${l.quantity} ${l.unit}`)}
              {row('Food type', ft.label)}
              {row('Prepared', l.preparedAt && fmtDate(l.preparedAt))}
              {row('Use by', fmtDate(l.expiresAt))}
              {['available', 'claimed', 'picked_up'].includes(l.status) && row('Time left', <span className={exp.tone}>{exp.text}</span>)}
              {row('People served', l.status === 'delivered' && l.peopleServed)}
              {row('Delivery note', l.deliveryNote)}
            </dl>
            <p className="mt-3 flex items-start gap-2 text-sm text-slate-600"><MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />{l.pickupAddress}</p>
            <a className="mt-3 inline-block text-sm font-semibold text-brand-700" target="_blank" rel="noreferrer"
              href={`https://www.google.com/maps/dir/?api=1&destination=${l.location.coordinates[1]},${l.location.coordinates[0]}`}>Get directions →</a>
          </section>

          <section className="card p-6">
            <h2 className="mb-2 font-bold">Contact</h2>
            {phone ? (
              <a href={`tel:${phone}`} className="flex items-center gap-2 font-semibold text-brand-700"><Phone size={16} />{phone}</a>
            ) : (
              <p className="flex items-start gap-2 text-sm text-slate-500"><Lock size={16} className="mt-0.5 shrink-0" />Contact details unlock after you claim this donation.</p>
            )}
            {l.claimedBy && <p className="mt-3 text-sm text-slate-500">Claimed by <span className="font-semibold text-slate-800">{l.claimedBy.organization || l.claimedBy.name}</span></p>}
          </section>

          <div className="flex flex-wrap gap-2"><ListingActions listing={l} onChanged={load} /></div>
        </aside>
      </div>
    </>
  );
}
