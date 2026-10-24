/**
 * API Client for Global Events Travels Backend
 * Provides type-safe API calls to the FastAPI backend
 */

import { API_BASE_URL } from './constants';
import type {
  Trek,
  TrekBatch,
  Expedition,
  Guide,
  Testimonial,
  Office,
  BlogPost,
  BlogCategory,
  BlogTag,
  Booking,
  PaginatedResponse,
  ContactForm,
  MarketingSettings,
  MarketingTrek,
  DepartureCity,
  DepartureCitySummary,
} from './types';

// ============================================
// API Configuration
// ============================================

const api = {
  baseUrl: API_BASE_URL,
  
  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api/v1${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `API Error: ${response.status}`);
    }
    
    return response.json();
  },
  
  get<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'GET' });
  },
  
  post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  
  put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  
  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.fetch<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },
  
  delete<T>(endpoint: string): Promise<T> {
    return this.fetch<T>(endpoint, { method: 'DELETE' });
  },
};

// ============================================
// Trek API
// ============================================

export interface TrekFilters {
  difficulty?: 'easy' | 'moderate' | 'hard' | 'expert';
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  season?: string;
  status?: string;
  skip?: number;
  limit?: number;
}

export const treksApi = {
  async list(filters: TrekFilters = {}): Promise<PaginatedResponse<Trek>> {
    const params = new URLSearchParams();
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.minPrice) params.append('min_price', filters.minPrice.toString());
    if (filters.maxPrice) params.append('max_price', filters.maxPrice.toString());
    if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters.season) params.append('season', filters.season);
    if (filters.status) params.append('status', filters.status);
    if (filters.skip) params.append('skip', filters.skip.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString();
    return api.get<PaginatedResponse<Trek>>(`/treks${query ? `?${query}` : ''}`);
  },
  
  async getFeatured(limit = 6): Promise<Trek[]> {
    return api.get<Trek[]>(`/treks/featured?limit=${limit}`);
  },
  
  async getBySlug(slug: string): Promise<Trek> {
    return api.get<Trek>(`/treks/${slug}`);
  },
  
  async getById(id: number): Promise<Trek> {
    return api.get<Trek>(`/treks/id/${id}`);
  },

  async getBatchesBySlug(slug: string): Promise<TrekBatch[]> {
    return api.get<TrekBatch[]>(`/treks/${slug}/batches/public`);
  },
};

// ============================================
// Expedition API
// ============================================

export interface ExpeditionFilters {
  difficulty?: 'advanced' | 'expert' | 'extreme';
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  region?: string;
  status?: string;
  skip?: number;
  limit?: number;
}

export const expeditionsApi = {
  async list(filters: ExpeditionFilters = {}): Promise<PaginatedResponse<Expedition>> {
    const params = new URLSearchParams();
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.minPrice) params.append('min_price', filters.minPrice.toString());
    if (filters.maxPrice) params.append('max_price', filters.maxPrice.toString());
    if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters.region) params.append('region', filters.region);
    if (filters.status) params.append('status', filters.status);
    if (filters.skip) params.append('skip', filters.skip.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    
    const query = params.toString();
    return api.get<PaginatedResponse<Expedition>>(`/expeditions${query ? `?${query}` : ''}`);
  },
  
  async getFeatured(limit = 4): Promise<Expedition[]> {
    return api.get<Expedition[]>(`/expeditions/featured?limit=${limit}`);
  },
  
  async getBySlug(slug: string): Promise<Expedition> {
    return api.get<Expedition>(`/expeditions/${slug}`);
  },
};

// ============================================
// Guide API
// ============================================

export const guidesApi = {
  async list(skip = 0, limit = 100): Promise<PaginatedResponse<Guide>> {
    return api.get<PaginatedResponse<Guide>>(`/guides?skip=${skip}&limit=${limit}`);
  },
  
  async getById(id: number): Promise<Guide> {
    return api.get<Guide>(`/guides/${id}`);
  },
};

// ============================================
// Lead API (Form Submissions)
// ============================================

export interface LeadData {
  name: string;
  email?: string;
  whatsapp: string;
  trek_slug: string;
  trek_name?: string;
  source?: string;
  notes?: string;
}

export interface LeadResponse {
  id: number;
  name: string;
  email: string;
  whatsapp: string;
  trek_slug: string;
  trek_name?: string;
  source: string;
  status: string;
  itinerary_sent: boolean;
  created_at: string;
}

export const leadsApi = {
  async create(data: LeadData): Promise<LeadResponse> {
    return api.post<LeadResponse>('/leads', data);
  },
};

// ============================================
// Marketing tools API (quiz, calculator, student discount, city pages)
// ============================================

