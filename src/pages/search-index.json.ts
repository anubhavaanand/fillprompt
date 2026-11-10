import { images, texts, excerpt } from '../lib/data';

// Compact search index consumed by the search page in both languages.
// Image rows: [title, slug, category slug, image url, prompt excerpt]
export function GET() {
  const body = {
    i: images.map((p) => [p.title, p.slug, p.cats[0], p.images[0], excerpt(p.prompt, 160)]),
    t: texts.map((t) => [t.title, t.slug]),
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
}
