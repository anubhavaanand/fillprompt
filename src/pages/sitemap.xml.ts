import { SITEMAPS } from '../lib/sitemap';
import { SITE } from '../lib/seo';

// Sitemap index: one child sitemap per kind of page (see src/lib/sitemap.ts).
export function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(SITEMAPS)
    .map((name) => `<sitemap><loc>${SITE}/sitemaps/${name}.xml</loc></sitemap>`)
    .join('\n')}\n</sitemapindex>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
