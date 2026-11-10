import { normalizeRedirectPath } from './redirects';

export type RobotsDirective = 'noindex,follow' | 'index,follow' | string;

export interface IndexDirective {
  /** Set only when this URL must not be indexed. Omitted for indexable URLs. */
  robots?: 'noindex,follow';
  canonicalPath: string;
}

const TREK_FACET_PARAMS = ['page', 'difficulty', 'season', 'max_price', 'location', 'sort', 'search', 'duration'];
const BLOG_FACET_PARAMS = ['category', 'page', 'search', 'tag', 'sort'];
const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'gclid',
  'fbclid',
  'gbraid',
  'wbraid',
  'mc_cid',
  'mc_eid',
  'ref',
]);

function hasAnyParam(params: URLSearchParams, keys: string[]): boolean {
  return keys.some((key) => params.has(key));
}

function hasNonTrackingParam(params: URLSearchParams): boolean {
  for (const key of params.keys()) {
    if (!TRACKING_PARAMS.has(key)) return true;
  }
  return false;
}

/**
 * Faceted, sorted, paginated, and internal-search URLs are crawlable but
 * not indexable. Canonical always points at the clean path with no query.
 * Tracking params alone do not flip a page to noindex.
 */
export function indexDirectiveForUrl(url: URL): IndexDirective {
  const path = normalizeRedirectPath(url.pathname);
  const params = url.searchParams;

  if (path === '/treks' && hasAnyParam(params, TREK_FACET_PARAMS)) {
    return { robots: 'noindex,follow', canonicalPath: '/treks' };
  }
  if (path === '/blog' && hasAnyParam(params, BLOG_FACET_PARAMS)) {
    return { robots: 'noindex,follow', canonicalPath: '/blog' };
  }
  if (path === '/tools/trek-budget-calculator' && hasNonTrackingParam(params)) {
    return { robots: 'noindex,follow', canonicalPath: '/tools/trek-budget-calculator' };
  }
  // WordPress-style site search. This site has no `?s=` handler.
  if (path === '/' && params.has('s')) {
    return { robots: 'noindex,follow', canonicalPath: '/' };
  }

  return { canonicalPath: path };
}

/** Staging `PUBLIC_ROBOTS=noindex,nofollow` stays in force. Production can noindex a single URL. */
export function resolveRobots(envRobots: string | undefined, pageRobots?: string | null): string {
  const env = (envRobots || 'index,follow').trim();
  if (env.toLowerCase().includes('noindex')) return env;
  return (pageRobots || env).trim();
}
