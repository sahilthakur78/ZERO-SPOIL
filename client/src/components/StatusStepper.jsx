import { Check } from 'lucide-react';

const STEPS = [
  { key: 'available', label: 'Listed' },
  { key: 'claimed', label: 'Claimed' },
  { key: 'picked_up', label: 'Picked up' },
  { key: 'delivered', label: 'Delivered' },
];

export default function StatusStepper({ status }) {
  if (['expired', 'cancelled'].includes(status)) {
    return (
      <div className={`rounded-xl px-4 py-3 text-sm font-medium ${status === 'expired' ? 'bg-slate-100 text-slate-600' : 'bg-rose-50 text-rose-700'}`}>
        This donation was {status}.
      </div>
    );
  }
  const current = STEPS.findIndex((s) => s.key === status);
  return (
    <ol className="flex items-center">
      {STEPS.map((s, i) => {
        const done = i <= current;
        return (
          <li key={s.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold ring-4 transition ${
                done ? 'bg-brand-600 text-white ring-brand-100' : 'bg-white text-slate-400 ring-slate-100 border border-slate-200'}`}>
                {i < current || status === 'delivered' ? <Check size={16} /> : i + 1}
              </span>
              <span className={`text-xs font-medium ${done ? 'text-brand-700' : 'text-slate-400'}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`mx-2 mb-5 h-1 flex-1 rounded ${i < current ? 'bg-brand-500' : 'bg-slate-200'}`} />}
          </li>
        );
      })}
    </ol>
  );
}
