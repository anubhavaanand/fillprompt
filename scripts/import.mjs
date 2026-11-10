// Import prompt & skill data from open-source repos into src/data/*.json
// Usage: node scripts/import.mjs           (uses cached files in sources/)
//        node scripts/import.mjs --fetch   (re-downloads everything first)
import { readFile, writeFile, mkdir, readdir, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'sources');
const OUT = path.join(ROOT, 'src', 'data');
const RAW = 'https://raw.githubusercontent.com';
const FETCH = process.argv.includes('--fetch');

const FILES = {
  'promptschat.csv': `${RAW}/f/prompts.chat/main/prompts.csv`,
  'jau123.json': `${RAW}/jau123/nanobanana-trending-prompts/main/prompts/prompts.json`,
  'youmind.md': `${RAW}/YouMind-OpenLab/awesome-nano-banana-pro-prompts/main/README.md`,
  'zerolu.md': `${RAW}/ZeroLu/awesome-nanobanana-pro/main/README.md`,
};

export const SOURCES = {
  jau123: {
    name: 'NanoBanana Trending Prompts',
    by: 'MeiGen.ai',
    url: 'https://github.com/jau123/nanobanana-trending-prompts',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  },
  youmind: {
    name: 'Awesome Nano Banana Pro Prompts',
    by: 'YouMind OpenLab',
    url: 'https://github.com/YouMind-OpenLab/awesome-nano-banana-pro-prompts',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  },
  zerolu: {
    name: 'Awesome Nano Banana Pro',
    by: 'ZeroLu',
    url: 'https://github.com/ZeroLu/awesome-nanobanana-pro',
    license: 'MIT',
    licenseUrl: 'https://github.com/ZeroLu/awesome-nanobanana-pro/blob/main/LICENSE',
  },
  promptschat: {
    name: 'prompts.chat',
    by: 'Fatih Kadir Akın & contributors',
    url: 'https://github.com/f/prompts.chat',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  anthropic: {
    name: 'Anthropic Skills',
    by: 'Anthropic',
    url: 'https://github.com/anthropics/skills',
    license: 'Per-skill license',
    licenseUrl: 'https://github.com/anthropics/skills',
  },
};

// Unified category slugs for image prompts. Labels live in src/i18n.ts.
export const CATEGORIES = [
  'portrait-avatar',
  'photography',
  'product-brand',
  'food-drink',
  'poster',
  'social-media',
  'infographic-ui',
  'illustration-3d',
  'comic-anime',
  'creative',
];

const CAT_RULES = [
  [/profile|avatar|portrait|selfie|headshot/i, 'portrait-avatar'],
  [/food|drink/i, 'food-drink'],
  [/product|brand|e-?commerce|fashion/i, 'product-brand'],
  [/poster|flyer/i, 'poster'],
  [/social|youtube|thumbnail/i, 'social-media'],
  [/infographic|ui|app|web|diagram|education|knowledge|workplace|productivity|typography/i, 'infographic-ui'],
  [/comic|storyboard|anime|manga/i, 'comic-anime'],
  [/photo|cinematic|realis/i, 'photography'],
  [/illustration|3d|game|render|interior|design|character/i, 'illustration-3d'],
];
const catFor = (label) => (CAT_RULES.find(([re]) => re.test(label)) || [null, 'creative'])[1];

// Keep the site family-friendly.
// Deliberately strict: a few harmless prompts are dropped as false positives.
const BLOCK = new RegExp(
  '\\b(' +
    [
      'lingerie|bikini|nude|naked|sexy|seductive|cleavage|underwear|bra|braless|bralette|erotic|sensual|nsfw|busty',
      "thong|camisole|victoria'?s secret|jailbreak|uncensored|porn\\w*|fetish|midriff|navel|sultry|alluring",
      'skin-?tight|crop top|plunging|backless|bodysuit|bodycon|swimsuit|swimwear|mini ?skirt|short shorts|thighs?',
      'curvy|hourglass|boudoir|low-cut|deep neckline|d[eé]collet\\w*|provocative|shirtless|topless|stockings|corset',
      'bust|hips|booty|flirt\\w*|temptress|pin-?up|see-through|sheer|tank top|tight (dress|top)',
      'bare (shoulders?|skin|legs|back|chest)|wet (hair|skin|shirt|look)',
    ].join('|') +
    ')\\b',
  'i',
);

const exists = (p) => access(p).then(() => true, () => false);

async function fetchSources() {
  await mkdir(SRC, { recursive: true });
  for (const [file, url] of Object.entries(FILES)) {
    const dest = path.join(SRC, file);
    if (!FETCH && (await exists(dest))) continue;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
    await writeFile(dest, Buffer.from(await res.arrayBuffer()));
    console.log('downloaded', file);
  }
  const skills = path.join(SRC, 'anthropics-skills');
  if (!(await exists(skills))) {
    execFileSync('git', ['clone', '--depth', '1', '-q', 'https://github.com/anthropics/skills.git', skills]);
  } else if (FETCH) {
    execFileSync('git', ['-C', skills, 'pull', '-q', '--depth', '1']);
  }
}

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '');

