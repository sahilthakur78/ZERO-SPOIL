import { formatDistanceToNowStrict, differenceInMinutes } from 'date-fns';

export const STATUS = {
  available: { label: 'Available', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' },
  claimed: { label: 'Claimed', cls: 'bg-amber-50 text-amber-700 ring-amber-600/20' },
  picked_up: { label: 'Picked up', cls: 'bg-sky-50 text-sky-700 ring-sky-600/20' },
  delivered: { label: 'Delivered', cls: 'bg-brand-600 text-white ring-brand-700/20' },
  expired: { label: 'Expired', cls: 'bg-slate-100 text-slate-600 ring-slate-500/20' },
  cancelled: { label: 'Cancelled', cls: 'bg-rose-50 text-rose-700 ring-rose-600/20' },
};

export const FOOD_TYPES = [
  { value: 'veg', label: 'Vegetarian', emoji: '🥗' },
  { value: 'non-veg', label: 'Non-vegetarian', emoji: '🍗' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'bakery', label: 'Bakery', emoji: '🥖' },
  { value: 'packaged', label: 'Packaged', emoji: '📦' },
  { value: 'other', label: 'Other', emoji: '🍽️' },
];
export const UNITS = ['servings', 'kg', 'packets', 'boxes'];
export const foodMeta = (v) => FOOD_TYPES.find((f) => f.value === v) || FOOD_TYPES[5];

export function expiryInfo(date) {
  const mins = differenceInMinutes(new Date(date), new Date());
  if (mins <= 0) return { text: 'Expired', tone: 'text-rose-600' };
  return {
    text: `${formatDistanceToNowStrict(new Date(date))} left`,
    tone: mins < 120 ? 'text-rose-600' : mins < 360 ? 'text-amber-600' : 'text-slate-500',
  };
}

export function toLocalInput(date) {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export const fmtDate = (d) =>
  new Date(d).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
