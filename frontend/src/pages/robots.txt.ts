import type { APIRoute } from 'astro';

const SITEMAP_URL = 'https://globaleventstravels.com/sitemap.xml';

export const GET: APIRoute = () => {
  const isIndexable = import.meta.env.PUBLIC_ROBOTS === 'index,follow';

  const content = isIndexable
    ? // Production: allow all crawlers
      `User-agent: *
Allow: /

Sitemap: ${SITEMAP_URL}
`
    : // Staging / local: block crawlers, but still advertise the production sitemap
      `User-agent: *
Disallow: /

Sitemap: ${SITEMAP_URL}
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
