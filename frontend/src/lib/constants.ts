// ============================================
// Global Events Travels - Constants
// ============================================

export const WHATSAPP = {
  number: '919600036667',
  prefilledMessage: "Hi, I'm interested in trekking. Can you send me itinerary options?",
};

export const SITE_CONFIG = {
  name: 'Global Events Travels',
  tagline: 'Adventure Awaits in the Himalayas',
  description: 'Discover amazing treks and expeditions in the Himalayas with experienced guides and unforgettable experiences.',
  url: 'https://globaleventstravels.com',
  email: 'info@globaleventstravels.com',
  phone: '+91 96000 36667',
  address: 'Manali, Himachal Pradesh, India',
  widgetScript: '',
};

export const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Treks', href: '/treks' },
  { name: 'Expeditions', href: '/expeditions' },
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/TheTrekkingCommunity',
  instagram: 'https://www.instagram.com/global_events_travels',
  twitter: '#',
  youtube: 'https://www.youtube.com/@globaleventstravels6010',
};

export const DIFFICULTY_LABELS: Record<string, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'badge-easy' },
  moderate: { label: 'Moderate', color: 'badge-moderate' },
  difficult: { label: 'Difficult', color: 'badge-hard' },
  challenging: { label: 'Challenging', color: 'badge-expert' },
  extreme: { label: 'Extreme', color: 'badge-extreme' },
};

export const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000';

export const PAGINATION = {
  defaultLimit: 10,
  maxLimit: 100,
};

// Trek options for lead capture form
export const TREK_OPTIONS = [
  { value: '', label: 'Select a Trek' },
  { value: 'hampta-pass', label: 'Hampta Pass Trek' },
  { value: 'kedarkantha', label: 'Kedarkantha Trek' },
  { value: 'valley-of-flowers', label: 'Valley of Flowers' },
  { value: 'roopkund', label: 'Roopkund Trek' },
  { value: 'sar-pass', label: 'Sar Pass Trek' },
  { value: 'brahmatal', label: 'Brahmatal Trek' },
  { value: 'chadar', label: 'Chadar Trek' },
  { value: 'goechala', label: 'Goechala Trek' },
  { value: 'custom', label: 'Custom Trek / Not Sure' },
];

// Form configuration (API /content/home/lead_form overrides these)
export const LEAD_FORM_CONFIG = {
  whatsappCountryCode: '+91',
  successMessage: 'Your personalized trek itinerary will be sent to your WhatsApp shortly.',
  privacyText: 'Your data is 100% safe. We never share your information.',
  ctaText: 'Get Free Itinerary on WhatsApp',
  formTitle: 'Get Your Free Trek Guide',
  formSubtitle: 'Personalized itinerary sent to WhatsApp',
};

// Trek regions for Explore by Region section
export const TREK_REGIONS = [
  { name: 'Uttarakhand', slug: 'Uttarakhand', image: '/images/destinations/uttarakhand.jpg' },
  { name: 'Himachal Pradesh', slug: 'Himachal', image: '/images/destinations/himachal.jpg' },
  { name: 'Kashmir', slug: 'Kashmir', image: '/images/destinations/srinagar.jpg' },
  { name: 'Sikkim', slug: 'Sikkim', image: '/images/destinations/himachal.jpg' },
] as const;

// Hero section content (API /content/home/hero* overrides these)
export const HERO_CONTENT = {
  badge: 'Now booking for 2026 season',
  headline: 'Plan Your Perfect Himalayan Trek',
  subheadline:
    'Book trusted treks across the Himalayas with expert guides, personalized itineraries and unforgettable experiences.',
  highlightWord: 'Himalayan',
  stats: [
    { value: '10,000+', label: 'Happy Trekkers', icon: 'users' },
    { value: '4.8★', label: 'Average Rating', icon: 'star' },
    { value: '100+', label: 'Trek Destinations', icon: 'mountain' },
  ],
};

