import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Crosshair, HeartHandshake, Loader2, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/axios';
import { AuthShell } from './Login';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    role: params.get('role') === 'ngo' ? 'ngo' : 'donor',
    name: '', email: '', password: '', organization: '', phone: '', address: '', lat: undefined, lng: undefined,
  });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const locate = () =>
    navigator.geolocation?.getCurrentPosition(
      (p) => { setForm((f) => ({ ...f, lat: p.coords.latitude, lng: p.coords.longitude })); toast.success('Location captured'); },
      () => toast.error('Location permission denied'),
    );

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== '' && v !== undefined));
      await register(payload);
      toast.success('Account created. Welcome to ZeroSpoil!');
      nav('/app', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const roles = [
    { v: 'donor', icon: Store, t: 'Food donor', d: 'Restaurant, caterer, hostel, store' },
    { v: 'ngo', icon: HeartHandshake, t: 'NGO / Volunteer', d: 'Collect and distribute food' },
  ];

  return (
    <AuthShell title="Create your account" subtitle="It takes less than a minute.">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {roles.map((r) => (
            <button type="button" key={r.v} onClick={() => setForm({ ...form, role: r.v })}
              className={`rounded-2xl p-4 text-left ring-1 transition ${form.role === r.v ? 'bg-brand-50 ring-2 ring-brand-600' : 'bg-white ring-slate-200 hover:ring-slate-300'}`}>
              <r.icon size={20} className={form.role === r.v ? 'text-brand-600' : 'text-slate-400'} />
              <p className="mt-2 text-sm font-bold text-slate-900">{r.t}</p>
              <p className="text-xs text-slate-500">{r.d}</p>
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Full name</label><input required className="input" value={form.name} onChange={set('name')} /></div>
          <div><label className="label">Phone</label><input className="input" value={form.phone} onChange={set('phone')} placeholder="98765 43210" /></div>
        </div>
        <div><label className="label flex items-center gap-1.5"><Building2 size={14} />{form.role === 'ngo' ? 'Organisation name' : 'Restaurant / business name'}</label><input className="input" value={form.organization} onChange={set('organization')} /></div>
        <div><label className="label">Email</label><input type="email" required className="input" value={form.email} onChange={set('email')} /></div>
        <div><label className="label">Password</label><input type="password" required minLength={6} className="input" value={form.password} onChange={set('password')} placeholder="At least 6 characters" /></div>
        <div>
          <label className="label">Address</label>
          <div className="flex gap-2">
            <input className="input" value={form.address} onChange={set('address')} />
            <button type="button" onClick={locate} className={`btn-secondary shrink-0 ${form.lat ? '!text-brand-700 !ring-brand-300' : ''}`} title="Capture my location"><Crosshair size={16} /></button>
          </div>
          {form.role === 'ngo' && <p className="mt-1 text-xs text-slate-500">Saving your location lets us show the nearest donations first.</p>}
        </div>
        <button disabled={busy} className="btn-primary w-full !py-3">{busy && <Loader2 size={16} className="animate-spin" />}Create account</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">Already registered? <Link to="/login" className="font-semibold text-brand-700">Log in</Link></p>
    </AuthShell>
  );
}
