import imageData from '../data/image-prompts.json';
import textData from '../data/text-prompts.json';
import skillData from '../data/skills.json';
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
export interface Source {
  name: string;
  by: string;
  url: string;
  license: string;
  licenseUrl: string;
}

export const images = imageData as ImagePrompt[];
export const texts = textData as TextPrompt[];
export const skills = skillData as Skill[];
export const sources = meta.sources as Record<string, Source>;

export const catCounts: Record<string, number> = {};
for (const p of images) for (const c of p.cats) catCounts[c] = (catCounts[c] || 0) + 1;
/** Category slugs that have at least one prompt, in display order. */
export const catSlugs = (meta.categories as string[]).filter((c) => catCounts[c]);

export const excerpt = (s: string, n = 140) => {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n).replace(/\s+\S*$/, '') + '…' : t;
};

export const fmt = (n: number) => n.toLocaleString('en-US');
export const pad = (n: number, w = 2) => String(n).padStart(w, '0');
