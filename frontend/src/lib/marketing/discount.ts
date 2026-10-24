import type { StudentDiscountSettings } from '@/lib/types';

/** Discount for one student on a package price (0 when the offer is switched off). */
export function studentDiscountAmount(price: number, settings: StudentDiscountSettings): number {
  if (!settings.enabled || price <= 0 || settings.percent <= 0) return 0;
  const raw = (price * settings.percent) / 100;
  const capped = settings.cap_inr == null ? raw : Math.min(raw, settings.cap_inr);
  return Math.round(capped);
}

export function studentPrice(price: number, settings: StudentDiscountSettings): number {
  return price - studentDiscountAmount(price, settings);
}

/** One-off organiser bonus for a large enough group of verified students. */
export function groupBonusAmount(students: number, settings: StudentDiscountSettings): number {
  if (!settings.enabled || !settings.group_bonus_enabled) return 0;
  return students >= settings.group_min_size ? settings.group_bonus_inr : 0;
}

export function discountHeadline(settings: StudentDiscountSettings): string {
  const pct = Number.isInteger(settings.percent) ? settings.percent : settings.percent.toFixed(1);
  return settings.cap_inr == null
    ? `${pct}% off`
    : `${pct}% off (up to ₹${settings.cap_inr.toLocaleString('en-IN')})`;
}
