import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../api/axios';
import { Logo } from '../components/Ui';

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-20 top-1/3 h-80 w-80 rounded-full bg-brand-400/20 blur-3xl" />
        <Link to="/"><Logo light /></Link>
        <div className="relative">
          <p className="font-display text-4xl font-extrabold leading-tight">Every meal rescued is a meal shared.</p>
          <p className="mt-4 max-w-md text-brand-100">Join restaurants, NGOs and volunteers turning surplus into smiles, one pickup at a time.</p>
        </div>
        <p className="text-sm text-brand-200">🍃 Reduce waste · Feed communities</p>
      </div>
      <div className="grid place-items-center p-6">
        <div className="w-full max-w-md animate-fadeUp">
          <Link to="/" className="mb-8 block lg:hidden"><Logo /></Link>
          <h1 className="text-3xl font-extrabold">{title}</h1>
          <p className="mb-8 mt-2 text-slate-500">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(form);
      nav(loc.state?.from || '/app', { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const demo = (email, password) => setForm({ email, password });

  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue rescuing food.">
      <form onSubmit={submit} className="space-y-4">
        <div><label className="label">Email</label><input type="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></div>
        <div><label className="label">Password</label><input type="password" required className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" /></div>
        <button disabled={busy} className="btn-primary w-full !py-3">{busy && <Loader2 size={16} className="animate-spin" />}Log in</button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">New to ZeroSpoil? <Link to="/register" className="font-semibold text-brand-700">Create an account</Link></p>
      {import.meta.env.DEV && (
        <div className="mt-8 rounded-2xl bg-slate-100 p-4 text-xs text-slate-600">
          <p className="mb-2 font-semibold">Demo accounts (after seeding)</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => demo('donor@zerospoil.com', 'Donor@123')}>Donor</button>
            <button type="button" className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => demo('ngo@zerospoil.com', 'Ngo@12345')}>NGO</button>
            <button type="button" className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => demo('admin@zerospoil.com', 'Admin@123')}>Admin</button>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
