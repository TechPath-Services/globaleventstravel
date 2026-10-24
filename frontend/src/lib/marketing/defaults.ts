import type { CalculatorSettings, StudentDiscountSettings } from '@/lib/types';

/** Used only if the settings API is unreachable; mirrors backend defaults, all rates unset. */
export const DEFAULT_SETTINGS_FALLBACK: {
  calculator: CalculatorSettings;
  student_discount: StudentDiscountSettings;
} = {
  calculator: {
    enabled: true,
    price_includes_gst: true,
    gst_percent: 5,
    hotel_budget_per_night: null,
    hotel_mid_per_night: null,
    hotel_comfort_per_night: null,
    food_per_travel_day: null,
    offloading_per_day: null,
    insurance_per_person: null,
    buffer_percent: 10,
    gear_items: [],
    prices_last_checked: null,
  },
  student_discount: {
    enabled: false,
    percent: 0,
    cap_inr: null,
    group_bonus_enabled: false,
    group_min_size: 8,
    group_bonus_inr: 0,
    verification_time_text: '',
    terms: [],
    faqs: [],
  },
};
