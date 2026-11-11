import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Activity, BadgeCheck, Ban, HandHeart, Package, ShieldAlert, Trash2, Users } from 'lucide-react';
import { format } from 'date-fns';
import api, { errMsg } from '../../api/axios';
import { useSocketEvent } from '../../context/SocketContext';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { PageHeader, PageSpinner } from '../../components/Ui';
import { fmtDate } from '../../utils/format';

const TABS = ['Overview', 'Users', 'Listings', 'Activity'];

function Overview({ stats }) {
  const max = Math.max(1, ...stats.trend.map((t) => t.created));
  const L = stats.listings;
  const total = Object.values(L).reduce((a, b) => a + b, 0);
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Donors" value={stats.users.donor || 0} />
        <StatCard icon={HandHeart} label="NGOs" value={stats.users.ngo || 0} tone="sky" hint={`${stats.pendingNgos} awaiting verification`} />
        <StatCard icon={Package} label="Total listings" value={total} tone="amber" />
        <StatCard icon={Activity} label="People served" value={stats.people} tone="violet" hint={`${stats.deliveries} deliveries`} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="mb-5 font-bold">Last 7 days</h2>
          {stats.trend.length === 0 ? <p className="text-sm text-slate-400">No activity yet.</p> : (
            <div className="flex h-44 items-end gap-3">
              {stats.trend.map((t) => (
                <div key={t._id} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex w-full flex-1 items-end"><div className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400" style={{ height: `${(t.created / max) * 100}%`, minHeight: 6 }} title={`${t.created} created, ${t.delivered} delivered`} /></div>
                  <span className="text-[11px] text-slate-500">{format(new Date(t._id), 'dd MMM')}</span>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="card p-6">
          <h2 className="mb-5 font-bold">Listings by status</h2>
          <div className="space-y-3">
            {['available', 'claimed', 'picked_up', 'delivered', 'expired', 'cancelled'].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div className="w-24"><StatusBadge status={s} /></div>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-500" style={{ width: `${total ? ((L[s] || 0) / total) * 100 : 0}%` }} /></div>
                <span className="w-8 text-right text-sm font-semibold">{L[s] || 0}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

function UsersTab() {
  const [users, setUsers] = useState(null);
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const load = useCallback(() => api.get('/admin/users', { params: { q: q || undefined, role: role || undefined } }).then((r) => setUsers(r.data)), [q, role]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  const patch = async (u, body, msg) => {
    try { await api.patch(`/admin/users/${u._id}`, body); toast.success(msg); load(); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap gap-3 border-b border-slate-100 p-4">
        <input className="input max-w-xs" placeholder="Search name, email, organisation" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input max-w-[160px]" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option><option value="donor">Donors</option><option value="ngo">NGOs</option><option value="admin">Admins</option>
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(users || []).map((u) => (
              <tr key={u._id}>
                <td className="px-4 py-3"><p className="font-semibold text-slate-900">{u.organization || u.name}</p><p className="text-xs text-slate-500">{u.name} · {u.email}</p></td>
                <td className="px-4 py-3 capitalize">{u.role}</td>
                <td className="px-4 py-3">
                  {u.isBlocked ? <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">Suspended</span>
                    : u.isVerified ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Verified</span>
                    : <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Pending</span>}
                </td>
                <td className="px-4 py-3 text-slate-500">{fmtDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  {u.role !== 'admin' && (
                    <div className="flex justify-end gap-2">
                      <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => patch(u, { isVerified: !u.isVerified }, u.isVerified ? 'Verification removed' : 'User verified')}><BadgeCheck size={14} />{u.isVerified ? 'Unverify' : 'Verify'}</button>
                      <button className={`!px-3 !py-1.5 text-xs ${u.isBlocked ? 'btn-primary' : 'btn-secondary text-rose-600'}`} onClick={() => patch(u, { isBlocked: !u.isBlocked }, u.isBlocked ? 'User reinstated' : 'User suspended')}><Ban size={14} />{u.isBlocked ? 'Reinstate' : 'Suspend'}</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users && users.length === 0 && <p className="p-8 text-center text-sm text-slate-400">No users found.</p>}
      </div>
    </section>
  );
}

function ListingsTab() {
  const [items, setItems] = useState(null);
  const [status, setStatus] = useState('');
  const load = useCallback(() => api.get('/admin/listings', { params: { status: status || undefined } }).then((r) => setItems(r.data)), [status]);
  useEffect(() => { load(); }, [load]);
  useSocketEvent('listing:update', load);

  const remove = async (l) => {
    if (!window.confirm(`Permanently remove "${l.title}"?`)) return;
    try { await api.delete(`/admin/listings/${l._id}`); toast.success('Listing removed'); load(); } catch (e) { toast.error(errMsg(e)); }
  };

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-slate-100 p-4">
        <select className="input max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {['available', 'claimed', 'picked_up', 'delivered', 'expired', 'cancelled'].map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="px-4 py-3">Donation</th><th className="px-4 py-3">Donor</th><th className="px-4 py-3">Claimed by</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(items || []).map((l) => (
              <tr key={l._id}>
                <td className="px-4 py-3"><Link to={`/app/listing/${l._id}`} className="font-semibold text-slate-900 hover:text-brand-700">{l.title}</Link><p className="text-xs text-slate-500">{l.quantity} {l.unit}</p></td>
                <td className="px-4 py-3">{l.donor?.organization || l.donor?.name}</td>
                <td className="px-4 py-3">{l.claimedBy ? l.claimedBy.organization || l.claimedBy.name : '–'}</td>
                <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                <td className="px-4 py-3 text-right"><button onClick={() => remove(l)} className="btn-ghost !p-2 text-rose-600" aria-label="Remove"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {items && items.length === 0 && <p className="p-8 text-center text-sm text-slate-400">No listings found.</p>}
      </div>
    </section>
  );
}

function ActivityTab() {
  const [items, setItems] = useState(null);
  useEffect(() => { api.get('/admin/activity').then((r) => setItems(r.data)); }, []);
  if (!items) return <PageSpinner />;
  return (
    <section className="card divide-y divide-slate-100">
      {items.length === 0 && <p className="p-8 text-center text-sm text-slate-400">No activity recorded yet.</p>}
      {items.map((a) => (
        <div key={a._id} className="flex items-center justify-between gap-4 p-4 text-sm">
          <div>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs">{a.action}</span>
            <span className="ml-2 text-slate-700">{a.actor?.name || 'System'} {a.actor?.role && <em className="text-slate-400">({a.actor.role})</em>}</span>
            {(a.listing?.title || a.meta?.title) && <span className="ml-2 text-slate-500">· {a.listing?.title || a.meta.title}</span>}
          </div>
          <span className="shrink-0 text-xs text-slate-400">{fmtDate(a.createdAt)}</span>
        </div>
      ))}
    </section>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/admin/stats').then((r) => setStats(r.data)); }, [tab]);

  return (
    <>
      <PageHeader title="Control center" subtitle="Monitor users, donations and platform activity." />
      {stats?.pendingNgos > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
          <ShieldAlert size={18} />{stats.pendingNgos} NGO account(s) are waiting for verification.
          <button onClick={() => setTab('Users')} className="ml-auto font-semibold underline">Review</button>
        </div>
      )}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t ? 'bg-brand-600 text-white shadow-soft' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>{t}</button>
        ))}
      </div>
      {tab === 'Overview' && (stats ? <Overview stats={stats} /> : <PageSpinner />)}
      {tab === 'Users' && <UsersTab />}
      {tab === 'Listings' && <ListingsTab />}
      {tab === 'Activity' && <ActivityTab />}
    </>
  );
}
