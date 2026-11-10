import { describe, expect, it } from 'vitest';

import {
  buildSitemapEntries,
  collectPages,
  isPublicSitemapPath,
  lastmodOf,
  renderSitemap,
  type SitemapSource,
} from './sitemap';

const source: SitemapSource = {
  treks: [{ slug: 'kedarkantha', updated_at: '2026-03-02T10:00:00Z' }],
  expeditions: [{ slug: 'black-peak', updated_at: '2025-12-15T00:00:00Z' }],
  posts: [{ slug: 'winter-packing-list', updatedAt: '2026-04-01T18:30:00Z' }],
  cities: [{ slug: 'delhi', updated_at: '2026-02-01T00:00:00Z' }],
  quizTreks: [{ slug: 'kedarkantha' }],
};

describe('sitemap', () => {
  const entries = buildSitemapEntries(source);
  const paths = entries.map((entry) => entry.path);
  const xml = renderSitemap('https://globaleventstravels.com', entries);

  it('includes static pages and published detail URLs', () => {
    expect(paths).toEqual(
      expect.arrayContaining([
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
        '/treks/kedarkantha',
        '/expeditions/black-peak',
        '/blog/winter-packing-list',
        '/treks-from/delhi',
        '/tools/winter-trek-quiz/result/kedarkantha',
      ]),
    );
  });

  it('adds lastmod only when the source has a date', () => {
    expect(entries.find((entry) => entry.path === '/treks/kedarkantha')?.lastmod).toBe('2026-03-02');
    expect(entries.find((entry) => entry.path === '/blog/winter-packing-list')?.lastmod).toBe(
      '2026-04-01',
    );
    expect(entries.find((entry) => entry.path === '/expeditions/black-peak')?.lastmod).toBe(
      '2025-12-15',
    );
    expect(
      entries.find((entry) => entry.path === '/tools/winter-trek-quiz/result/kedarkantha')?.lastmod,
    ).toBe('2026-03-02');
    expect(entries.find((entry) => entry.path === '/treks')?.lastmod).toBeUndefined();
  });

  it('excludes admin, API, embeds, and paginated URLs', () => {
    expect(isPublicSitemapPath('/admin')).toBe(false);
    expect(isPublicSitemapPath('/admin/dashboard')).toBe(false);
    expect(isPublicSitemapPath('/api/v1/treks')).toBe(false);
    expect(isPublicSitemapPath('/tools/trek-budget-calculator/embed')).toBe(false);
    expect(isPublicSitemapPath('/blog?page=2')).toBe(false);
    expect(isPublicSitemapPath('/treks?page=99&difficulty=easy')).toBe(false);
    expect(isPublicSitemapPath('/blog/page/3')).toBe(false);

    const filtered = renderSitemap('https://globaleventstravels.com', [
      { path: '/admin' },
      { path: '/api/v1/treks' },
      { path: '/tools/trek-budget-calculator/embed' },
      { path: '/blog?page=2' },
      { path: '/about' },
    ]);
    expect(filtered).not.toContain('/admin');
    expect(filtered).not.toContain('/api/');
    expect(filtered).not.toContain('embed');
    expect(filtered).not.toContain('page=');
    expect(filtered).toContain('https://globaleventstravels.com/about');
  });

  it('renders a urlset and escapes locations', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain('<loc>https://globaleventstravels.com/treks/kedarkantha</loc>');
    expect(xml).toContain('<lastmod>2026-03-02</lastmod>');

    const escaped = renderSitemap('https://globaleventstravels.com', [
      { path: '/treks/a&b' },
    ]);
    expect(escaped).toContain('https://globaleventstravels.com/treks/a&amp;b');
  });

  it('reads a date-only lastmod', () => {
    expect(lastmodOf({ publishDate: '2024-11-02' })).toBe('2024-11-02');
    expect(lastmodOf({})).toBeUndefined();
  });

  it('walks every API page instead of stopping at the first 100', async () => {
    const all = Array.from({ length: 250 }, (_, index) => ({ slug: `trek-${index}` }));
    const loaded = await collectPages(async (skip, limit) => ({
      items: all.slice(skip, skip + limit),
      total: all.length,
    }));
    expect(loaded).toHaveLength(250);
    expect(loaded[249]).toEqual({ slug: 'trek-249' });
  });
});
