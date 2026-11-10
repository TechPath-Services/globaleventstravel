import type { APIRoute } from 'astro';

import { renderRobotsTxt } from '@/lib/seo/robots';

export const GET: APIRoute = () => {
  const isIndexable = import.meta.env.PUBLIC_ROBOTS === 'index,follow';
  const content = renderRobotsTxt(isIndexable);

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
