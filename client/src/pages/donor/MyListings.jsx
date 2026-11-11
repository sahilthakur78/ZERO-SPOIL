import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';
import api from '../../api/axios';
import { useSocketEvent } from '../../context/SocketContext';
import ListingCard from '../../components/ListingCard';
import ListingActions from '../../components/ListingActions';
import { CardSkeletons, EmptyState, PageHeader } from '../../components/Ui';

const TABS = [
  ['', 'All'], ['available', 'Available'], ['claimed,picked_up', 'In progress'], ['delivered', 'Delivered'], ['expired,cancelled', 'Closed'],
];

export default function MyListings() {
  const [tab, setTab] = useState('');
  const [items, setItems] = useState(null);
  const load = useCallback(() => api.get('/food/mine', { params: { status: tab || undefined } }).then((r) => setItems(r.data)), [tab]);
  useEffect(() => { setItems(null); load(); }, [load]);
  useSocketEvent('listing:update', load);

  return (
    <>
      <PageHeader title="My donations" subtitle="Track every listing from publish to delivery.">
        <Link to="/app/donor/new" className="btn-primary">New donation</Link>
      </PageHeader>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map(([v, l]) => (
          <button key={l} onClick={() => setTab(v)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${tab === v ? 'bg-brand-600 text-white shadow-soft' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{l}</button>
        ))}
      </div>
      {!items ? <CardSkeletons /> : items.length === 0 ? (
        <EmptyState icon={PackageOpen} title="Nothing here yet" text="Donations in this category will show up here." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((l) => <ListingCard key={l._id} listing={l}><ListingActions listing={l} onChanged={load} /></ListingCard>)}
        </div>
      )}
    </>
  );
}
