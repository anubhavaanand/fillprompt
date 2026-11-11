// Structured data (schema.org JSON-LD) helpers shared by the views.
import { href, type Lang } from '../i18n';
import { excerpt, type ImagePrompt, type TextPrompt, type VideoPrompt, type Source } from './data';

export const SITE = 'https://fillprompt.com';
/** The day the site was built: used where a source gives no date of its own. */
export const BUILD_DATE = new Date().toISOString().slice(0, 10);

/** Absolute URL of a root-relative path in the given language, without a trailing slash. */
export const url = (lang: Lang, path: string) => SITE + href(lang, path);

/** Shorten a title for the <title> tag, cutting at a word boundary. */
export const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, '') + '…' : s);

const CTX = 'https://schema.org';
const person = (name: string, link?: string) => (name ? { '@type': 'Person', name, url: link || undefined } : undefined);

export const itemList = (lang: Lang, paths: string[]) => ({
  '@context': CTX,
  '@type': 'ItemList',
  numberOfItems: paths.length,
  itemListElement: paths.map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: url(lang, p) })),
});

export const imagePromptSchema = (lang: Lang, p: ImagePrompt, src: Source) => ({
  '@context': CTX,
  '@type': 'CreativeWork',
  name: p.title,
  description: p.desc || excerpt(p.prompt, 200),
  genre: 'AI image prompt',
  keywords: `${p.model} prompt, AI image prompt`,
  url: url(lang, `/prompt/${p.slug}`),
  image: p.images.slice(0, 4),
  text: excerpt(p.prompt, 600),
  inLanguage: 'en',
  isAccessibleForFree: true,
  author: person(p.author, p.authorUrl),
  isBasedOn: p.sourceUrl || undefined,
  license: src.licenseUrl,
  datePublished: p.date || undefined,
});

export const textPromptSchema = (lang: Lang, x: TextPrompt, src: Source) => ({
  '@context': CTX,
  '@type': 'CreativeWork',
  name: x.title,
  description: x.desc || excerpt(x.prompt, 200),
  genre: 'AI text prompt',
  keywords: x.model === 'Any model' ? 'ChatGPT prompt, Claude prompt, Gemini prompt' : `${x.model} prompt, AI text prompt`,
  url: url(lang, `/text-prompt/${x.slug}`),
  text: excerpt(x.prompt, 600),
  inLanguage: 'en',
  isAccessibleForFree: true,
  author: person(x.author, x.authorUrl),
  isBasedOn: x.sourceUrl || undefined,
  license: src.licenseUrl,
});

export const videoPromptSchema = (lang: Lang, v: VideoPrompt, src: Source) => {
  const base = {
    '@context': CTX,
    name: v.title,
    description: v.desc || excerpt(v.prompt, 200),
    url: url(lang, `/video/${v.slug}`),
    inLanguage: 'en',
    isAccessibleForFree: true,
    author: person(v.author, v.authorUrl),
    isBasedOn: v.sourceUrl || undefined,
    license: src.licenseUrl,
  };
  // A playable clip with a poster qualifies as a VideoObject; otherwise describe the prompt itself.
  return v.video && v.poster
    ? { ...base, '@type': 'VideoObject', thumbnailUrl: [v.poster], contentUrl: v.video, uploadDate: `${v.date || BUILD_DATE}T00:00:00+00:00` }
    : { ...base, '@type': 'CreativeWork', genre: 'AI video prompt', image: v.poster || undefined, text: excerpt(v.prompt, 600), datePublished: v.date || undefined };
};

export const faqSchema = (items: [string, string][]) => ({
  '@context': CTX,
  '@type': 'FAQPage',
  mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
});
