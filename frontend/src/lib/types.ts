// ============================================
// Global Events Travels - Type Definitions
// ============================================

export type Difficulty = 'easy' | 'moderate' | 'difficult' | 'challenging' | 'extreme';
export type TrekStatus = 'draft' | 'published' | 'archived' | 'seasonal';

export interface Trek {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  description: string;
  difficulty: Difficulty;
  duration: number; // days
  max_altitude: number; // meters
  distance?: number; // kilometers
  price: number;
  featured_image?: string;
  gallery?: string[];
  status: TrekStatus;
  featured: boolean;
  location: string;
  start_point?: string;
  end_point?: string;
  best_season: string[];
  group_size_min: number;
  group_size_max: number;
  includes?: string[];
  excludes?: string[];
  equipment_list?: string[];
  fitness_level?: string;
  experience_required?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  map_embed?: string;
  pickup_city?: string | null;
  pickup_time?: string | null;
  quiz_tags?: string[] | null;
  quiz_persona?: string | null;
  quiz_share_line?: string | null;
  images?: TrekImage[];
  itinerary?: ItineraryDay[];
  faqs?: TrekFAQ[];
  batches?: TrekBatch[];
  reviews?: Review[];
  guide_id?: number;
  guide?: Guide;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface TrekBatch {
  id: number;
  start_date: string;
  end_date: string;
  total_seats: number;
  booked_seats: number;
  available_seats: number;
  is_sold_out: boolean;
  price_override?: number;
  is_active: boolean;
  notes?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  elevation_gain: number;
  distance: number;
}

export interface TrekFAQ {
  id?: number;
  question: string;
  answer: string;
  display_order: number;
}

export interface TrekImage {
  id: number;
  trek_id: number;
  url: string;
  caption?: string;
  display_order: number;
}

export interface Review {
  id: number;
  trek_id: number;
  user_name: string;
  email?: string;
  rating: number;
  title: string;
  comment: string;
  helpful_count: number;
  created_at: string;
}

export interface Guide {
  id: number;
  name: string;
  bio: string;
  experience_years: number;
  profile_image_url: string;
  specializations: string[];
  rating: number;
}

export interface Booking {
  id: number;
  trek_id: number;
  name: string;
  email: string;
  phone: string;
  group_size: number;
  preferred_date: string;
  special_requirements?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: number;
  name: string;
  role?: string;
  location?: string;
  image_url?: string;
  testimonial: string;
  trek_name?: string;
  rating: number;
  verified: boolean;
  tags?: string[];
  helpful_count?: number;
  date: string;
  featured: boolean;
}

// Office / Location types
export interface Office {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmarks?: string;
  phone: string;
  email: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  mapUrl: string;
  image?: string;
}

// Expedition types
export type ExpeditionDifficulty = 'advanced' | 'expert' | 'extreme';

export interface Expedition {
  id: number;
  name: string;
  slug: string;
  difficulty: ExpeditionDifficulty;
  duration: number;
  summitAltitude: number;
  baseAltitude: number;
  location: string;
  region: string;
  description: string;
  shortDescription: string;
  highlights: string[];
  requirements: {
    experience: string;
    fitnessLevel: string;
    technicalSkills: string[];
  };
  itinerary: ExpeditionDay[];
  equipment: {
    provided: string[];
    personal: string[];
  };
  price: number;
  groupSize: {
    min: number;
    max: number;
  };
  season: string[];
  successRate: number;
  image: string;
  gallery?: string[];
  guides?: Guide[];
  safetyInfo?: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
}

export interface ExpeditionDay {
  day: number;
  title: string;
  description: string;
  altitude: number;
  activities: string[];
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

// Blog types
export type BlogCategoryType = 
  | 'trek-guide'
  | 'budget-tips'
  | 'destination'
  | 'gear-review'
  | 'safety'
  | 'season-guide'
  | 'travel-tips'
  | string; // Allow custom categories from API

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  contentType?: 'html' | 'markdown';
  author?: BlogAuthor;
  publishDate?: string;
  updatedDate?: string;
  publishedAt?: string;
  featuredImage?: string;
  category?: BlogCategoryType;
  categoryId?: number;
  categoryName?: string;
  tags?: string[];
  readTime?: number; // minutes
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  structuredData?: Record<string, unknown> | unknown[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogAuthor {
  id?: number;
  name: string;
  avatar?: string;
  bio?: string;
  role?: string;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  children?: BlogCategory[];
  post_count?: number;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  post_count?: number;
}

// ============================================
// Marketing tools (quiz, calculator, student discount, city pages)
// ============================================

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

export interface MarketingSettings {
  student_discount: StudentDiscountSettings;
  quiz: QuizSettings;
  calculator: CalculatorSettings;
  city_pages: CityPageRules;
  quiz_tag_options: Record<string, string>;
  route_modes: string[];
  updated_at: string | null;
}

export interface MarketingBatch {
  id: number;
  start_date: string;
  end_date: string;
  price: number;
  available_seats: number;
  is_sold_out: boolean;
}

export interface MarketingTrek {
  id: number;
  name: string;
  slug: string;
  short_description?: string | null;
  difficulty: Difficulty;
  duration: number;
  max_altitude: number;
  price: number;
  featured_image?: string | null;
  location: string;
  region?: string | null;
  best_season: string[];
  pickup_city?: string | null;
  pickup_time?: string | null;
  quiz_tags: string[];
  quiz_persona?: string | null;
  quiz_share_line?: string | null;
  rating: number;
  review_count: number;
  includes: string[];
  equipment_list: string[];
  upcoming_batches: MarketingBatch[];
}

export type RouteMode =
  | 'group_departure'
  | 'volvo_bus'
  | 'ordinary_bus'
  | 'train'
  | 'flight'
  | 'shared_cab'
  | 'taxi';

export interface CityRoute {
  id: number;
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
  display_order: number;
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
  reachable_treks: MarketingTrek[];
  published_at: string | null;
  updated_at: string;
}

