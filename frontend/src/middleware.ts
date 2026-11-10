import { defineMiddleware } from 'astro:middleware';

import { resolveRedirect } from '@/lib/seo/redirects';

export const onRequest = defineMiddleware(async (context, next) => {
  const method = context.request.method.toUpperCase();
  if (method !== 'GET' && method !== 'HEAD') return next();

  const url = new URL(context.request.url);
  const target = resolveRedirect(url.pathname, url.search);
  if (!target) return next();

  const location = new URL(target, url.origin);
  return new Response(null, {
    status: 301,
    headers: {
      Location: location.href,
      'Cache-Control': 'public, max-age=86400',
    },
  });
});
