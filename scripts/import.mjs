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
  'freestylefly.json': `${RAW}/freestylefly/awesome-gpt-image-2/main/data/cases.json`,
  'evolink.md': `${RAW}/Evolink-AI/awesome-gpt-image-2-API-Prompts/main/README.md`,
  'learnprompt-seedance.json': `${RAW}/LearnPrompt/awesome-seedance/main/data/cases.json`,
  'youmind-seedance.md': `${RAW}/YouMind-OpenLab/awesome-seedance-2-prompts/main/README.md`,
  'youmind-seedance-videos.json': `${RAW}/YouMind-OpenLab/awesome-seedance-2-prompts/main/video-urls.json`,
  'osw-seedance.json': `${RAW}/opensource-works/awesome-seedance-prompts/main/data/posts.json`,
  'osw-mirror.json': `${RAW}/opensource-works/awesome-seedance-prompts/main/data/mirror.json`,
  'youmind-grok.md': `${RAW}/YouMind-OpenLab/awesome-grok-imagine-prompts/main/README.md`,
  'youmind-grok-videos.json': `${RAW}/YouMind-OpenLab/awesome-grok-imagine-prompts/main/video-urls.json`,
};

// Community skill repositories shown on the Skills page as links. Name, description, license and
// stars are read from the GitHub API; a repository is listed only if its license is one of OPEN.
const COMMUNITY = {
  motion: [
    'greensock/gsap-skills',
    'Vincentwei1021/video-shotcraft',
    'oil-oil/oil-motion',
    'mromidev/claude-animated-shorts',
    'NiazMorshed2007/reanimate',
    'echris6/motion-video-kit',
    'haidrrrry/claude-remotion-skill',
    'howseen-ai/claude-motion-design',
    'rossark0/rossark-motion-skill',
    'lovisdotio/motion2code',
    'iart-ai/web-animation-skills',
    'EL4CTEO/blender-skills',
    'dexhunter/seedance2-skill',
    'jnMetaCode/ai-shortfilm-prompts',
    'Rylaispirit/cinematic-video-prompt-skill',
    'frankxai/awesome-motion-design-agent-skills',
  ],
  design: [
    'Nutlope/hallmark',
    'google-labs-code/stitch-skills',
    'plugin87/ux-ui-agent-skills',
    'oil-oil/oil-ui',
    'freshtechbro/claudedesignskills',
    'rohitg00/awesome-claude-design',
  ],
  more: [
    'sickn33/agentic-awesome-skills',
    'github/awesome-copilot',
    'VoltAgent/awesome-agent-skills',
    'coreyhaines31/marketingskills',
    'K-Dense-AI/scientific-agent-skills',
    'gamedev-skills/awesome-gamedev-agent-skills',
  ],
};
const OPEN = new Set(['MIT', 'Apache-2.0', 'CC0-1.0', 'CC-BY-4.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC']);

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
  freestylefly: {
    name: 'Awesome GPT Image 2',
    by: 'freestylefly',
    url: 'https://github.com/freestylefly/awesome-gpt-image-2',
    license: 'MIT',
    licenseUrl: 'https://github.com/freestylefly/awesome-gpt-image-2/blob/main/LICENSE',
  },
  evolink: {
    name: 'Awesome GPT Image 2 API & Prompts',
    by: 'EvoLink AI',
    url: 'https://github.com/Evolink-AI/awesome-gpt-image-2-API-Prompts',
    license: 'CC0 1.0',
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  learnprompt: {
    name: 'Awesome Seedance',
    by: 'LearnPrompt',
    url: 'https://github.com/LearnPrompt/awesome-seedance',
    license: 'MIT',
    licenseUrl: 'https://github.com/LearnPrompt/awesome-seedance/blob/main/LICENSE',
  },
  youmindseedance: {
    name: 'Awesome Seedance 2 Prompts',
    by: 'YouMind OpenLab',
    url: 'https://github.com/YouMind-OpenLab/awesome-seedance-2-prompts',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  },
  oswseedance: {
    name: 'Awesome Seedance Prompts',
    by: 'opensource-works',
    url: 'https://github.com/opensource-works/awesome-seedance-prompts',
    license: 'MIT',
    licenseUrl: 'https://github.com/opensource-works/awesome-seedance-prompts/blob/main/LICENSE',
  },
  youmindgrok: {
    name: 'Awesome Grok Imagine Prompts',
    by: 'YouMind OpenLab',
    url: 'https://github.com/YouMind-OpenLab/awesome-grok-imagine-prompts',
    license: 'CC BY 4.0',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
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

// The site is English and Malay: skip prompts written mostly in Chinese, Japanese or Korean.
const english = (s) => (s.match(/[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af]/g) || []).length / Math.max(1, s.length) < 0.05;
const xUrl = (handle) => (handle?.startsWith('@') ? `https://x.com/${handle.slice(1)}` : '');

function importFreestylefly(raw) {
  // Titles in this collection are Chinese, so the title is taken from the prompt's first line.
  return JSON.parse(raw)
    .cases.filter((c) => c.prompt && english(c.prompt))
    .map((c) => ({
      id: `f${tweetId(c.sourceUrl) || c.id}`,
      title: titleFromPrompt(c.prompt, `${c.category} #${c.id}`),
      desc: '',
      prompt: c.prompt.trim(),
      images: c.image ? [`${RAW}/freestylefly/awesome-gpt-image-2/main/data${c.image}`] : [],
      cats: [catFor(c.category)],
      model: 'GPT Image 2',
      author: c.sourceLabel || '',
      authorUrl: xUrl(c.sourceLabel),
      sourceUrl: c.sourceUrl || '',
      date: '',
      likes: 0,
      source: 'freestylefly',
    }));
}

function importEvolink(md) {
  // Cases sit under category anchors; a prompt may itself contain "## " lines, so split on case headings only.
  const out = [];
  const marks = [...md.matchAll(/^<a id="category-([a-z-]+)"><\/a>|^### Case \d+: (.*)$/gm)];
  let cat = '';
  marks.forEach((m, i) => {
    if (m[1]) return void (cat = m[1]);
    const body = md.slice(m.index, marks[i + 1]?.index ?? md.length);
    const head = m[2].match(/^\[(.+?)\]\((\S+?)\)(?: \(by \[([^\]]+)\]\(([^)]+)\)\))?/);
    if (!head) return;
    const prompt = (body.match(/\*\*Prompt:\*\*\s*\n+```[^\n]*\n([\s\S]*?)\n```/) || [])[1] || '';
    // Some cases reference images by a path inside the repo; make those absolute so they load from our pages.
    const images = [...body.matchAll(/<img src="([^"]+)"/g)]
      .map((x) => x[1])
      .filter((u) => !/shields\.io/.test(u))
      .map((u) => (/^https?:\/\//.test(u) ? u : `${RAW}/Evolink-AI/awesome-gpt-image-2-API-Prompts/main/${u.replace(/^\.?\//, '')}`));
    out.push({
      id: `e${tweetId(head[2]) || slugify(head[1])}`,
      title: head[1].trim(),
      desc: '',
      prompt: prompt.trim(),
      images: [...new Set(images)],
      cats: [catFor(`${cat} ${head[1]}`)],
      model: 'GPT Image 2',
      author: head[3] || '',
      authorUrl: head[4] || '',
      sourceUrl: head[2],
      date: '',
      likes: 0,
      source: 'evolink',
    });
  });
  return out.filter((x) => english(x.prompt) && english(x.title));
}

function importLearnPrompt(raw) {
  return JSON.parse(raw)
    .cases.filter((c) => c.mediaType === 'video' && c.titleEn && c.promptFull && english(c.promptFull))
    .map((c) => ({
      id: `l${tweetId(c.sourceUrl) || c.slug}`,
      title: c.titleEn.trim(),
      desc: (c.summaryEn || '').trim(),
      prompt: c.promptFull.trim(),
      poster: c.posterUrl || '',
      video: c.mediaUrl || '',
      model: c.models?.[0] || 'Seedance',
      author: c.creator || '',
      authorUrl: xUrl(c.creator),
      sourceUrl: c.sourceUrl || '',
      date: (c.sourcePublishedAt || '').slice(0, 10),
      likes: c.weightedInteractions || 0,
      source: 'learnprompt',
    }));
}

function importYoumindVideos(md, videoMap, { idParam, model, source, prefix }) {
  const videos = JSON.parse(videoMap).prompts || {};
  return md
    .split(/^### /m)
    .slice(1)
    .filter((p) => p.includes('#### 📝 Prompt'))
    .map((p) => {
      const title = p.slice(0, p.indexOf('\n')).replace(/^No\. \d+:\s*/, '').trim();
      const desc =
        (p.match(/#### 📖 Description\s+([\s\S]*?)\n#### /) || [])[1]?.trim() || (p.match(/^> (.+)$/m) || [])[1]?.trim() || '';
      const prompt = (p.match(/#### 📝 Prompt\s+```[^\n]*\n([\s\S]*?)\n```/) || [])[1] || '';
      const poster = ([...p.matchAll(/<img src="([^"]+)"/g)].map((m) => m[1]).find((u) => !/shields\.io/.test(u))) || '';
      const id = (p.match(new RegExp(idParam + '\\?id=(\\d+)')) || [])[1] || '';
      const author = p.match(/\*\*Author:\*\* \[([^\]]+)\]\(([^)]+)\)/);
      const sourceUrl = (p.match(/\*\*Source:\*\* \[[^\]]+\]\(([^)]+)\)/) || [])[1] || '';
      const published = (p.match(/\*\*Published:\*\* ([A-Za-z]+ \d+, \d{4})/) || [])[1] || '';
      const d = published ? new Date(published + ' UTC') : null;
      return {
        id: `${prefix}${tweetId(sourceUrl) || id || slugify(title)}`,
        title,
        desc,
        prompt: prompt.trim(),
        poster,
        video: videos[id] || '',
        model,
        author: author?.[1] || '',
        authorUrl: author?.[2] || '',
        sourceUrl,
        date: d && !isNaN(d) ? d.toISOString().slice(0, 10) : '',
        likes: 0,
        source,
      };
    })
    .filter((x) => english(x.prompt) && english(x.title));
}

function importOswSeedance(raw, mirrorRaw) {
  // Seedance posts collected from X. Only posts whose prompt was published are used; the clip and
  // poster come from the collection's own mirror, falling back to the post's media.
  const mirror = JSON.parse(mirrorRaw);
  return JSON.parse(raw)
    .filter((x) => x.prompt && x.title && english(x.prompt) && english(x.title))
    .map((x) => ({
      id: `w${x.id}`,
      title: x.title.trim(),
      desc: '',
      prompt: x.prompt.trim(),
      poster: mirror[x.id]?.poster || x.video?.thumbnail || '',
      video: mirror[x.id]?.mp4 || x.video?.url || '',
      model: x.model || 'Seedance',
      author: x.author?.name || (x.author?.handle ? `@${x.author.handle}` : ''),
      authorUrl: x.author?.url || '',
      sourceUrl: x.url || '',
      date: x.date || '',
      likes: x.stats?.likes || 0,
      source: 'oswseedance',
    }));
}

async function importCommunity() {
  // Cached in sources/ so a normal import makes no API calls.
  const cache = path.join(SRC, 'community-skills.json');
  if (FETCH || !(await exists(cache))) {
    const rows = [];
    for (const [topic, repos] of Object.entries(COMMUNITY)) {
      for (const repo of repos) {
        const res = await fetch(`https://api.github.com/repos/${repo}`, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'prompt-gallery-import' } });
        if (!res.ok) {
          console.warn('skipped', repo, res.status);
          continue;
        }
        const r = await res.json();
        rows.push({
          name: r.name,
          by: r.owner.login,
          description: (r.description || '').replace(/\s+/g, ' ').trim(),
          license: r.license?.spdx_id || '',
          stars: r.stargazers_count,
          topic,
          url: r.html_url,
        });
      }
    }
    await writeFile(cache, JSON.stringify(rows, null, 2));
  }
  return JSON.parse(await readFile(cache, 'utf8'))
    .filter((s) => OPEN.has(s.license) && s.description && english(s.description))
    .sort((a, b) => b.stars - a.stars);
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
  ...importFreestylefly(await read('freestylefly.json')),
  ...importEvolink(await read('evolink.md')),
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
// Two prompts may share a title (the slug is already unique): number the repeats so page titles differ.
const numberRepeats = (list) => {
  const seen = new Map();
  for (const x of list) {
    const k = x.title.toLowerCase();
    const c = (seen.get(k) || 0) + 1;
    seen.set(k, c);
    if (c > 1) x.title = `${x.title} #${c}`;
  }
  return list;
};
numberRepeats(images);

let texts = importPromptsChat(await read('promptschat.csv')).filter(
  (x) => x.title && x.prompt.length >= 20 && !BLOCK.test(x.title) && !BLOCK.test(x.prompt.slice(0, 3000)),
);
texts = numberRepeats(finalize(texts, (x) => slugify(x.title) || 'prompt'));

// Video prompts: the evidence-led collection first (it carries the playable clip), most engaged first.
let videos = [
  ...importLearnPrompt(await read('learnprompt-seedance.json')).sort((a, b) => b.likes - a.likes),
  ...importOswSeedance(await read('osw-seedance.json'), await read('osw-mirror.json')).sort((a, b) => b.likes - a.likes),
  ...importYoumindVideos(await read('youmind-seedance.md'), await read('youmind-seedance-videos.json'), {
    idParam: 'seedance-2-0-prompts',
    model: 'Seedance 2.0',
    source: 'youmindseedance',
    prefix: 's',
  }),
  ...importYoumindVideos(await read('youmind-grok.md'), await read('youmind-grok-videos.json'), {
    idParam: 'grok-imagine-prompts',
    model: 'Grok Imagine',
    source: 'youmindgrok',
    prefix: 'g',
  }),
];
const rawVideos = videos.length;
const seenVideo = new Set();
videos = videos.filter((x) => {
  // A video prompt is listed only when it has both a playable clip and its prompt.
  if (!x.title || x.prompt.length < 20 || !x.video) return false;
  if (BLOCK.test(x.prompt) || BLOCK.test(x.title)) return false;
  const key = tweetId(x.sourceUrl) || x.id;
  if (seenVideo.has(key)) return false;
  seenVideo.add(key);
  return true;
});
videos = finalize(videos, (x) => `${slugify(x.title) || 'video'}-${x.id.slice(-6)}`).map(({ id, ...x }) => x);

const skills = await importSkills();
const community = await importCommunity();

await writeFile(path.join(OUT, 'image-prompts.json'), JSON.stringify(images));
await writeFile(path.join(OUT, 'text-prompts.json'), JSON.stringify(texts));
await writeFile(path.join(OUT, 'video-prompts.json'), JSON.stringify(videos));
await writeFile(path.join(OUT, 'skills.json'), JSON.stringify(skills, null, 2));
await writeFile(path.join(OUT, 'community-skills.json'), JSON.stringify(community, null, 2));
await writeFile(path.join(OUT, 'meta.json'), JSON.stringify({ sources: SOURCES, categories: CATEGORIES }, null, 2));

const by = (k) => images.reduce((a, x) => ((a[x[k]] = (a[x[k]] || 0) + 1), a), {});
console.log(`image prompts: ${images.length} of ${counts.raw} raw`, by('source'));
console.log('categories:', images.reduce((a, x) => (x.cats.forEach((c) => (a[c] = (a[c] || 0) + 1)), a), {}));
console.log(`text prompts: ${texts.length}`);
console.log(`video prompts: ${videos.length} of ${rawVideos} raw`, videos.reduce((a, x) => ((a[x.source] = (a[x.source] || 0) + 1), a), {}), 'with clip:', videos.filter((x) => x.video).length);
console.log(`community skills: ${community.length}`, community.map((s) => `${s.by}/${s.name}=${s.license}`).join(', '));
console.log(`skills: ${skills.length}`, skills.map((s) => `${s.name}=${s.license}`).join(', '));