function titleFromPrompt(prompt, fallback) {
  const line = prompt
    .split('\n')
    .map((l) => l.trim())
    .find((l) => /[a-zA-Z]{4}/.test(l) && !/^[{[\]}"]/.test(l));
  if (!line) return fallback;
  let t = line.replace(/^[#>*\-\s]+/, '').replace(/[*_`]/g, '');
  const stop = t.search(/[.!?:;](\s|$)/);
  if (stop > 20) t = t.slice(0, stop);
  if (t.length > 72) t = t.slice(0, 72).replace(/\s+\S*$/, '') + '…';
  return t.length > 12 ? t : fallback;
}

const tweetId = (url) => (url && url.match(/status\/(\d+)/) || [])[1];

function importJau123(raw) {
  const label = { nanobanana: 'Nano Banana', gptimage: 'GPT Image' };
  return JSON.parse(raw).map((x) => ({
    id: `m${x.id}`,
    title: titleFromPrompt(x.prompt, `${x.categories[0] || 'Prompt'} #${x.rank}`),
    desc: '',
    prompt: x.prompt.trim(),
    images: x.images?.length ? x.images : [x.image].filter(Boolean),
    cats: [...new Set(x.categories.map(catFor))],
    model: label[x.model] || x.model,
    author: x.author_name || x.author,
    authorUrl: x.author ? `https://x.com/${x.author}` : '',
    sourceUrl: x.source_url,
    date: x.date || '',
    likes: x.likes || 0,
    source: 'jau123',
  }));
}

function importYoumind(md) {
  const parts = md.split(/^### No\. \d+: /m).slice(1);
  return parts.map((p) => {
    const heading = p.slice(0, p.indexOf('\n')).trim();
    const dash = heading.indexOf(' - ');
    const catLabel = dash > 0 ? heading.slice(0, dash) : '';
    const title = dash > 0 ? heading.slice(dash + 3) : heading;
    const desc = (p.match(/#### 📖 Description\s+([\s\S]*?)\n#### /) || [])[1]?.trim() || '';
    let prompt = (p.match(/#### 📝 Prompt\s+```[^\n]*\n([\s\S]*?)\n```\s*\n+#### /) || [])[1] || '';
    const images = [...p.matchAll(/<img src="([^"]+)"/g)].map((m) => m[1]);
    const author = p.match(/\*\*Author:\*\* \[([^\]]+)\]\(([^)]+)\)/);
    const sourceUrl = (p.match(/\*\*Source:\*\* \[[^\]]+\]\(([^)]+)\)/) || [])[1] || '';
    const published = (p.match(/\*\*Published:\*\* (.+)/) || [])[1] || '';
    const d = published ? new Date(published + ' UTC') : null;
    return {
      id: `y${tweetId(sourceUrl) || slugify(title)}`,
      title,
      desc,
      prompt: prompt.trim(),
      images,
      cats: [catFor(catLabel || title)],
      model: 'Nano Banana Pro',
      author: author?.[1] || '',
      authorUrl: author?.[2] || '',
      sourceUrl,
      date: d && !isNaN(d) ? d.toISOString().slice(0, 10) : '',
      likes: 0,
      source: 'youmind',
    };
  });
}

function importZerolu(md) {
  const out = [];
  const sections = md.split(/^## (?=\d+\. )/m).slice(1);
  for (const sec of sections) {
    const secTitle = sec.slice(0, sec.indexOf('\n')).replace(/^\d+\.\s*/, '').trim();
    const items = sec.split(/^### \d+\.\d+\.? /m).slice(1);
    for (const p of items) {
      const title = p.slice(0, p.indexOf('\n')).trim();
      const desc = (p.match(/^\*([^*\n][^\n]*?)\*\s*$/m) || [])[1] || '';
      const prompt = (p.match(/```[^\n]*\n([\s\S]*?)\n```/) || [])[1] || '';
      const images = [...p.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]);
      const src = p.match(/\*Source: \[([^\]]+)\]\(([^)]+)\)/);
      const handle = src?.[1]?.startsWith('@') ? src[1].slice(1) : '';
      out.push({
        id: `z${tweetId(src?.[2]) || slugify(title)}`,
        title,
        desc: /^Source:/.test(desc) ? '' : desc,
        prompt: prompt.trim(),
        images,
        cats: [catFor(secTitle)],
        model: 'Nano Banana Pro',
        author: handle ? `@${handle}` : src?.[1] || '',
        authorUrl: handle ? `https://x.com/${handle}` : '',
        sourceUrl: src?.[2] || '',
        date: '',
        likes: 0,
        source: 'zerolu',
      });
    }
  }
  return out;
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else q = false;
      } else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const head = rows.shift();
  return rows.filter((r) => r.length === head.length).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i]])));
}

