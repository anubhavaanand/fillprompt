import { SITEMAPS, urlset } from '../../lib/sitemap';

export const getStaticPaths = () => Object.keys(SITEMAPS).map((name) => ({ params: { name } }));

export function GET({ params }: { params: { name: string } }) {
  return new Response(urlset(SITEMAPS[params.name]()), { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
