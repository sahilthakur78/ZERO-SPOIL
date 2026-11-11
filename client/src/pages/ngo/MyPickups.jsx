import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Truck, Users } from 'lucide-react';
import api from '../../api/axios';
import { useSocketEvent } from '../../context/SocketContext';
import ListingCard from '../../components/ListingCard';
import ListingActions from '../../components/ListingActions';
import StatCard from '../../components/StatCard';
import { CardSkeletons, EmptyState, PageHeader } from '../../components/Ui';

export default function MyPickups() {
  const [tab, setTab] = useState('claimed,picked_up');
  const [items, setItems] = useState(null);
  const [stats, setStats] = useState(null);

  const load = useCallback(async () => {
    const [l, s] = await Promise.all([api.get('/food/mine', { params: { status: tab } }), api.get('/food/stats')]);
    setItems(l.data);
    setStats(s.data);
  }, [tab]);
  useEffect(() => { setItems(null); load(); }, [load]);
  useSocketEvent('listing:update', load);

  return (
    <>
      <PageHeader title="My pickups" subtitle="Claimed donations you are collecting and delivering." />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Truck} label="In progress" value={(stats?.counts?.claimed || 0) + (stats?.counts?.picked_up || 0)} tone="amber" />
        <StatCard icon={CheckCircle2} label="Delivered" value={stats?.delivered} />
        <StatCard icon={Users} label="People served" value={stats?.people} tone="violet" />
      </div>
      <div className="mb-6 flex gap-2">
        {[['claimed,picked_up', 'In progress'], ['delivered', 'Delivered'], ['expired,cancelled', 'Closed']].map(([v, l]) => (
          <button key={v} onClick={() => setTab(v)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === v ? 'bg-brand-600 text-white shadow-soft' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>{l}</button>
        ))}
      </div>
      {!items ? <CardSkeletons /> : items.length === 0 ? (
        <EmptyState icon={Truck} title="No pickups here" text="Claim a donation to start a pickup."
          action={<Link to="/app/ngo" className="btn-primary">Find food</Link>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((l) => <ListingCard key={l._id} listing={l}><ListingActions listing={l} onChanged={load} /></ListingCard>)}
        </div>
      )}
    </>
  );
}
