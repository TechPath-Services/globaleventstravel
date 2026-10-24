import { describe, expect, it } from 'vitest';
import { discountHeadline, groupBonusAmount, studentDiscountAmount, studentPrice } from './discount';
import { studentSettings } from './__fixtures__';

describe('student discount', () => {
  it('takes the percentage below the cap', () => {
    expect(studentDiscountAmount(9999, studentSettings)).toBe(1000);
    expect(studentPrice(9999, studentSettings)).toBe(8999);
  });

  it('caps the discount', () => {
    expect(studentDiscountAmount(25000, studentSettings)).toBe(1500);
  });

  it('supports no cap and disabled offers', () => {
    expect(studentDiscountAmount(25000, { ...studentSettings, cap_inr: null })).toBe(2500);
    expect(studentDiscountAmount(25000, { ...studentSettings, enabled: false })).toBe(0);
    expect(studentDiscountAmount(0, studentSettings)).toBe(0);
  });

  it('gives the organiser bonus only for big enough groups', () => {
    expect(groupBonusAmount(7, studentSettings)).toBe(0);
    expect(groupBonusAmount(8, studentSettings)).toBe(1000);
    expect(groupBonusAmount(8, { ...studentSettings, group_bonus_enabled: false })).toBe(0);
  });

  it('builds a headline from settings', () => {
    expect(discountHeadline(studentSettings)).toBe('10% off (up to ₹1,500)');
    expect(discountHeadline({ ...studentSettings, cap_inr: null, percent: 12.5 })).toBe('12.5% off');
  });
});
