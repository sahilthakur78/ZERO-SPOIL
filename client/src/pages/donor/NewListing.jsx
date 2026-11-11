import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import api, { errMsg } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LocationPicker from '../../components/LocationPicker';
import { PageHeader, PageSpinner } from '../../components/Ui';
import { FOOD_TYPES, UNITS, toLocalInput } from '../../utils/format';

export default function NewListing() {
  const { id } = useParams();
  const editing = !!id;
  const { user } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(editing);
  const inHours = (h) => toLocalInput(new Date(Date.now() + h * 36e5));
  const [f, setF] = useState({
    title: '', description: '', foodType: 'veg', quantity: '', unit: 'servings',
    pickupAddress: user.address || '', contactPhone: user.phone || '',
    preparedAt: toLocalInput(new Date()), availableFrom: toLocalInput(new Date()), expiresAt: inHours(4),
  });
  const [pos, setPos] = useState(user.lat ? { lat: user.lat, lng: user.lng } : null);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  useEffect(() => {
    if (!editing) return;
    api.get(`/food/${id}`).then(({ data: l }) => {
      setF({
        title: l.title, description: l.description || '', foodType: l.foodType, quantity: l.quantity, unit: l.unit,
        pickupAddress: l.pickupAddress, contactPhone: l.contactPhone || '',
        preparedAt: l.preparedAt ? toLocalInput(l.preparedAt) : '', availableFrom: toLocalInput(l.availableFrom), expiresAt: toLocalInput(l.expiresAt),
      });
      setPos({ lat: l.location.coordinates[1], lng: l.location.coordinates[0] });
    }).catch((e) => { toast.error(errMsg(e)); nav('/app/donor/listings'); }).finally(() => setLoading(false));
  }, [id]);

  const submit = async (e) => {
    e.preventDefault();
    if (!pos) return toast.error('Please drop a pin on the map for the pickup location');
    const iso = (v) => (v ? new Date(v).toISOString() : undefined);
    const body = {
      ...f, quantity: Number(f.quantity), lat: pos.lat, lng: pos.lng,
      preparedAt: iso(f.preparedAt), availableFrom: iso(f.availableFrom), expiresAt: iso(f.expiresAt),
    };
    setBusy(true);
    try {
      editing ? await api.patch(`/food/${id}`, body) : await api.post('/food', body);
      toast.success(editing ? 'Listing updated' : 'Listing published. NGOs nearby are being notified!');
      nav('/app/donor/listings');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <PageSpinner />;
  return (
    <>
      <PageHeader title={editing ? 'Edit donation' : 'Donate surplus food'} subtitle="Accurate details help NGOs collect safely and on time." />
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <section className="card space-y-4 p-6">
            <h2 className="font-bold">What are you donating?</h2>
            <div><label className="label">Title</label><input required minLength={3} className="input" value={f.title} onChange={set('title')} placeholder="e.g. Veg Biryani and Raita" /></div>
            <div>
              <label className="label">Food type</label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                {FOOD_TYPES.map((t) => (
                  <button type="button" key={t.value} onClick={() => setF({ ...f, foodType: t.value })}
                    className={`rounded-xl p-2.5 text-center text-xs font-medium ring-1 transition ${f.foodType === t.value ? 'bg-brand-50 text-brand-800 ring-2 ring-brand-600' : 'ring-slate-200 hover:bg-slate-50'}`}>
                    <span className="block text-xl">{t.emoji}</span>{t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="label">Quantity</label><input required type="number" min="1" className="input" value={f.quantity} onChange={set('quantity')} /></div>
              <div><label className="label">Unit</label><select className="input" value={f.unit} onChange={set('unit')}>{UNITS.map((u) => <option key={u}>{u}</option>)}</select></div>
            </div>
            <div><label className="label">Description (optional)</label><textarea rows="3" maxLength={500} className="input" value={f.description} onChange={set('description')} placeholder="Ingredients, allergens, packaging…" /></div>
          </section>

          <section className="card space-y-4 p-6">
            <h2 className="font-bold">Timing &amp; food safety</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div><label className="label">Prepared at</label><input type="datetime-local" className="input" value={f.preparedAt} onChange={set('preparedAt')} /></div>
              <div><label className="label">Available from</label><input type="datetime-local" className="input" value={f.availableFrom} onChange={set('availableFrom')} /></div>
              <div><label className="label">Use by</label><input required type="datetime-local" className="input" value={f.expiresAt} onChange={set('expiresAt')} /></div>
            </div>
          </section>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <section className="card space-y-4 p-6">
            <h2 className="font-bold">Pickup location</h2>
            <LocationPicker value={pos} onChange={setPos} onAddress={(a) => setF((p) => ({ ...p, pickupAddress: a }))} />
            <div><label className="label">Address</label><textarea required rows="2" className="input" value={f.pickupAddress} onChange={set('pickupAddress')} /></div>
            <div><label className="label">Contact phone</label><input className="input" value={f.contactPhone} onChange={set('contactPhone')} />
              <p className="mt-1 text-xs text-slate-500">Shared only with the NGO that claims this donation.</p></div>
          </section>
          <button disabled={busy} className="btn-primary w-full !py-3.5 text-base">{busy && <Loader2 size={16} className="animate-spin" />}{editing ? 'Save changes' : 'Publish donation'}</button>
        </div>
      </form>
    </>
  );
}
