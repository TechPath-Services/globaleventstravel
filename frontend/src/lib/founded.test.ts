import { describe, expect, it } from 'vitest';

import {
  FOUNDED_YEAR,
  correctFoundingCopy,
  withComputedYears,
  yearsOfExperienceValue,
  yearsSinceFounding,
} from './founded';

describe('founding year', () => {
  it('is 2012', () => {
    expect(FOUNDED_YEAR).toBe(2012);
  });

  it('derives years of experience from 2012', () => {
    const now = new Date('2026-11-10T00:00:00Z');
    expect(yearsSinceFounding(now)).toBe(14);
    expect(yearsOfExperienceValue(now)).toBe('14+');
  });

  it('rewrites only years-of-experience stats', () => {
    const stats = withComputedYears(
      [
        { value: '4.8', label: 'Average Rating' },
        { value: '8+', label: 'Years Experience' },
        { value: '10,000+', label: 'Happy Trekkers' },
      ],
      new Date('2026-11-10T00:00:00Z'),
    );
    expect(stats).toEqual([
      { value: '4.8', label: 'Average Rating' },
      { value: '14+', label: 'Years Experience' },
      { value: '10,000+', label: 'Happy Trekkers' },
    ]);
  });

  it('corrects the old founding phrases and leaves other years', () => {
    const text = correctFoundingCopy(
      'was founded in 2016. Trusted since 2016. Frank Smythe visited in 1931. Guides have 15 years.',
    );
    expect(text).toBe(
      'was founded in 2012. Trusted since 2012. Frank Smythe visited in 1931. Guides have 15 years.',
    );
  });
});
