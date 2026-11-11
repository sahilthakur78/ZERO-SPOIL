import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, HandHeart, MapPinned, ShieldCheck, Store, Utensils, Users } from 'lucide-react';
import api from '../api/axios';
import { Logo } from '../components/Ui';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get('/public/stats').then((r) => setStats(r.data)).catch(() => {}); }, []);

  const steps = [
    { icon: Store, title: 'List surplus food', text: 'Restaurants add quantity, use-by time and pin the pickup point in under a minute.' },
    { icon: MapPinned, title: 'Nearby NGOs are alerted', text: 'Verified NGOs and volunteers see the closest, most urgent donations on a live map.' },
    { icon: HandHeart, title: 'Claim, collect, deliver', text: 'One tap to claim. Track every step from pickup to the people who get the meal.' },
  ];

  return (
    <div className="bg-white">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5">
        <Logo />
        <div className="flex items-center gap-2">
          {user ? <Link to="/app" className="btn-primary">Open dashboard</Link> : (<>
            <Link to="/login" className="btn-ghost">Log in</Link>
            <Link to="/register" className="btn-primary">Get started</Link>
          </>)}
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-brand-50 via-white to-white" />
        <div className="absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-brand-200/50 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-10 lg:grid-cols-2 lg:pt-16">
          <div className="animate-fadeUp">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-800">🌍 Food rescue &amp; redistribution platform</span>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] sm:text-6xl">
              Don't let good food <span className="bg-gradient-to-r from-brand-600 to-emerald-400 bg-clip-text text-transparent">go to waste.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              ZeroSpoil connects restaurants and food donors with nearby NGOs and volunteers, so surplus meals reach people who need them while they are still fresh.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register?role=donor" className="btn-primary !px-6 !py-3 text-base">I have food to donate <ArrowRight size={18} /></Link>
              <Link to="/register?role=ngo" className="btn-secondary !px-6 !py-3 text-base">I represent an NGO</Link>
            </div>
          </div>
          <div className="relative animate-fadeUp">
            <div className="card relative space-y-3 p-5 shadow-soft">
              {[['🥗', 'Veg Biryani · 40 servings', '2h 10m left', 'Available', 'bg-emerald-50 text-emerald-700'],
                ['🥖', 'Fresh Bread · 25 packets', '45m left', 'Claimed', 'bg-amber-50 text-amber-700'],
                ['🍛', 'Dal & Rice · 60 servings', 'Delivered to 60 people', 'Delivered', 'bg-brand-600 text-white']].map(([e, t, s, b, c]) => (
                <div key={t} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-2xl shadow-sm">{e}</span>
                  <div className="flex-1"><p className="text-sm font-bold text-slate-900">{t}</p><p className="text-xs text-slate-500">{s}</p></div>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c}`}>{b}</span>
                </div>
              ))}
            </div>
            <div className="absolute -bottom-5 -left-5 hidden rounded-2xl bg-white p-3 shadow-soft ring-1 ring-slate-100 sm:flex sm:items-center sm:gap-2"><Bell className="text-brand-600" size={18} /><span className="text-xs font-semibold">Live pickup updates</span></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5">
        <div className="grid gap-4 rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 p-8 text-white sm:grid-cols-4">
          {[[stats?.deliveries, 'Donations delivered'], [stats?.people, 'People served'], [stats?.donors, 'Food donors'], [stats?.ngos, 'NGOs & volunteers']].map(([v, l]) => (
            <div key={l} className="text-center"><p className="font-display text-4xl font-extrabold">{v ?? '–'}</p><p className="mt-1 text-sm text-brand-100">{l}</p></div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold sm:text-4xl">From surplus to supper in three steps</h2>
          <p className="mt-3 text-slate-600">Replace phone calls and WhatsApp forwards with one structured, trackable workflow.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="card p-7 transition hover:-translate-y-1 hover:shadow-soft">
              <div className="mb-5 flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><s.icon size={24} /></span>
                <span className="font-display text-5xl font-extrabold text-slate-100">0{i + 1}</span>
              </div>
              <h3 className="text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-slate-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 md:grid-cols-3">
          {[[Utensils, 'Donors & restaurants', 'Manage listings, edit or cancel, and see how many people your food fed.'],
            [Users, 'NGOs & volunteers', 'Search by distance, food type and urgency. Claim atomically, so there are no double pickups.'],
            [ShieldCheck, 'Administrators', 'Verify organisations, suspend misuse, and monitor every donation and activity.']].map(([I, t, d]) => (
            <div key={t} className="rounded-2xl border border-slate-200 bg-white p-6"><I className="mb-3 text-brand-600" /><h3 className="font-bold">{t}</h3><p className="mt-1 text-sm text-slate-600">{d}</p></div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        <Logo /><p className="mt-2">© {new Date().getFullYear()} ZeroSpoil · BCA Major Project, CGC University, Mohali</p>
      </footer>
    </div>
  );
}
