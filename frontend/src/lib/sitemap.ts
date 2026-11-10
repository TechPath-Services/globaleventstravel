import { api } from '@/lib/api';
import type { PaginatedResponse } from '@/lib/types';

/** Indexable static routes. Listing page 1 only — never ?page= or filtered variants. */
export const STATIC_SITEMAP_PATHS = [
  '/',
  '/treks',
  '/expeditions',
  '/about',
  '/blog',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
  '/cancellation-refund',
  '/student-discount',
  '/tools',
  '/tools/winter-trek-quiz',
  '/tools/trek-budget-calculator',
  '/treks-from',
] as const;

const API_PAGE_SIZE = 100;

export interface SitemapEntry {
  path: string;
  lastmod?: string;
}

export interface SitemapRecord {
  slug?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
  publishDate?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
}

export interface SitemapSource {
  treks: SitemapRecord[];
  expeditions: SitemapRecord[];
  posts: SitemapRecord[];
  cities: SitemapRecord[];
  quizTreks: SitemapRecord[];
}

export function isPublicSitemapPath(path: string): boolean {
  if (!path.startsWith('/')) return false;
  if (path.includes('?') || path.includes('#')) return false;
  const normalized = path.length > 1 ? path.replace(/\/+$/, '') : path;
  if (normalized === '/admin' || normalized.startsWith('/admin/')) return false;
  if (normalized === '/api' || normalized.startsWith('/api/')) return false;
  if (normalized === '/embed' || normalized.endsWith('/embed') || normalized.includes('/embed/')) {
    return false;
  }
  if (/\/page\/\d+$/.test(normalized)) return false;
  return true;
}

export function lastmodOf(record: SitemapRecord): string | undefined {
  const raw =
    record.updated_at ||
    record.updatedAt ||
    record.publishedAt ||
    record.publishDate ||
    record.created_at ||
    record.createdAt;
  if (!raw) return undefined;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(raw);
    return match?.[1];
  }
  return date.toISOString().slice(0, 10);
}

function normalizePath(path: string): string {
  if (path === '/' || path === '') return '/';
  return path.replace(/\/+$/, '');
}

function detailPath(prefix: string, record: SitemapRecord): SitemapEntry | null {
  const slug = (record.slug || '').trim();
  if (!slug || slug.includes('/') || slug.includes('?')) return null;
  return {
    path: `${prefix}/${encodeURIComponent(slug)}`,
    lastmod: lastmodOf(record),
  };
}

export function buildSitemapEntries(source: SitemapSource): SitemapEntry[] {
  const byPath = new Map<string, SitemapEntry>();

  const add = (entry: SitemapEntry | null) => {
    if (!entry || !isPublicSitemapPath(entry.path)) return;
    const path = normalizePath(entry.path);
    const existing = byPath.get(path);
    if (!existing) {
      byPath.set(path, { path, lastmod: entry.lastmod });
      return;
    }
    if (!existing.lastmod && entry.lastmod) existing.lastmod = entry.lastmod;
  };

  for (const path of STATIC_SITEMAP_PATHS) add({ path });
  for (const trek of source.treks) add(detailPath('/treks', trek));
  for (const expedition of source.expeditions) add(detailPath('/expeditions', expedition));
  for (const post of source.posts) add(detailPath('/blog', post));
  for (const city of source.cities) add(detailPath('/treks-from', city));

  const trekLastmod = new Map(
    source.treks
      .filter((trek) => trek.slug)
      .map((trek) => [trek.slug as string, lastmodOf(trek)] as const),
  );
  for (const trek of source.quizTreks) {
    const slug = (trek.slug || '').trim();
    if (!slug) continue;
    add({
      path: `/tools/winter-trek-quiz/result/${encodeURIComponent(slug)}`,
      lastmod: lastmodOf(trek) || trekLastmod.get(slug),
    });
  }

  const staticPaths = new Set<string>(STATIC_SITEMAP_PATHS);
  const staticEntries = STATIC_SITEMAP_PATHS.map((path) => byPath.get(path)).filter(
    (entry): entry is SitemapEntry => Boolean(entry),
  );
  const dynamicEntries = [...byPath.values()]
    .filter((entry) => !staticPaths.has(entry.path))
    .sort((a, b) => a.path.localeCompare(b.path));
  return [...staticEntries, ...dynamicEntries];
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function renderSitemap(origin: string, entries: SitemapEntry[]): string {
  const base = origin.replace(/\/$/, '');
  const urls = entries
    .filter((entry) => isPublicSitemapPath(entry.path))
    .map((entry) => {
      const loc = escapeXml(`${base}${entry.path}`);
      const lastmod = entry.lastmod ? `\n    <lastmod>${escapeXml(entry.lastmod)}</lastmod>` : '';
      return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`;
    })
    .join('\n');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    `${urls}\n` +
    '</urlset>\n'
  );
}

export async function collectPages<T>(
  fetchPage: (skip: number, limit: number) => Promise<{ items?: T[]; total?: number }>,
  limit = API_PAGE_SIZE,
): Promise<T[]> {
  const items: T[] = [];
  let skip = 0;
  let total = Number.POSITIVE_INFINITY;

  while (items.length < total && skip < 10000) {
    const page = await fetchPage(skip, limit);
    const batch = page.items ?? [];
    total = typeof page.total === 'number' ? page.total : items.length + batch.length;
    items.push(...batch);
    if (batch.length === 0) break;
    skip += batch.length;
  }

  return items;
}

async function fetchPaginated<T>(path: string): Promise<T[]> {
  return collectPages(async (skip, limit) => {
    const separator = path.includes('?') ? '&' : '?';
    return api.get<PaginatedResponse<T>>(`${path}${separator}skip=${skip}&limit=${limit}`);
  });
}

async function safe<T>(label: string, load: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await load();
  } catch (error) {
    console.error(`Sitemap: failed to load ${label}`, error);
    return fallback;
  }
}

/** Live published URLs. New treks and posts appear on the next request (after cache). */
export async function loadSitemapEntries(): Promise<SitemapEntry[]> {
  const [treks, expeditions, posts, cities, quizTreks] = await Promise.all([
    safe('treks', () => fetchPaginated<SitemapRecord>('/treks?status=published'), []),
    safe('expeditions', () => fetchPaginated<SitemapRecord>('/expeditions?status=published'), []),
    safe('blog posts', () => fetchPaginated<SitemapRecord>('/blog/posts?status=published'), []),
    safe('departure cities', () => api.get<SitemapRecord[]>('/departure-cities'), []),
    safe('quiz treks', () => api.get<SitemapRecord[]>('/marketing/treks?scope=quiz'), []),
  ]);

  return buildSitemapEntries({ treks, expeditions, posts, cities, quizTreks });
}
