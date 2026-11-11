import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, HeartPulse, Package, PlusCircle, Timer, Users } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocketEvent } from '../../context/SocketContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { CardSkeletons, EmptyState, PageHeader } from '../../components/Ui';
import { expiryInfo, foodMeta } from '../../utils/format';

export default function DonorDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState(null);

  const load = useCallback(async () => {
    const [s, l] = await Promise.all([api.get('/food/stats'), api.get('/food/mine')]);
    setStats(s.data);
    setRecent(l.data.slice(0, 6));
  }, []);
  useEffect(() => { load(); }, [load]);
  useSocketEvent('listing:update', load);

  return (
    <>
      <PageHeader title="Your impact" subtitle={`${user.organization || user.name} · every listing counts`}>
        <Link to="/app/donor/new" className="btn-primary"><PlusCircle size={16} />Donate food</Link>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label="Total donations" value={stats?.total} />
        <StatCard icon={Timer} label="Active now" value={stats?.active} tone="amber" />
        <StatCard icon={CheckCircle2} label="Delivered" value={stats?.delivered} tone="sky" />
        <StatCard icon={Users} label="People fed" value={stats?.people} tone="violet" />
      </div>

      <h2 className="mb-3 mt-10 text-lg font-bold">Recent activity</h2>
      {!recent ? <CardSkeletons n={3} /> : recent.length === 0 ? (
        <EmptyState icon={HeartPulse} title="No donations yet" text="List your first surplus meal and nearby NGOs will be notified instantly."
          action={<Link to="/app/donor/new" className="btn-primary">Create first listing</Link>} />
      ) : (
        <div className="card divide-y divide-slate-100">
          {recent.map((l) => (
            <Link key={l._id} to={`/app/listing/${l._id}`} className="flex items-center gap-4 p-4 transition hover:bg-slate-50">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-xl">{foodMeta(l.foodType).emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-slate-900">{l.title}</p>
                <p className="text-sm text-slate-500">
                  {l.quantity} {l.unit}
                  {l.claimedBy && ` · ${l.claimedBy.organization || l.claimedBy.name}`}
                  {['available', 'claimed'].includes(l.status) && <span className={`ml-2 ${expiryInfo(l.expiresAt).tone}`}>{expiryInfo(l.expiresAt).text}</span>}
                </p>
              </div>
              <StatusBadge status={l.status} />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
