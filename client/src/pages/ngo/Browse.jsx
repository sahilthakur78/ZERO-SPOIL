import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { List, LocateFixed, Map as MapIcon, Radar, Search } from 'lucide-react';
import api, { errMsg } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useSocketEvent } from '../../context/SocketContext';
import ListingCard from '../../components/ListingCard';
import ListingActions from '../../components/ListingActions';
import MapView from '../../components/MapView';
import { CardSkeletons, EmptyState, PageHeader } from '../../components/Ui';
import { FOOD_TYPES } from '../../utils/format';

export default function Browse() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [filters, setFilters] = useState({ q: '', foodType: '', radius: 15 });
  const [pos, setPos] = useState(user.lat ? { lat: user.lat, lng: user.lng } : null);
  const [items, setItems] = useState(null);
  const [view, setView] = useState('list');

  const load = useCallback(async () => {
    try {
const params = { radius: filters.radius };
      if (filters.q) params.q = filters.q;
      if (filters.foodType) params.foodType = filters.foodType;
      if (pos) { params.lat = pos.lat; params.lng = pos.lng; }
      const { data } = await api.get('/food', { params });
      setItems(data);
    } catch (e) {
      toast.error(errMsg(e));
      setItems([]);
    }
  }, [filters, pos]);

  // debounce search/filter changes
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  // live feed: new donations and claims by other NGOs
  useSocketEvent('listing:new', (l) => { toast(`New donation: ${l.title}`, { icon: '🍲' }); load(); });
  useSocketEvent('listing:changed', load);

  const locate = () =>
    navigator.geolocation
      ? navigator.geolocation.getCurrentPosition(
          (p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); toast.success('Showing food near you'); },
          () => toast.error('Location permission denied'),
        )
      : toast.error('Geolocation is not supported');

  return (
    <>
      <PageHeader title="Find food nearby" subtitle="Live donations, closest and most urgent first.">
        <div className="flex rounded-xl bg-white p-1 ring-1 ring-slate-200">
          {[['list', List, 'List'], ['map', MapIcon, 'Map']].map(([v, I, l]) => (
            <button key={v} onClick={() => setView(v)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${view === v ? 'bg-brand-600 text-white' : 'text-slate-600'}`}>
              <I size={15} />{l}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="card mb-6 grid gap-3 p-4 md:grid-cols-[1fr_180px_200px_auto]">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input className="input !pl-10" placeholder="Search dish or area…" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} />
        </div>
        <select className="input" value={filters.foodType} onChange={(e) => setFilters({ ...filters, foodType: e.target.value })}>
          <option value="">All food types</option>
          {FOOD_TYPES.map((t) => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <Radar size={16} className="text-slate-400" />
          <input type="range" min="1" max="50" value={filters.radius} onChange={(e) => setFilters({ ...filters, radius: Number(e.target.value) })} className="flex-1 accent-brand-600" disabled={!pos} />
          <span className="w-12 text-sm font-semibold">{filters.radius} km</span>
        </div>
        <button onClick={locate} className="btn-secondary"><LocateFixed size={16} />{pos ? 'Update' : 'Near me'}</button>
      </div>
      {!pos && <p className="-mt-3 mb-5 text-xs text-slate-500">Share your location to sort by distance and filter by radius. Until then, donations are sorted by urgency.</p>}

      {!items ? <CardSkeletons /> : items.length === 0 ? (
        <EmptyState icon={Search} title="No donations match right now" text="New listings appear here instantly. Try a wider radius or clear the filters." />
      ) : view === 'map' ? (
        <MapView listings={items} user={pos} height="560px" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((l) => (
            <ListingCard key={l._id} listing={l} showStatus={false}>
              <ListingActions listing={l} onChanged={(d, action) => (action === 'claim' ? nav(`/app/listing/${d._id}`) : load())} />
            </ListingCard>
          ))}
        </div>
      )}
    </>
  );
}
