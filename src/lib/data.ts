import imageData from '../data/image-prompts.json';
import textData from '../data/text-prompts.json';
import videoData from '../data/video-prompts.json';
import skillData from '../data/skills.json';
import communityData from '../data/community-skills.json';
import meta from '../data/meta.json';

export interface ImagePrompt {
  slug: string;
  title: string;
  desc: string;
  prompt: string;
  images: string[];
  cats: string[];
  model: string;
  author: string;
  authorUrl: string;
  sourceUrl: string;
  date: string;
  likes: number;
  source: string;
}
export interface VideoPrompt {
  slug: string;
  title: string;
  desc: string;
  prompt: string;
  poster: string;
  /** Direct link to the sample clip on the original collection's server; empty when only a poster exists. */
  video: string;
  model: string;
  author: string;
  authorUrl: string;
  sourceUrl: string;
  date: string;
  likes: number;
  source: string;
}
export interface TextPrompt {
  slug: string;
  title: string;
  prompt: string;
  type: string; // 'text' | 'structured' | 'image'
  forDevs: boolean;
  contributor: string;
}
export interface Skill {
  name: string;
  description: string;
  license: string; // 'apache' | 'proprietary' | 'none'
  url: string;
}
export interface CommunitySkill {
  name: string;
  by: string;
  description: string;
  license: string; // SPDX id, e.g. 'MIT'
  stars: number;
  topic: string; // 'motion' | 'design' | 'more'
  url: string;
}
export interface Source {
  name: string;
  by: string;
  url: string;
  license: string;
  licenseUrl: string;
}

export const images = imageData as ImagePrompt[];
export const texts = textData as TextPrompt[];
export const videos = videoData as VideoPrompt[];
export const skills = skillData as Skill[];
export const communitySkills = communityData as CommunitySkill[];
export const sources = meta.sources as Record<string, Source>;

export const catCounts: Record<string, number> = {};
for (const p of images) for (const c of p.cats) catCounts[c] = (catCounts[c] || 0) + 1;
/** Category slugs that have at least one prompt, in display order. */
export const catSlugs = (meta.categories as string[]).filter((c) => catCounts[c]);

const slugOf = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** AI models that have video prompts, most prompts first: used for the model filter. */
export const videoModels = Object.entries(
  videos.reduce<Record<string, number>>((a, v) => ((a[v.model] = (a[v.model] || 0) + 1), a), {}),
)
  .map(([label, count]) => ({ slug: slugOf(label), label, count }))
  .sort((a, b) => b.count - a.count);

/** Text prompt filters: the three prompt types, plus prompts flagged for developers. */
export const TEXT_FILTERS = ['text', 'structured', 'image', 'developer'] as const;
export const inTextFilter = (t: TextPrompt, f: string) => (f === 'developer' ? t.forDevs : t.type === f);
export const textFilterCounts: Record<string, number> = Object.fromEntries(
  TEXT_FILTERS.map((f) => [f, texts.filter((t) => inTextFilter(t, f)).length]),
);

export const excerpt = (s: string, n = 140) => {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t;
};

export const fmt = (n: number) => n.toLocaleString('en-US');
export const pad = (n: number, w = 2) => String(n).padStart(w, '0');
