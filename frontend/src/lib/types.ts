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

