import type {
  CalculatorSettings,
  CityRoute,
  GearItem,
  MarketingBatch,
  MarketingTrek,
  StudentDiscountSettings,
} from '@/lib/types';
import { groupBonusAmount, studentDiscountAmount } from './discount';
import { formatDate, formatInr, routeModeLabel, sameBase } from './format';

export type HotelTier = 'budget' | 'mid' | 'comfort';
export type GearChoice = 'own' | 'rent' | 'buy';

export interface BudgetInputs {
  trek: string;
  batch: number | null;
  people: number;
  students: number;
  from: string | null;
  route: number | null;
  /** Round-trip travel per person when no listed route fits. */
  customTravel: number | null;
  nightsBefore: number;
  nightsAfter: number;
  hotel: HotelTier;
  gear: Record<string, GearChoice>;
  offloading: boolean;
  insurance: boolean;
  buffer: number;
}

export interface BudgetLine {
  key: string;
  label: string;
  note?: string;
  group: number;
}

export interface SavingTip {
  key: string;
  text: string;
  saving: number;
  href?: string;
}

export interface BudgetResult {
  lines: BudgetLine[];
  groupTotal: number;
  perPerson: number;
  tips: SavingTip[];
  /** Cost items that could not be priced because admin has not set a rate yet. */
  unpriced: string[];
}

export interface GearRow {
  item: GearItem;
  included: boolean;
}

export const DEFAULT_INPUTS: Omit<BudgetInputs, 'trek'> = {
  batch: null,
  people: 1,
  students: 0,
  from: null,
  route: null,
  customTravel: null,
  nightsBefore: 1,
  nightsAfter: 0,
  hotel: 'mid',
  gear: {},
  offloading: false,
  insurance: false,
  buffer: 10,
};

const HOTEL_FIELD: Record<HotelTier, keyof CalculatorSettings> = {
  budget: 'hotel_budget_per_night',
  mid: 'hotel_mid_per_night',
  comfort: 'hotel_comfort_per_night',
};

const clampInt = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(Number.isFinite(value) ? value : min)));

function matches(list: string[], keywords: string[]): boolean {
  const haystack = list.map((s) => s.toLowerCase());
  return keywords.some((k) => k && haystack.some((h) => h.includes(k.toLowerCase())));
}

/** Gear items relevant to a trek: matched by its equipment list, or all items if it has none. */
export function gearRowsFor(trek: MarketingTrek, items: GearItem[]): GearRow[] {
  const priced = items.filter((g) => g.rent_price != null || g.buy_price != null);
  return priced
    .filter((g) => !trek.equipment_list.length || matches(trek.equipment_list, g.keywords) ||
      matches(trek.includes, g.keywords))
    .map((item) => ({ item, included: matches(trek.includes, item.keywords) }));
}

export function routesForTrek(routes: CityRoute[], trek: MarketingTrek): CityRoute[] {
  return routes.filter((r) => sameBase(r.to_base, trek.pickup_city));
}

/** One-way fare used for estimates: midpoint of the published range. */
export function routeFare(route: CityRoute): number | null {
  if (route.fare_min == null && route.fare_max == null) return null;
  const min = route.fare_min ?? route.fare_max!;
  const max = route.fare_max ?? route.fare_min!;
  return Math.round((min + max) / 2);
}

export function batchPrice(trek: MarketingTrek, batchId: number | null): {
  price: number;
  batch: MarketingBatch | null;
} {
  const batch = trek.upcoming_batches.find((b) => b.id === batchId) ?? null;
  return { price: batch ? batch.price : trek.price, batch };
}

export function normalizeInputs(inputs: BudgetInputs): BudgetInputs {
  const people = clampInt(inputs.people, 1, 50);
  return {
    ...inputs,
    people,
    students: clampInt(inputs.students, 0, people),
    nightsBefore: clampInt(inputs.nightsBefore, 0, 5),
    nightsAfter: clampInt(inputs.nightsAfter, 0, 5),
    buffer: clampInt(inputs.buffer, 0, 50),
    customTravel:
      inputs.customTravel == null ? null : clampInt(inputs.customTravel, 0, 500000),
  };
}

