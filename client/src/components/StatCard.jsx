export default function StatCard({ icon: Icon, label, value, tone = 'brand', hint }) {
  const tones = {
    brand: 'bg-brand-50 text-brand-600', amber: 'bg-amber-50 text-amber-600',
    sky: 'bg-sky-50 text-sky-600', rose: 'bg-rose-50 text-rose-600', violet: 'bg-violet-50 text-violet-600',
  };
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`grid h-12 w-12 place-items-center rounded-xl ${tones[tone]}`}><Icon size={22} /></div>
      <div>
        <p className="font-display text-2xl font-extrabold text-slate-900">{value ?? '–'}</p>
        <p className="text-sm text-slate-500">{label}</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
