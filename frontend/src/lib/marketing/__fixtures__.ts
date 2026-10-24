import type {
  CalculatorSettings,
  CityRoute,
  MarketingTrek,
  StudentDiscountSettings,
} from '@/lib/types';

export function trek(overrides: Partial<MarketingTrek> = {}): MarketingTrek {
  return {
    id: 1,
    name: 'Kedarkantha Trek',
    slug: 'kedarkantha',
    short_description: 'Snow summit',
    difficulty: 'easy',
    duration: 6,
    max_altitude: 3810,
    price: 10000,
    featured_image: null,
    location: 'Uttarkashi, Uttarakhand',
    region: 'Uttarakhand',
    best_season: ['December', 'January'],
    pickup_city: 'Dehradun',
    pickup_time: '6:00 AM',
    quiz_tags: ['summit', 'snow_forest'],
    quiz_persona: null,
    quiz_share_line: null,
    rating: 4.8,
    review_count: 10,
    includes: ['All meals', 'Microspikes'],
    equipment_list: ['Down jacket', 'Trekking poles', 'Trekking shoes with ankle support'],
    upcoming_batches: [],
    ...overrides,
  };
}

export const studentSettings: StudentDiscountSettings = {
  enabled: true,
  percent: 10,
  cap_inr: 1500,
  group_bonus_enabled: true,
  group_min_size: 8,
  group_bonus_inr: 1000,
  verification_time_text: 'within 24 hours',
  terms: [],
  faqs: [],
};

export const calculatorSettings: CalculatorSettings = {
  enabled: true,
  price_includes_gst: true,
  gst_percent: 5,
  hotel_budget_per_night: 800,
  hotel_mid_per_night: 1500,
  hotel_comfort_per_night: null,
  food_per_travel_day: 500,
  offloading_per_day: 300,
  insurance_per_person: null,
  buffer_percent: 10,
  gear_items: [
    { key: 'down_jacket', label: 'Down jacket', rent_price: 400, buy_price: 3000, keywords: ['down jacket'] },
    { key: 'trek_poles', label: 'Trekking poles', rent_price: 150, buy_price: 900, keywords: ['poles'] },
    { key: 'microspikes', label: 'Microspikes', rent_price: 200, buy_price: 1200, keywords: ['microspikes'] },
    { key: 'gaiters', label: 'Gaiters', rent_price: 100, buy_price: 800, keywords: ['gaiters'] },
    { key: 'headlamp', label: 'Headlamp', rent_price: null, buy_price: null, keywords: ['headlamp'] },
  ],
  prices_last_checked: null,
};

export function route(overrides: Partial<CityRoute> = {}): CityRoute {
  return {
    id: 1,
    to_base: 'Dehradun',
    mode: 'volvo_bus',
    operator: 'UTC',
    departure_point: 'ISBT Kashmere Gate',
    departure_time: '10 PM',
    duration_hours: 7,
    fare_min: 800,
    fare_max: 1000,
    notes: null,
    source: 'operator',
    display_order: 0,
    ...overrides,
  };
}
