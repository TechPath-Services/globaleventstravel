import { describe, expect, it } from 'vitest';

import { isBookableDeparture, kolkataDateISO } from './trek-departures';

describe('Kolkata departure dates', () => {
  const lateUtc = new Date('2026-11-10T20:00:00Z');

  it('rolls the calendar date forward after 18:30 UTC', () => {
    expect(kolkataDateISO(lateUtc)).toBe('2026-11-11');
    expect(kolkataDateISO(new Date('2026-11-10T12:00:00Z'))).toBe('2026-11-10');
  });

  it('does not treat a departure that already started as bookable', () => {
    expect(isBookableDeparture('2026-11-10', lateUtc)).toBe(false);
    expect(isBookableDeparture('2026-11-11', lateUtc)).toBe(true);
    expect(isBookableDeparture('2026-11-12T00:00:00', lateUtc)).toBe(true);
  });
});
