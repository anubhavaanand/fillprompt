import { images, texts, videos, catSlugs, catCounts, videoModels, textModels, TEXT_FILTERS, textFilterCounts } from '../lib/data';
import { IMAGE_PAGE, TEXT_PAGE, VIDEO_PAGE } from '../lib/paths';
import { LANGS } from '../i18n';
import { url, BUILD_DATE } from '../lib/seo';

// Every indexable page.
// The search page is left out on purpose.
const paged = (base: string, total: number, size: number) =>
  Array.from({ length: Math.max(1, Math.ceil(total / size)) }, (_, i) => (i ? `${base}/${i + 1}` : base));

export function GET() {
  const paths = [
    '/',
    ...paged('/images', images.length, IMAGE_PAGE),
    ...catSlugs.flatMap((c) => paged(`/category/${c}`, catCounts[c], IMAGE_PAGE)),
    ...paged('/videos', videos.length, VIDEO_PAGE),
    ...videoModels.flatMap((m) => paged(`/video-model/${m.slug}`, m.count, VIDEO_PAGE)),
    ...paged('/text', texts.length, TEXT_PAGE),
    ...textModels.flatMap((m) => paged(`/text-model/${m.slug}`, m.count, TEXT_PAGE)),
    ...TEXT_FILTERS.filter((f) => textFilterCounts[f]).flatMap((f) => paged(`/text-type/${f}`, textFilterCounts[f], TEXT_PAGE)),
    '/skills',
    '/credits',
    '/donate',
    ...images.map((p) => `/prompt/${p.slug}`),
    ...videos.map((v) => `/video/${v.slug}`),
    ...texts.map((t) => `/text-prompt/${t.slug}`),
  ];
  const urls = paths.flatMap((p) => {
    const alts =
      LANGS.length > 1
        ? LANGS.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${url(l, p)}"/>`).join('') +
          `<xhtml:link rel="alternate" hreflang="x-default" href="${url('en', p)}"/>`
        : '';
    return LANGS.map((l) => `<url><loc>${url(l, p)}</loc><lastmod>${BUILD_DATE}</lastmod>${alts}</url>`);
  });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
