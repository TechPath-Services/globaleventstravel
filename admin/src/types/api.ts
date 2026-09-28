export type PostStatus = "draft" | "published" | "archived";
export type ContentType = "markdown" | "html";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface BlogAuthor {
  id: number;
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
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogCategoryTree extends BlogCategory {
  children: BlogCategoryTree[];
  post_count: number;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  post_count?: number;
  created_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  contentType: ContentType;
  status: PostStatus;
  author: BlogAuthor;
  publishDate?: string;
  updatedDate?: string;
  publishedAt?: string;
  featuredImage?: string;
  category?: string;
  categoryId?: number;
  categoryName?: string;
  tags?: string[];
  tagsList?: BlogTag[];
  readTime?: number;
  featured: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
  structuredData?: Record<string, unknown> | unknown[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPostListItem {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  author: BlogAuthor;
  publishDate?: string;
  featuredImage?: string;
  category?: string;
  categoryName?: string;
  tags?: string[];
  readTime?: number;
  featured: boolean;
  status: PostStatus;
  contentType: ContentType;
  createdAt: string;
}

export interface BlogPostCreate {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  content_type?: ContentType;
  status?: PostStatus;
  category_id?: number;
  category?: string;
  tags?: string[];
  tag_ids?: number[];
  featured_image?: string;
  read_time?: number;
  featured?: boolean;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  structured_data?: Record<string, unknown> | unknown[] | null;
  author_id: number;
  published_at?: string;
}

export interface BlogPostUpdate extends Partial<BlogPostCreate> {}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface MediaFile {
  id: number;
  hash: string;
  filename: string;
  original_filename: string;
  url: string;
  size: number;
  mime_type: string;
  folder: string;
  tags: string[] | null;
  storage_type: string;
  alt_text: string | null;
  caption: string | null;
  created_at: string;
  updated_at: string;
}

export interface UploadResponse extends MediaFile {
  is_duplicate: boolean;
}

export interface MediaListResponse {
  items: MediaFile[];
  total: number;
  skip: number;
  limit: number;
}

export interface MediaUpdate {
  tags?: string[];
  alt_text?: string;
  caption?: string;
  folder?: string;
}

export interface TagInfo {
  tag: string;
  count: number;
}

export interface FolderInfo {
  folder: string;
  count: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
  user: User;
}

// ============================================
// Trek Types
// ============================================

export type TrekStatus = "draft" | "published" | "archived" | "seasonal";
export type TrekDifficulty = "easy" | "moderate" | "difficult" | "challenging" | "extreme";

export interface ItineraryDay {
  id: number;
  day: number;
  title: string;
  description: string;
  elevation_gain: number;
  distance: number;
  accommodation?: string;
  meals?: string;
  highlights?: string[];
  created_at: string;
  updated_at: string;
}

export interface ItineraryDayCreate {
  day: number;
  title: string;
  description: string;
  elevation_gain?: number;
  distance?: number;
  accommodation?: string;
  meals?: string;
  highlights?: string[];
}

export interface ItineraryDayUpdate extends Partial<ItineraryDayCreate> {}

export interface TrekFAQ {
  id: number;
  trek_id: number;
  question: string;
  answer: string;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface TrekFAQCreate {
  question: string;
  answer: string;
  display_order?: number;
}

export interface Trek {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  description: string;
  difficulty: TrekDifficulty;
  duration: number;
  max_altitude: number;
  distance?: number;
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
  itinerary_pdf_url?: string;
  itinerary: ItineraryDay[];
  faqs?: TrekFAQ[];
  batches?: TrekBatch[];
  rating?: number;
  review_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface TrekListItem {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  difficulty: TrekDifficulty;
  duration: number;
  price: number;
  featured_image?: string;
  status: TrekStatus;
  featured: boolean;
  location: string;
  best_season?: string[];
  rating?: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export interface TrekCreate {
  name: string;
  slug: string;
  short_description?: string;
  description: string;
  difficulty: TrekDifficulty;
  duration: number;
  max_altitude: number;
  distance?: number;
  price: number;
  featured_image?: string;
  gallery?: string[];
  status?: TrekStatus;
  featured?: boolean;
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
  itinerary_pdf_url?: string;
  rating?: number;
  review_count?: number;
  itinerary?: ItineraryDayCreate[];
  faqs?: TrekFAQCreate[];
}

export interface TrekUpdate extends Partial<TrekCreate> {}

// ============================================
// Trek Batch Types
// ============================================

export interface TrekBatch {
  id: number;
  trek_id: number;
  start_date: string;
  end_date: string;
  total_seats: number;
  booked_seats: number;
  available_seats: number;
  is_sold_out: boolean;
  price_override?: number;
  is_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TrekBatchCreate {
  start_date: string;
  end_date: string;
  total_seats: number;
  booked_seats?: number;
  price_override?: number;
  is_active?: boolean;
  notes?: string;
}

export type TrekBatchUpdate = Partial<TrekBatchCreate>;

// ============================================
// Expedition Types
// ============================================

export type ExpeditionStatus = "draft" | "published" | "archived";
export type ExpeditionDifficulty = "advanced" | "expert" | "extreme";

export interface ExpeditionRequirements {
  experience: string;
  fitnessLevel: string;
  technicalSkills: string[];
}

export interface ExpeditionEquipment {
  provided: string[];
  personal: string[];
}

export interface ExpeditionDay {
  id?: number;
  day: number;
  title: string;
  description: string;
  altitude: number;
  activities: string[];
}

export interface ExpeditionDayCreate {
  day: number;
  title: string;
  description: string;
  altitude: number;
  activities: string[];
}

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
  requirements: ExpeditionRequirements;
  equipment: ExpeditionEquipment;
  price: number;
  groupSize: { min: number; max: number };
  season: string[];
  successRate: number;
  image: string;
  gallery?: string[];
  safetyInfo?: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  status: ExpeditionStatus;
  itineraryPdfUrl?: string;
  itinerary?: ExpeditionDay[];
  created_at: string;
  updated_at: string;
}

export interface ExpeditionListItem {
  id: number;
  name: string;
  slug: string;
  difficulty: ExpeditionDifficulty;
  duration: number;
  summitAltitude: number;
  location: string;
  region: string;
  shortDescription: string;
  price: number;
  season: string[];
  successRate: number;
  image: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  status: ExpeditionStatus;
  created_at: string;
  updated_at: string;
}

export interface ExpeditionCreate {
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
  requirements: ExpeditionRequirements;
  equipment: ExpeditionEquipment;
  price: number;
  group_size_min: number;
  group_size_max: number;
  season: string[];
  successRate?: number;
  image: string;
  gallery?: string[];
  safetyInfo?: string;
  rating?: number;
  reviewCount?: number;
  featured?: boolean;
  status?: ExpeditionStatus;
  itineraryPdfUrl?: string;
  itinerary?: ExpeditionDayCreate[];
}

export interface ExpeditionUpdate extends Partial<ExpeditionCreate> {}

// ============================================
// Lead & Contact Types
// ============================================

export type LeadStatus = "new" | "contacted" | "converted" | "lost";

export interface Lead {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  trek_slug: string;
  trek_name?: string | null;
  source: string;
  status: LeadStatus;
  itinerary_sent: boolean;
  created_at: string;
  updated_at: string;
  notes?: string | null;
}

export interface LeadListItem {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  trek_slug: string;
  trek_name?: string | null;
  source: string;
  status: LeadStatus;
  itinerary_sent: boolean;
  created_at: string;
}

export type ContactStatus = "unread" | "read" | "replied" | "archived";

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  trek_interest?: string | null;
  message: string;
  newsletter_subscribe: boolean;
  status: ContactStatus;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactMessageListItem {
  id: number;
  name: string;
  email: string;
  subject: string;
  status: ContactStatus;
  created_at: string;
}
