import type { APIRoute } from 'astro';

export const prerender = false;

/** Older builds advertised /sitemap-index.xml. Send crawlers to the live sitemap. */
export const GET: APIRoute = ({ url }) => {
  return Response.redirect(new URL('/sitemap.xml', url.origin), 301);
};