export const marketingApi = {
  async getSettings(): Promise<MarketingSettings> {
    return api.get<MarketingSettings>('/marketing/settings');
  },

  async getTreks(scope: 'all' | 'quiz' = 'all'): Promise<MarketingTrek[]> {
    return api.get<MarketingTrek[]>(`/marketing/treks?scope=${scope}`);
  },
};

export const citiesApi = {
  async list(): Promise<DepartureCitySummary[]> {
    return api.get<DepartureCitySummary[]>('/departure-cities');
  },

  async getBySlug(slug: string): Promise<DepartureCity> {
    return api.get<DepartureCity>(`/departure-cities/${encodeURIComponent(slug)}`);
  },
};

// ============================================
// Contact API
// ============================================

export interface ContactData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  trek_interest?: string;
  message: string;
  newsletter_subscribe?: boolean;
}

export interface ContactResponse {
  id: number;
  name: string;
  email: string;
  subject: string;
  status: string;
  created_at: string;
}

export const contactsApi = {
  async submit(data: ContactData): Promise<ContactResponse> {
    return api.post<ContactResponse>('/contacts', data);
  },
};

// ============================================
// Booking API
// ============================================

export interface BookingData {
  trek_id: number;
  name: string;
  email: string;
  phone: string;
  group_size: number;
  preferred_date: string;
  special_requirements?: string;
}

export interface BookingResponse {
  id: number;
  trek_id: number;
  name: string;
  email: string;
  phone: string;
  group_size: number;
  preferred_date: string;
  status: string;
  created_at: string;
}

export const bookingsApi = {
  async create(data: BookingData): Promise<BookingResponse> {
    return api.post<BookingResponse>('/bookings', data);
  },
  
  async getById(id: number): Promise<BookingResponse> {
    return api.get<BookingResponse>(`/bookings/${id}`);
  },
};

// ============================================
// Testimonial API
// ============================================

export const testimonialsApi = {
  async list(skip = 0, limit = 20, featured?: boolean): Promise<PaginatedResponse<Testimonial>> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (featured !== undefined) params.append('featured', featured.toString());
    
    return api.get<PaginatedResponse<Testimonial>>(`/testimonials?${params}`);
  },
  
  async getFeatured(limit = 6): Promise<Testimonial[]> {
    return api.get<Testimonial[]>(`/testimonials/featured?limit=${limit}`);
  },
  
  async getByTrek(trekName: string): Promise<Testimonial[]> {
    return api.get<Testimonial[]>(`/testimonials/trek/${encodeURIComponent(trekName)}`);
  },
  
  async markHelpful(id: number): Promise<Testimonial> {
    return api.post<Testimonial>(`/testimonials/${id}/helpful`, {});
  },
};

// ============================================
// Office API
// ============================================

export const officesApi = {
  async list(): Promise<Office[]> {
    return api.get<Office[]>('/offices');
  },
  
  async getByCity(city: string): Promise<Office> {
    return api.get<Office>(`/offices/city/${encodeURIComponent(city)}`);
  },
};

// ============================================
// Blog API
// ============================================

export const blogApi = {
  async listPosts(
    skip = 0,
    limit = 10,
    category?: string,
    featured?: boolean,
    search?: string,
    status?: string,
  ): Promise<PaginatedResponse<BlogPost>> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());
    if (category) params.append('category', category);
    if (featured !== undefined) params.append('featured', featured.toString());
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    
    return api.get<PaginatedResponse<BlogPost>>(`/blog/posts?${params}`);
  },
  
  async getFeaturedPosts(limit = 4): Promise<BlogPost[]> {
    return api.get<BlogPost[]>(`/blog/posts/featured?limit=${limit}`);
  },
  
  async getRecentPosts(limit = 5): Promise<BlogPost[]> {
    return api.get<BlogPost[]>(`/blog/posts/recent?limit=${limit}`);
  },
  
  async getPostsByCategory(category: string, limit = 10): Promise<BlogPost[]> {
    return api.get<BlogPost[]>(`/blog/posts/category/${category}?limit=${limit}`);
  },
  
  async getPostBySlug(slug: string): Promise<BlogPost> {
    return api.get<BlogPost>(`/blog/posts/${slug}`);
  },
  
  async getRelatedPosts(slug: string, limit = 3): Promise<BlogPost[]> {
    return api.get<BlogPost[]>(`/blog/posts/${slug}/related?limit=${limit}`);
  },

  async getCategories(activeOnly = true): Promise<BlogCategory[]> {
    return api.get<BlogCategory[]>(`/blog/categories?active_only=${activeOnly}`);
  },

  async getTags(): Promise<BlogTag[]> {
    return api.get<BlogTag[]>(`/blog/tags`);
  },
};

// ============================================
// Site Settings API
// ============================================

