import type { APIRoute } from 'astro';

import { loadSitemapEntries, renderSitemap } from '@/lib/sitemap';

export const prerender = false;

const FALLBACK_ORIGIN = 'https://globaleventstravels.com';

export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL(FALLBACK_ORIGIN)).origin;
  const entries = await loadSitemapEntries();
  const xml = renderSitemap(origin, entries);

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
