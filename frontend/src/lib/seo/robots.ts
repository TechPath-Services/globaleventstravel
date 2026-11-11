const SITEMAP_URL = 'https://globaleventstravels.com/sitemap.xml';

/** Production allows crawling, including faceted URLs, so Google can see their noindex. */
export function renderRobotsTxt(isIndexable: boolean, sitemapUrl = SITEMAP_URL): string {
  if (!isIndexable) {
    return `User-agent: *
Disallow: /

Sitemap: ${sitemapUrl}
`;
  }
  return `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;
}
