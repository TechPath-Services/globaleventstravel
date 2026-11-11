/**
 * Permanent redirects for legacy WordPress URLs, trailing slashes, short trek
 * aliases, and thin Kedarkantha deal posts. Those posts still exist in the
 * database; the redirect map wins over the blog route, and the same slugs are
 * dropped from the sitemap, blog listings, and related-guide blocks.
 */

/**
 * Published deal posts that 301 to the Kedarkantha trek.
 * Code list on purpose: do not unpublish or delete the rows.
 */
export const REDIRECTED_BLOG_SLUGS = [
  'unbelievable-kedarkantha-trek-deals-you-cant-resist',
  'book-your-ultimate-winter-escape-kedarkantha-trek-discounts',
  'ready-for-adventure-kedarkantha-trek-packages-on-sale-now',
  'score-big-savings-on-kedarkantha-trek-gear-today',
  'last-minute-kedarkantha-booking-tips-tricks',
  'kedarkantha-trek-made-affordable-best-budget-options',
  'discover-hidden-discounts-on-kedarkantha-trek-tours',
  'exclusive-offers-on-guided-kedarkantha-expeditions',
  'secure-your-spot-highest-rated-kedarkantha-trek-packages',
  'book-kedarkantha-trek-now-and-receive-surprise-perks',
  'ultimate-kedarkantha-trek-bundle-deals-just-for-you',
  'kedarkantha-trekking-essentials-buy-now-save-big',
] as const;

const REDIRECTED_BLOG_SLUG_SET = new Set<string>(REDIRECTED_BLOG_SLUGS);

export const KEDARKANTHA_DEAL_REDIRECT_TARGET = '/treks/kedarkantha';

export function isRedirectedBlogSlug(slug: string | null | undefined): boolean {
  const key = (slug || '').trim().toLowerCase();
  return key.length > 0 && REDIRECTED_BLOG_SLUG_SET.has(key);
}

const KEDARKANTHA_DEAL_REDIRECTS: Record<string, string> = Object.fromEntries(
  REDIRECTED_BLOG_SLUGS.map((slug) => [`/blog/${slug}`, KEDARKANTHA_DEAL_REDIRECT_TARGET]),
);

/** Short or mistyped trek paths -> the published slug. */
export const TREK_ALIAS_REDIRECTS: Record<string, string> = {
  '/treks/kuari-pass': '/treks/kuari-pass-trek',
  '/treks/kuari-pass-trekt': '/treks/kuari-pass-trek',
  '/treks/sar-pass': '/treks/sar-pass-trek',
  '/treks/kedarkantha-trek': '/treks/kedarkantha',
};

/**
 * Exact paths (lowercase, no trailing slash).
 * Includes legacy WordPress URLs and thin deal posts that are still published.
 */
export const LEGACY_EXACT_REDIRECTS: Record<string, string> = {
  ...TREK_ALIAS_REDIRECTS,
  ...KEDARKANTHA_DEAL_REDIRECTS,
  '/guides': '/blog',
  '/wp-content/uploads/2024/10/kedarkantha-get.pdf': '/treks/kedarkantha',
  '/tag/kheerganga-lodging-tips':
    '/blog/unlock-the-ultimate-hiking-experience-with-these-kheerganga-lodging-tips',
  '/blog/best-budget-himalayan-treks-under-10000-in-2026':
    '/blog/budget-himalayan-treks-under-10000-2026',
  '/blog/13-best-summer-treks-in-india-for-2025-perfect-for-nature-lovers-thrill-seekers':
    '/blog/best-summer-treks-india-2025',
};

/** Published trek slugs the alias map must point at. Checked against sitemap entries in tests. */
export const TREK_ALIAS_TARGET_SLUGS = ['kuari-pass-trek', 'sar-pass-trek', 'kedarkantha'] as const;

const STATIC_ASSET = /\.(?:css|js|mjs|map|woff2?|ttf|eot|ico|png|jpe?g|gif|svg|webp|avif|xml|txt)$/i;

export function normalizeRedirectPath(pathname: string): string {
  let path = pathname || '/';
  try {
    path = decodeURIComponent(path);
  } catch {
    // Keep the raw path when it is not valid percent-encoding.
  }
  if (!path.startsWith('/')) path = `/${path}`;
  path = path.replace(/\/{2,}/g, '/');
  if (path.length > 1) path = path.replace(/\/+$/, '');
  return path || '/';
}

function withQuery(path: string, search: string): string {
  if (!search || search === '?') return path;
  return `${path}${search.startsWith('?') ? search : `?${search}`}`;
}

/**
 * Resolve a request path to a same-origin redirect target (path + query), or null.
 * Alias and legacy matches win over a plain trailing-slash strip so
 * `/treks/kuari-pass/` goes to `/treks/kuari-pass-trek` in one hop.
 */
export function resolveRedirect(pathname: string, search = ''): string | null {
  const raw = pathname || '/';
  if (raw.startsWith('/_') || raw.startsWith('/@')) return null;

  const normalized = normalizeRedirectPath(raw);
  const key = normalized.toLowerCase();

  if (STATIC_ASSET.test(key) && !key.startsWith('/wp-content/')) return null;

  let target: string | null = LEGACY_EXACT_REDIRECTS[key] ?? null;

  if (!target && (key === '/tag' || key.startsWith('/tag/'))) target = '/blog';
  if (!target && (key === '/author' || key.startsWith('/author/'))) target = '/blog';

  const hadTrailingSlash = raw.length > 1 && raw.endsWith('/');
  if (!target && hadTrailingSlash) target = normalized;

  if (!target) return null;
  if (raw === target) return null;

  return withQuery(target, search);
}

/** `/product/<slug>` -> `/treks/<slug>` only when that trek is published. */
export function productTrekRedirect(slug: string, trekExists: boolean): string | null {
  const clean = slug.trim().toLowerCase().replace(/^\/+|\/+$/g, '');
  if (!trekExists || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(clean)) return null;
  return `/treks/${clean}`;
}