export interface SiteSettingsApiResponse {
  id: number;
  company_name: string;
  tagline: string | null;
  description: string | null;
  url: string | null;
  email: string;
  phone: string;
  address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  website_widget_script: string | null;
}

export interface SiteConfig {
  name: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  phone: string;
  address: string;
  widgetScript: string;
}

export interface SocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
}

function siteSettingsToConfig(data: SiteSettingsApiResponse): {
  siteConfig: SiteConfig;
  socialLinks: SocialLinks;
} {
  return {
    siteConfig: {
      name: data.company_name,
      tagline: data.tagline || '',
      description: data.description || '',
      url: data.url || '',
      email: data.email,
      phone: data.phone,
      address: data.address || '',
      widgetScript: data.website_widget_script || '',
    },
    socialLinks: {
      facebook: data.facebook_url || '#',
      instagram: data.instagram_url || '#',
      twitter: data.twitter_url || '#',
      youtube: data.youtube_url || '#',
    },
  };
}

export async function getSiteSettings(): Promise<{
  siteConfig: SiteConfig;
  socialLinks: SocialLinks;
}> {
  try {
    const data = await api.get<SiteSettingsApiResponse>('/site-settings');
    return siteSettingsToConfig(data);
  } catch {
    const { SITE_CONFIG, SOCIAL_LINKS } = await import('./constants');
    return {
      siteConfig: SITE_CONFIG,
      socialLinks: SOCIAL_LINKS,
    };
  }
}

// ============================================
// Google Reviews API
// ============================================

export interface GoogleReviewItem {
  id: number;
  place_id: string;
  author_name: string;
  rating: number;
  text: string;
  review_time?: number;
  relative_time_description?: string;
  profile_photo_url?: string;
}

export interface GoogleReviewsResponse {
  reviews: GoogleReviewItem[];
  place_name: string;
  rating: number | null;
  user_ratings_total: number | null;
  last_synced_at: string | null;
}

export async function getGoogleReviews(): Promise<GoogleReviewsResponse> {
  return api.get<GoogleReviewsResponse>('/google-reviews');
}

// ============================================
// Health Check API
// ============================================

export const healthApi = {
  async check(): Promise<{ status: string; app: string; version: string }> {
    return api.get('/health');
  },
  
  async checkDb(): Promise<{
    status: string;
    app: string;
    version: string;
    database: string;
    database_type: string;
  }> {
    return api.get('/health/db');
  },
};

// ============================================
// Authentication API
// ============================================

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  role: 'user' | 'admin' | 'superadmin';
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserProfile;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
}

// Auth API with token management
class AuthApi {
  private token: string | null = null;
  
  setToken(token: string) {
    this.token = token;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }
  
  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof localStorage !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }
  
  clearToken() {
    this.token = null;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }
  
  private async authFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
    
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
      }
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `API Error: ${response.status}`);
    }
    
    return response.json();
  }
  
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || 'Login failed');
    }
    
    const data: LoginResponse = await response.json();
    this.setToken(data.access_token);
    return data;
  }
  
  async loginJson(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(error.detail || 'Login failed');
    }
    
    const data: LoginResponse = await response.json();
    this.setToken(data.access_token);
    return data;
  }
  
  async register(data: RegisterData): Promise<{ message: string; user: UserProfile }> {
    return this.authFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  logout() {
    this.clearToken();
  }
  
  async getCurrentUser(): Promise<UserProfile> {
    return this.authFetch('/auth/me');
  }
  
  async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    return this.authFetch('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async changePassword(data: PasswordChangeData): Promise<{ message: string }> {
    return this.authFetch('/auth/me/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
  
  async refreshToken(): Promise<{ access_token: string; token_type: string; expires_in: number }> {
    const result = await this.authFetch<{ access_token: string; token_type: string; expires_in: number }>('/auth/refresh', {
      method: 'POST',
    });
    this.setToken(result.access_token);
    return result;
  }
  
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
  
  // Admin methods
  async listUsers(skip = 0, limit = 20): Promise<PaginatedResponse<UserProfile>> {
    return this.authFetch(`/auth/users?skip=${skip}&limit=${limit}`);
  }
  
  async getUser(userId: number): Promise<UserProfile> {
    return this.authFetch(`/auth/users/${userId}`);
  }
  
  async updateUser(userId: number, data: Partial<UserProfile>): Promise<UserProfile> {
    return this.authFetch(`/auth/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
  
  async deactivateUser(userId: number): Promise<UserProfile> {
    return this.authFetch(`/auth/users/${userId}/deactivate`, { method: 'POST' });
  }
  
  async activateUser(userId: number): Promise<UserProfile> {
    return this.authFetch(`/auth/users/${userId}/activate`, { method: 'POST' });
  }
}

export const authApi = new AuthApi();

// Export the base api object for custom requests
export { api };

