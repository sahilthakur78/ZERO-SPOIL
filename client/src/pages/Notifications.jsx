import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BellOff, CheckCheck } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import api from '../api/axios';
import { useSocketEvent } from '../context/SocketContext';
import { EmptyState, PageHeader, PageSpinner } from '../components/Ui';

export default function Notifications() {
  const [items, setItems] = useState(null);
  const load = () => api.get('/notifications').then((r) => setItems(r.data.items));
  useEffect(() => { load(); }, []);
  useSocketEvent('notification', (n) => setItems((p) => (p ? [n, ...p] : [n])));

  const readAll = async () => { await api.patch('/notifications/read-all'); setItems((p) => p.map((n) => ({ ...n, read: true }))); };

  if (!items) return <PageSpinner />;
  return (
    <>
      <PageHeader title="Notifications" subtitle="Live updates on your donations and pickups.">
        {items.some((n) => !n.read) && <button onClick={readAll} className="btn-secondary"><CheckCheck size={16} />Mark all read</button>}
      </PageHeader>
      {items.length === 0 ? <EmptyState icon={BellOff} title="Nothing yet" text="You will be notified when something happens." /> : (
        <div className="card divide-y divide-slate-100">
          {items.map((n) => {
            const body = (
              <div className={`flex items-start gap-3 p-4 ${n.read ? '' : 'bg-brand-50/50'}`}>
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-slate-300' : 'bg-brand-600'}`} />
                <div><p className="text-sm text-slate-800">{n.message}</p><p className="text-xs text-slate-400">{formatDistanceToNowStrict(new Date(n.createdAt))} ago</p></div>
              </div>
            );
            return n.listing ? <Link key={n._id} to={`/app/listing/${n.listing}`} className="block hover:bg-slate-50">{body}</Link> : <div key={n._id}>{body}</div>;
          })}
        </div>
      )}
    </>
  );
}