function importPromptsChat(csv) {
  return parseCsv(csv).map((r) => ({
    title: r.act.trim(),
    prompt: r.prompt.trim(),
    type: (r.type || 'TEXT').toLowerCase(),
    forDevs: r.for_devs === 'TRUE',
    contributor: r.contributor.trim(),
  }));
}

async function importSkills() {
  const dir = path.join(SRC, 'anthropics-skills', 'skills');
  const out = [];
  for (const name of (await readdir(dir)).sort()) {
    const file = path.join(dir, name, 'SKILL.md');
    if (!(await exists(file))) continue;
    const md = (await readFile(file, 'utf8')).replace(/\r\n/g, '\n');
    const fm = (md.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
    // description may be a plain scalar or a block scalar (> or |)
    const m = fm.match(/^description:\s*(?:[>|][-+]?\s*\n((?:[ \t]+.*\n?)+)|(.*))$/m);
    const description = (m?.[1] || m?.[2] || '').replace(/\s+/g, ' ').replace(/^["']|["']$/g, '').trim();
    const licFile = path.join(dir, name, 'LICENSE.txt');
    const lic = (await exists(licFile)) ? await readFile(licFile, 'utf8') : '';
    // 'apache' | 'proprietary' | 'none' — labels live in src/i18n.ts
    const license = /Apache License/i.test(lic) ? 'apache' : lic ? 'proprietary' : 'none';
    out.push({
      name,
      description,
      license,
      
      url: `https://github.com/anthropics/skills/tree/main/skills/${name}`,
    });
  }
  return out;
}

function finalize(list, makeSlug) {
  const seen = new Set();
  return list.map((x) => {
    let slug = makeSlug(x), n = 2;
    const base = slug;
    while (seen.has(slug)) slug = `${base}-${n++}`;
    seen.add(slug);
    return { slug, ...x };
  });
}

await fetchSources();
await mkdir(OUT, { recursive: true });
const read = (f) => readFile(path.join(SRC, f), 'utf8');

// Curated collections first so they win de-duplication; then trending by likes.
let images = [
  ...importYoumind(await read('youmind.md')),
  ...importZerolu(await read('zerolu.md')),
  ...importJau123(await read('jau123.json')).sort((a, b) => b.likes - a.likes),
];
const counts = { raw: images.length };
const seenKey = new Set();
images = images.filter((x) => {
  if (!x.prompt || x.prompt.length < 20 || !x.images.length) return false;
  if (BLOCK.test(x.prompt) || BLOCK.test(x.title)) return false;
  const key = tweetId(x.sourceUrl) || x.id;
  if (seenKey.has(key)) return false;
  seenKey.add(key);
  return true;
});
images = finalize(images, (x) => `${slugify(x.title) || 'prompt'}-${x.id.slice(-6)}`).map(({ id, ...x }) => x);

let texts = importPromptsChat(await read('promptschat.csv')).filter(
  (x) => x.title && x.prompt.length >= 20 && !BLOCK.test(x.title) && !BLOCK.test(x.prompt.slice(0, 3000)),
);
texts = finalize(texts, (x) => slugify(x.title) || 'prompt');

const skills = await importSkills();

await writeFile(path.join(OUT, 'image-prompts.json'), JSON.stringify(images));
await writeFile(path.join(OUT, 'text-prompts.json'), JSON.stringify(texts));
await writeFile(path.join(OUT, 'skills.json'), JSON.stringify(skills, null, 2));
await writeFile(path.join(OUT, 'meta.json'), JSON.stringify({ sources: SOURCES, categories: CATEGORIES }, null, 2));

const by = (k) => images.reduce((a, x) => ((a[x[k]] = (a[x[k]] || 0) + 1), a), {});
console.log(`image prompts: ${images.length} of ${counts.raw} raw`, by('source'));
console.log('categories:', images.reduce((a, x) => (x.cats.forEach((c) => (a[c] = (a[c] || 0) + 1)), a), {}));
console.log(`text prompts: ${texts.length}`);
console.log(`skills: ${skills.length}`, skills.map((s) => `${s.name}=${s.license}`).join(', '));
