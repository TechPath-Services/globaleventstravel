/**
 * Static background for the public /treks listing hero.
 *
 * Site Content can supply a bright image_url (the seeded value is the daylight
 * snow photo at /images/home/hero-bg.webp). That wash-out is why this hero
 * does not read image_url and always uses the asset below.
 *
 * Photo: Benjamin Voros — snowy peaks under a night sky, Unsplash License.
 * https://unsplash.com/photos/phIFdC6lA4E
 * https://images.unsplash.com/photo-1519681393784-d120267933ba
 */
export const TREKS_LISTING_HERO = {
  width: 1920,
  height: 1280,
  desktopAvif: '/images/heroes/treks-listing-1920.avif',
  desktopWebp: '/images/heroes/treks-listing-1920.webp',
  mobileAvif: '/images/heroes/treks-listing-800.avif',
  mobileWebp: '/images/heroes/treks-listing-800.webp',
} as const;
