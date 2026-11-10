import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';

// output: 'server' means every page is rendered on request. @astrojs/sitemap only
// writes a static file at build time (and never /sitemap.xml), so the live sitemap
// is the src/pages/sitemap.xml.ts endpoint instead.
export default defineConfig({
  site: 'https://globaleventstravels.com',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
  ],
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  vite: {
    define: {
      __API_BASE_URL__: JSON.stringify(
        process.env.PUBLIC_API_BASE_URL || 'http://localhost:8000'
      ),
    },
  },
});

