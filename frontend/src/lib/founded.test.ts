import { describe, expect, it } from 'vitest';

import { FOUNDED_YEAR, yearsOfExperienceValue, yearsSinceFounding } from './founded';

describe('founding year', () => {
  it('is 2012', () => {
    expect(FOUNDED_YEAR).toBe(2012);
  });

  it('derives the fallback years-of-experience figure from 2012', () => {
    const now = new Date('2026-11-10T00:00:00Z');
    expect(yearsSinceFounding(now)).toBe(14);
    expect(yearsOfExperienceValue(now)).toBe('14+');
  });
});
