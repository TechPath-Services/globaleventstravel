import type { RouteMode } from '@/lib/types';

const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatInr(amount: number): string {
  return inr.format(Math.round(amount));
}

export function formatInrRange(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  if (min == null || max == null || min === max) return formatInr((min ?? max) as number);
  return `${formatInr(min)} – ${formatInr(max)}`;
}

export function formatHours(hours: number | null): string | null {
  if (hours == null) return null;
  const whole = Math.floor(hours);
  const minutes = Math.round((hours - whole) * 60);
  if (whole === 0) return `${minutes} min`;
  return minutes ? `${whole} h ${minutes} min` : `${whole} h`;
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = {}): string {
  return new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...opts,
  });
}

export const ROUTE_MODE_LABELS: Record<RouteMode, string> = {
  group_departure: 'Our group departure',
  volvo_bus: 'AC / Volvo bus',
  ordinary_bus: 'Ordinary bus',
  train: 'Train',
  flight: 'Flight',
  shared_cab: 'Shared cab',
  taxi: 'Private taxi',
};

export function routeModeLabel(mode: string): string {
  return ROUTE_MODE_LABELS[mode as RouteMode] ?? mode.replace(/_/g, ' ');
}

export function sameBase(a?: string | null, b?: string | null): boolean {
  const norm = (v?: string | null) => (v ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  return !!norm(a) && norm(a) === norm(b);
}
