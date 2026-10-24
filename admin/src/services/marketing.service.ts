import { apiClient, handleApiError } from "@/lib/api-client";

export const PUBLIC_SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://globaleventstravels.com"
).replace(/\/$/, "");

export interface FAQItem {
  question: string;
  answer: string;
}

export interface GearItem {
  key: string;
  label: string;
  rent_price: number | null;
  buy_price: number | null;
  keywords: string[];
}

export interface StudentDiscountSettings {
  enabled: boolean;
  percent: number;
  cap_inr: number | null;
  group_bonus_enabled: boolean;
  group_min_size: number;
  group_bonus_inr: number;
  verification_time_text: string;
  terms: string[];
  faqs: FAQItem[];
}

export interface QuizSettings {
  enabled: boolean;
  title: string;
  subtitle: string;
  season_months: string[];
}

export interface CalculatorSettings {
  enabled: boolean;
  price_includes_gst: boolean;
  gst_percent: number;
  hotel_budget_per_night: number | null;
  hotel_mid_per_night: number | null;
  hotel_comfort_per_night: number | null;
  food_per_travel_day: number | null;
  offloading_per_day: number | null;
  insurance_per_person: number | null;
  buffer_percent: number;
  gear_items: GearItem[];
  prices_last_checked: string | null;
}

export interface CityPageRules {
  max_age_days: number;
  min_routes: number;
  min_tips: number;
  min_faqs: number;
  min_intro_chars: number;
}

export interface MarketingSettingsData {
  student_discount: StudentDiscountSettings;
  quiz: QuizSettings;
  calculator: CalculatorSettings;
  city_pages: CityPageRules;
}

export interface MarketingSettings extends MarketingSettingsData {
  quiz_tag_options: Record<string, string>;
  route_modes: string[];
  updated_at: string | null;
}

export type RouteMode =
  | "group_departure"
  | "volvo_bus"
  | "ordinary_bus"
  | "train"
  | "flight"
  | "shared_cab"
  | "taxi";

export const ROUTE_MODE_LABELS: Record<RouteMode, string> = {
  group_departure: "Our group departure",
  volvo_bus: "AC / Volvo bus",
  ordinary_bus: "Ordinary bus",
  train: "Train",
  flight: "Flight",
  shared_cab: "Shared cab",
  taxi: "Private taxi",
};

export interface CityRoute {
  id?: number;
  to_base: string;
  mode: RouteMode;
  operator: string | null;
  departure_point: string | null;
  departure_time: string | null;
  duration_hours: number | null;
  fare_min: number | null;
  fare_max: number | null;
  notes: string | null;
  source: string | null;
  display_order?: number;
}

export interface DepartureCitySummary {
  id: number;
  name: string;
  slug: string;
  state: string | null;
  hero_image: string | null;
  meta_description: string | null;
  is_published: boolean;
  display_order: number;
  last_verified: string | null;
  verified_by: string | null;
  is_stale: boolean;
  route_count: number;
  bases: string[];
  quality_issues: string[];
  updated_at: string;
}

export interface ReachableTrek {
  id: number;
  name: string;
  slug: string;
  pickup_city: string | null;
}

export interface DepartureCity {
  id: number;
  name: string;
  slug: string;
  state: string | null;
  display_order: number;
  hero_image: string | null;
  intro_html: string | null;
  local_tips: string[];
  faqs: FAQItem[];
  meta_title: string | null;
  meta_description: string | null;
  last_verified: string | null;
  verified_by: string | null;
  is_published: boolean;
  is_stale: boolean;
  bases: string[];
  quality_issues: string[];
  routes: CityRoute[];
  reachable_treks: ReachableTrek[];
  published_at: string | null;
  updated_at: string;
}

export interface DepartureCityPayload {
  name: string;
  slug: string;
  state: string | null;
  display_order: number;
  hero_image: string | null;
  intro_html: string | null;
  local_tips: string[];
  faqs: FAQItem[];
  meta_title: string | null;
  meta_description: string | null;
  last_verified: string | null;
  verified_by: string | null;
  is_published: boolean;
  routes: CityRoute[];
}

export const marketingService = {
  async getSettings(): Promise<MarketingSettings> {
    try {
      const response = await apiClient.get<MarketingSettings>("/api/v1/marketing/settings");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateSettings(data: MarketingSettingsData): Promise<MarketingSettings> {
    try {
      const response = await apiClient.put<MarketingSettings>("/api/v1/marketing/settings", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async listCities(): Promise<DepartureCitySummary[]> {
    try {
      const response = await apiClient.get<DepartureCitySummary[]>("/api/v1/departure-cities/admin");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async getCity(id: number): Promise<DepartureCity> {
    try {
      const response = await apiClient.get<DepartureCity>(`/api/v1/departure-cities/admin/${id}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async createCity(data: DepartureCityPayload): Promise<DepartureCity> {
    try {
      const response = await apiClient.post<DepartureCity>("/api/v1/departure-cities", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async updateCity(id: number, data: Partial<DepartureCityPayload>): Promise<DepartureCity> {
    try {
      const response = await apiClient.put<DepartureCity>(`/api/v1/departure-cities/${id}`, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  async deleteCity(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/departure-cities/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
