import { useState } from 'react';
import toast from 'react-hot-toast';
import { BadgeCheck, Crosshair, Loader2 } from 'lucide-react';
import api, { errMsg } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/Ui';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [f, setF] = useState({
    name: user.name, organization: user.organization || '', phone: user.phone || '',
    address: user.address || '', lat: user.lat, lng: user.lng,
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const locate = () =>
    navigator.geolocation?.getCurrentPosition(
      (p) => { setF((x) => ({ ...x, lat: p.coords.latitude, lng: p.coords.longitude })); toast.success('Location captured'); },
      () => toast.error('Location permission denied'),
    );

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const body = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== '' && v !== undefined));
      const { data } = await api.patch('/auth/me', body);
      setUser(data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Profile" subtitle={user.email} />
      <form onSubmit={submit} className="card max-w-2xl space-y-4 p-6">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm">
          <BadgeCheck className={user.isVerified ? 'text-brand-600' : 'text-slate-300'} size={18} />
          {user.isVerified ? 'Verified account' : 'Awaiting verification by an administrator'}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label">Full name</label><input required className="input" value={f.name} onChange={set('name')} /></div>
          <div><label className="label">Phone</label><input className="input" value={f.phone} onChange={set('phone')} /></div>
        </div>
        <div><label className="label">Organisation</label><input className="input" value={f.organization} onChange={set('organization')} /></div>
        <div>
          <label className="label">Address</label>
          <div className="flex gap-2">
            <input className="input" value={f.address} onChange={set('address')} />
            <button type="button" onClick={locate} className="btn-secondary shrink-0"><Crosshair size={16} /></button>
          </div>
          {f.lat && <p className="mt-1 text-xs text-brand-700">Location saved ({Number(f.lat).toFixed(3)}, {Number(f.lng).toFixed(3)})</p>}
        </div>
        <button disabled={busy} className="btn-primary">{busy && <Loader2 size={16} className="animate-spin" />}Save changes</button>
      </form>
    </>
  );
}
