import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { Bell, LayoutDashboard, LogOut, Menu, Package, PlusCircle, Search, ShieldCheck, Truck, UserCircle, X, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { Logo } from './Ui';

const NAV = {
  donor: [
    { to: '/app/donor', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/donor/new', label: 'Donate food', icon: PlusCircle },
    { to: '/app/donor/listings', label: 'My donations', icon: Package },
  ],
  ngo: [
    { to: '/app/ngo', label: 'Find food', icon: Search, end: true },
    { to: '/app/ngo/pickups', label: 'My pickups', icon: Truck },
  ],
  admin: [{ to: '/app/admin', label: 'Control center', icon: ShieldCheck }],
};
const COMMON = [
  { to: '/app/notifications', label: 'Notifications', icon: Bell },
  { to: '/app/profile', label: 'Profile', icon: UserCircle },
];
const ROLE_LABEL = { donor: 'Food donor', ngo: 'NGO / Volunteer', admin: 'Administrator' };

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const links = [...NAV[user.role], ...COMMON];

  const item = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${isActive ? 'bg-brand-600 text-white shadow-soft' : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'}`;

  const Sidebar = (
    <div className="flex h-full flex-col p-4">
      <Link to="/" className="mb-8 px-2 pt-2"><Logo /></Link>
      <nav className="flex-1 space-y-1">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={item} onClick={() => setOpen(false)}>
            <l.icon size={18} />{l.label}
          </NavLink>
        ))}
      </nav>
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
        <p className="text-sm font-bold">{user.organization || user.name}</p>
        <p className="text-xs text-brand-100">{ROLE_LABEL[user.role]}</p>
        <button onClick={() => { logout(); nav('/'); }} className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-white/90 hover:text-white"><LogOut size={14} />Sign out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">{Sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 animate-fadeUp bg-white shadow-xl">
            <button className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500" onClick={() => setOpen(false)}><X size={18} /></button>
            {Sidebar}
          </aside>
        </div>
      )}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur sm:px-8">
        <button className="rounded-xl p-2.5 ring-1 ring-slate-200 lg:hidden" onClick={() => setOpen(true)}><Menu size={18} /></button>
        <p className="hidden text-sm text-slate-500 lg:block">Welcome back, <span className="font-semibold text-slate-800">{user.name.split(' ')[0]}</span> 👋</p>
        <NotificationBell />
      </header>
      <main className="mx-auto max-w-7xl p-4 sm:p-8">
        {user.role === 'ngo' && !user.isVerified && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-200">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <p>Your organisation is awaiting admin verification. You can browse donations now; claiming may require verification.</p>
          </div>
        )}
        <Outlet />
      </main>
    </div>
  );
}