export function computeBudget(args: {
  inputs: BudgetInputs;
  trek: MarketingTrek;
  routes: CityRoute[];
  calculator: CalculatorSettings;
  student: StudentDiscountSettings;
}): BudgetResult {
  const { trek, routes, calculator, student } = args;
  const inputs = normalizeInputs(args.inputs);
  const { people, students } = inputs;
  const lines: BudgetLine[] = [];
  const tips: SavingTip[] = [];
  const unpriced: string[] = [];

  const { price, batch } = batchPrice(trek, inputs.batch);
  lines.push({
    key: 'package',
    label: `${trek.name} package`,
    note: `${formatInr(price)} × ${people}${batch ? '' : ' (base price)'}`,
    group: price * people,
  });

  if (!calculator.price_includes_gst && calculator.gst_percent > 0) {
    lines.push({
      key: 'gst',
      label: `GST (${calculator.gst_percent}%)`,
      group: Math.round((price * people * calculator.gst_percent) / 100),
    });
  }

  const perStudent = studentDiscountAmount(price, student);
  if (students > 0 && perStudent > 0) {
    lines.push({
      key: 'student',
      label: 'Student discount',
      note: `${students} × ${formatInr(perStudent)}`,
      group: -perStudent * students,
    });
    const bonus = groupBonusAmount(students, student);
    if (bonus > 0) {
      lines.push({ key: 'group_bonus', label: 'Student group organiser bonus', group: -bonus });
    }
  }

  const tripRoutes = routesForTrek(routes, trek);
  const route = tripRoutes.find((r) => r.id === inputs.route) ?? null;
  const fare = route ? routeFare(route) : null;
  let travelling = false;
  if (route && fare != null) {
    travelling = true;
    lines.push({
      key: 'travel',
      label: `Travel to ${route.to_base} and back`,
      note: `${routeModeLabel(route.mode)} · ~${formatInr(fare)} each way × ${people}`,
      group: fare * 2 * people,
    });
    const cheaper = tripRoutes
      .map((r) => ({ r, f: routeFare(r) }))
      .filter((x): x is { r: CityRoute; f: number } => x.f != null && x.f < fare)
      .sort((x, y) => x.f - y.f)[0];
    if (cheaper) {
      tips.push({
        key: 'cheaper_route',
        text: `Take the ${routeModeLabel(cheaper.r.mode).toLowerCase()} instead`,
        saving: (fare - cheaper.f) * 2 * people,
      });
    }
  } else if (inputs.customTravel != null && inputs.customTravel > 0) {
    travelling = true;
    lines.push({
      key: 'travel',
      label: 'Travel to pickup and back (your estimate)',
      note: `${formatInr(inputs.customTravel)} × ${people}`,
      group: inputs.customTravel * people,
    });
  }

  const nights = inputs.nightsBefore + inputs.nightsAfter;
  if (nights > 0) {
    const rate = calculator[HOTEL_FIELD[inputs.hotel]] as number | null;
    if (rate != null) {
      lines.push({
        key: 'hotel',
        label: `Stay in ${trek.pickup_city || 'base town'}`,
        note: `${nights} night${nights > 1 ? 's' : ''} × ${formatInr(rate)} × ${people}`,
        group: rate * nights * people,
      });
      const budgetRate = calculator.hotel_budget_per_night;
      if (inputs.hotel !== 'budget' && budgetRate != null && budgetRate < rate) {
        tips.push({
          key: 'hotel_budget',
          text: 'Pick a budget stay for the pickup night',
          saving: (rate - budgetRate) * nights * people,
        });
      }
    } else {
      unpriced.push('Hotel nights');
    }
  }

  let gearTotal = 0;
  let gearSaving = 0;
  for (const { item, included } of gearRowsFor(trek, calculator.gear_items)) {
    const choice = inputs.gear[item.key] ?? 'own';
    if (included || choice === 'own') continue;
    const cost = choice === 'rent' ? item.rent_price : item.buy_price;
    if (cost == null) continue;
    gearTotal += cost * people;
    if (choice === 'buy' && item.rent_price != null && item.rent_price < cost) {
      gearSaving += (cost - item.rent_price) * people;
    }
  }
  if (gearTotal > 0) {
    lines.push({ key: 'gear', label: 'Gear (rent / buy)', group: gearTotal });
  }
  if (gearSaving > 0) {
    tips.push({ key: 'gear_rent', text: 'Rent gear instead of buying it', saving: gearSaving });
  }

  if (inputs.offloading) {
    if (calculator.offloading_per_day != null) {
      lines.push({
        key: 'offloading',
        label: 'Backpack offloading',
        note: `${trek.duration} days × ${formatInr(calculator.offloading_per_day)} × ${people}`,
        group: calculator.offloading_per_day * trek.duration * people,
      });
    } else {
      unpriced.push('Backpack offloading');
    }
  }

  if (inputs.insurance) {
    if (calculator.insurance_per_person != null) {
      lines.push({
        key: 'insurance',
        label: 'Travel insurance',
        group: calculator.insurance_per_person * people,
      });
    } else {
      unpriced.push('Travel insurance');
    }
  }

  if (travelling && calculator.food_per_travel_day != null) {
    lines.push({
      key: 'food',
      label: 'Food on travel days',
      note: `2 days × ${formatInr(calculator.food_per_travel_day)} × ${people}`,
      group: calculator.food_per_travel_day * 2 * people,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.group, 0);
  if (inputs.buffer > 0) {
    lines.push({
      key: 'buffer',
      label: `Buffer (${inputs.buffer}%)`,
      note: 'Snacks, tips, delays',
      group: Math.round((Math.max(0, subtotal) * inputs.buffer) / 100),
    });
  }

  if (students < people && perStudent > 0) {
    tips.push({
      key: 'student',
      text: 'Students in your group? Each saves',
      saving: perStudent,
      href: '/student-discount/',
    });
  }

  const cheapestBatch = trek.upcoming_batches
    .filter((b) => !b.is_sold_out)
    .sort((x, y) => x.price - y.price)[0];
  if (cheapestBatch && cheapestBatch.price < price) {
    tips.push({
      key: 'batch',
      text: `Choose the ${formatDate(cheapestBatch.start_date, { year: undefined })} batch`,
      saving: (price - cheapestBatch.price) * people,
    });
  }

  const groupTotal = Math.max(0, Math.round(lines.reduce((sum, l) => sum + l.group, 0)));
  return {
    lines,
    groupTotal,
    perPerson: Math.round(groupTotal / people),
    tips: tips.filter((t) => t.saving > 0),
    unpriced,
  };
}

// ============================================
// URL state (shareable breakdowns)
// ============================================

const GEAR_CODE: Record<GearChoice, string> = { own: 'o', rent: 'r', buy: 'b' };
const GEAR_DECODE: Record<string, GearChoice> = { o: 'own', r: 'rent', b: 'buy' };

export function inputsToParams(inputs: BudgetInputs): URLSearchParams {
  const p = new URLSearchParams();
  p.set('trek', inputs.trek);
  if (inputs.batch != null) p.set('batch', String(inputs.batch));
  p.set('people', String(inputs.people));
  if (inputs.students) p.set('students', String(inputs.students));
  if (inputs.from) p.set('from', inputs.from);
  if (inputs.route != null) p.set('route', String(inputs.route));
  if (inputs.customTravel != null) p.set('travel', String(inputs.customTravel));
  p.set('nb', String(inputs.nightsBefore));
  p.set('na', String(inputs.nightsAfter));
  p.set('hotel', inputs.hotel);
  const gear = Object.entries(inputs.gear)
    .filter(([, choice]) => choice !== 'own')
    .map(([key, choice]) => `${key}:${GEAR_CODE[choice]}`)
    .join(',');
  if (gear) p.set('gear', gear);
  if (inputs.offloading) p.set('off', '1');
  if (inputs.insurance) p.set('ins', '1');
  p.set('buf', String(inputs.buffer));
  return p;
}

export function paramsToInputs(p: URLSearchParams, fallbackTrek: string): BudgetInputs {
  const int = (key: string): number | null => {
    const raw = p.get(key);
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.round(n) : null;
  };
  const gear: Record<string, GearChoice> = {};
  for (const pair of (p.get('gear') ?? '').split(',')) {
    const [key, code] = pair.split(':');
    if (key && /^[a-z0-9_]+$/.test(key) && GEAR_DECODE[code]) gear[key] = GEAR_DECODE[code];
  }
  const hotel = p.get('hotel');
  const trek = p.get('trek');
  const from = p.get('from');
  return normalizeInputs({
    trek: trek && /^[a-z0-9-]+$/.test(trek) ? trek : fallbackTrek,
    batch: int('batch'),
    people: int('people') ?? DEFAULT_INPUTS.people,
    students: int('students') ?? 0,
    from: from && /^[a-z0-9-]+$/.test(from) ? from : null,
    route: int('route'),
    customTravel: int('travel'),
    nightsBefore: int('nb') ?? DEFAULT_INPUTS.nightsBefore,
    nightsAfter: int('na') ?? DEFAULT_INPUTS.nightsAfter,
    hotel: hotel === 'budget' || hotel === 'comfort' ? hotel : 'mid',
    gear,
    offloading: p.get('off') === '1',
    insurance: p.get('ins') === '1',
    buffer: int('buf') ?? DEFAULT_INPUTS.buffer,
  });
}
