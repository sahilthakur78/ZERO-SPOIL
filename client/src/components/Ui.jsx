import { Loader2 } from 'lucide-react';

export const Logo = ({ light }) => (
  <span className="inline-flex items-center gap-2 font-display text-xl font-extrabold">
    <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-lg shadow-soft">🍃</span>
    <span className={light ? 'text-white' : 'text-slate-900'}>Zero<span className={light ? 'text-brand-200' : 'text-brand-600'}>Spoil</span></span>
  </span>
);

export const PageSpinner = () => (
  <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-brand-600" /></div>
);

export const EmptyState = ({ icon: Icon, title, text, action }) => (
  <div className="card grid place-items-center px-6 py-14 text-center">
    <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Icon size={26} /></div>
    <h3 className="text-lg font-bold">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-slate-500">{text}</p>
    {action && <div className="mt-5">{action}</div>}
  </div>
);

export const PageHeader = ({ title, subtitle, children }) => (
  <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    <div className="flex gap-2">{children}</div>
  </div>
);

export const CardSkeletons = ({ n = 3 }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: n }).map((_, i) => <div key={i} className="skeleton h-52" />)}
  </div>
);
