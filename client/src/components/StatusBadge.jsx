import { STATUS } from '../utils/format';

export default function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.expired;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${s.cls}`}>{s.label}</span>;
}
