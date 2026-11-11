import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNowStrict } from 'date-fns';
import api from '../api/axios';
import { useSocketEvent } from '../context/SocketContext';

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const nav = useNavigate();

  const load = useCallback(() => api.get('/notifications').then((r) => { setItems(r.data.items); setUnread(r.data.unread); }).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useSocketEvent('notification', (n) => {
    setItems((p) => [n, ...p].slice(0, 50));
    setUnread((u) => u + 1);
    toast(n.message, { icon: '🔔' });
  });

  const click = async (n) => {
    if (!n.read) { api.patch(`/notifications/${n._id}/read`); setUnread((u) => Math.max(0, u - 1)); setItems((p) => p.map((i) => (i._id === n._id ? { ...i, read: true } : i))); }
    setOpen(false);
    if (n.listing) nav(`/app/listing/${n.listing}`);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative rounded-xl p-2.5 text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50" aria-label="Notifications">
        <Bell size={18} />
        {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{unread > 9 ? '9+' : unread}</span>}
      </button>
      {open && (
        <div className="card absolute right-0 z-40 mt-2 w-80 animate-fadeUp overflow-hidden shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="font-bold text-slate-900">Notifications</p>
            <Link to="/app/notifications" onClick={() => setOpen(false)} className="text-xs font-semibold text-brand-700">View all</Link>
          </div>
          <ul className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-slate-400">You're all caught up 🎉</li>}
            {items.slice(0, 8).map((n) => (
              <li key={n._id}>
                <button onClick={() => click(n)} className={`w-full px-4 py-3 text-left text-sm hover:bg-slate-50 ${n.read ? '' : 'bg-brand-50/50'}`}>
                  <p className="text-slate-800">{n.message}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{formatDistanceToNowStrict(new Date(n.createdAt))} ago</p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
