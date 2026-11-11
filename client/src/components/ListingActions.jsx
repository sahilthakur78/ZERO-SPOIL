import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { HandHeart, PackageCheck, Pencil, Truck, Undo2, XCircle } from 'lucide-react';
import api, { errMsg } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Modal from './Modal';

const idOf = (v) => String(v?._id ?? v);

export default function ListingActions({ listing: l, onChanged }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [people, setPeople] = useState('');
  const [note, setNote] = useState('');

  const isOwner = user.role === 'donor' && idOf(l.donor) === user._id;
  const isClaimer = user.role === 'ngo' && l.claimedBy && idOf(l.claimedBy) === user._id;

  const call = async (path, body, msg) => {
    setBusy(true);
    try {
      const { data } = await api.post(`/food/${l._id}/${path}`, body);
      toast.success(msg);
      setDeliverOpen(false);
      onChanged?.(data, path);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const buttons = [];
  if (user.role === 'ngo' && l.status === 'available')
    buttons.push(<button key="claim" disabled={busy} className="btn-primary flex-1" onClick={() => call('claim', {}, 'Claimed! Donor contact details are now unlocked.')}><HandHeart size={16} />Claim pickup</button>);
  if (isClaimer && l.status === 'claimed') {
    buttons.push(<button key="pick" disabled={busy} className="btn-primary flex-1" onClick={() => call('pickup', {}, 'Marked as picked up')}><Truck size={16} />Picked up</button>);
    buttons.push(<button key="rel" disabled={busy} className="btn-secondary" onClick={() => call('release', {}, 'Claim released')}><Undo2 size={16} />Release</button>);
  }
  if (isClaimer && l.status === 'picked_up')
    buttons.push(<button key="del" className="btn-primary flex-1" onClick={() => setDeliverOpen(true)}><PackageCheck size={16} />Mark delivered</button>);
  if (isOwner && l.status === 'available')
    buttons.push(<Link key="edit" to={`/app/donor/edit/${l._id}`} className="btn-secondary flex-1"><Pencil size={16} />Edit</Link>);
  if (isOwner && ['available', 'claimed'].includes(l.status))
    buttons.push(<button key="cancel" disabled={busy} className="btn-ghost text-rose-600 hover:bg-rose-50"
      onClick={() => window.confirm('Cancel this donation?') && call('cancel', {}, 'Donation cancelled')}><XCircle size={16} />Cancel</button>);

  return (
    <>
      {buttons}
      <Modal open={deliverOpen} onClose={() => setDeliverOpen(false)} title="Confirm delivery">
        <div className="space-y-4">
          <div>
            <label className="label">How many people were served?</label>
            <input type="number" min="0" className="input" value={people} onChange={(e) => setPeople(e.target.value)} placeholder="e.g. 40" />
          </div>
          <div>
            <label className="label">Note (optional)</label>
            <textarea rows="2" className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Where was the food distributed?" />
          </div>
          <button disabled={busy} className="btn-primary w-full"
            onClick={() => call('deliver', { peopleServed: people === '' ? undefined : Number(people), note: note || undefined }, 'Delivery recorded. Thank you!')}>
            Confirm delivery
          </button>
        </div>
      </Modal>
    </>
  );
}
