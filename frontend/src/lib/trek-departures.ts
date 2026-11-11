/**
 * Departure dates are bookable for the Asia/Kolkata calendar day.
 * A batch whose start date is already in the past is not offered.
 */

export function kolkataDateISO(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function isBookableDeparture(startDate: string, now: Date = new Date()): boolean {
  const day = startDate.slice(0, 10);
  return day >= kolkataDateISO(now);
}
