export interface HeroImageAttrs {
  src: string;
  srcset?: string;
  sizes: string;
  width: number;
  height: number;
  loading: 'eager';
  fetchpriority: 'high';
  decoding: 'async';
  /** Set when every candidate is WebP, so the preload hint can name the type. */
  type?: 'image/webp';
}

const HOME_HERO = '/images/home/hero-bg.webp';

/** Pre-generated WebP widths of the local home hero. The 3000px original is not used. */
const HOME_HERO_VARIANTS: ReadonlyArray<readonly [string, number]> = [
  ['/images/home/hero-bg-640.webp', 640],
  ['/images/home/hero-bg-960.webp', 960],
  ['/images/home/hero-bg-1280.webp', 1280],
  ['/images/home/hero-bg-1920.webp', 1920],
];

const UNSPLASH_WIDTHS = [640, 960, 1280, 1920];

function unsplashUrl(src: string, width: number): string | null {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return null;
  }
  if (url.hostname !== 'images.unsplash.com') return null;
  url.searchParams.set('w', String(width));
  url.searchParams.set('fm', 'webp');
  url.searchParams.set('q', '70');
  url.searchParams.set('auto', 'format');
  url.searchParams.set('fit', 'crop');
  return url.href;
}

/**
 * Hero image attributes for the LCP element.
 * Local home hero and Unsplash URLs get a WebP srcset. Other remote URLs
 * (signed Azure blobs) are served as stored: there is no resize pipeline.
 */
export function heroImageAttrs(
  src: string,
  size: { width: number; height: number },
): HeroImageAttrs {
  const path = src.split('?')[0];
  const base: HeroImageAttrs = {
    src,
    sizes: '100vw',
    width: size.width,
    height: size.height,
    loading: 'eager',
    fetchpriority: 'high',
    decoding: 'async',
  };

  if (path === HOME_HERO) {
    return {
      ...base,
      src: '/images/home/hero-bg-1280.webp',
      srcset: HOME_HERO_VARIANTS.map(([href, width]) => `${href} ${width}w`).join(', '),
      width: 1920,
      height: 1260,
      type: 'image/webp',
    };
  }

  const mid = unsplashUrl(src, 960);
  if (!mid) return base;
  const srcset = UNSPLASH_WIDTHS.map((width) => {
    const href = unsplashUrl(src, width);
    return href ? `${href} ${width}w` : '';
  })
    .filter(Boolean)
    .join(', ');

  return {
    ...base,
    src: mid,
    srcset,
    type: 'image/webp',
  };
}
