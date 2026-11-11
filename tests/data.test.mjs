// Sanity checks on the imported data in src/data and the redirects in vercel.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (f) => JSON.parse(readFileSync(f, 'utf8'));
const images = read('src/data/image-prompts.json');
const videos = read('src/data/video-prompts.json');
const texts = read('src/data/text-prompts.json');
const meta = read('src/data/meta.json');
// A few live slugs contain "--"; they are allowed so their URLs keep working.
const SLUG = /^[a-z0-9]+(-+[a-z0-9]+)*$/;

for (const [name, list] of [['image', images], ['video', videos], ['text', texts]]) {
  test(`${name} prompts: slugs are unique and well formed`, () => {
    assert.ok(list.length > 0);
    const seen = new Set();
    for (const x of list) {
      assert.match(x.slug, SLUG, x.slug);
      assert.ok(!seen.has(x.slug), `duplicate slug ${x.slug}`);
      seen.add(x.slug);
    }
  });

  test(`${name} prompts: every prompt has a title, text and known source`, () => {
    for (const x of list) {
      assert.ok(x.title?.trim(), `${x.slug} has a title`);
      assert.ok(x.prompt?.trim(), `${x.slug} has prompt text`);
      assert.ok(!/\{argument name=/.test(x.title), `${x.slug} title has no raw template slot`);
      assert.ok(meta.sources[x.source], `${x.slug} source "${x.source}" is in meta.json`);
    }
  });
}

test('image prompts have at least one image and known categories', () => {
  const cats = new Set(meta.categories);
  for (const p of images) {
    assert.ok(p.images.length > 0, `${p.slug} has an image`);
    for (const c of p.cats) assert.ok(cats.has(c), `${p.slug} category ${c}`);
  }
});

test('prompt redirects point at prompts that exist', () => {
  const slugs = new Set(images.map((p) => p.slug));
  const { redirects } = read('vercel.json');
  for (const r of redirects.filter((r) => r.source.startsWith('/prompt/'))) {
    assert.ok(slugs.has(r.destination.replace('/prompt/', '')), `${r.source} -> ${r.destination}`);
    assert.ok(!slugs.has(r.source.replace('/prompt/', '')), `${r.source} still exists, so the redirect would hide it`);
  }
});
