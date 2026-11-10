// getStaticPaths helpers shared by the English (root) and Malay (/ms) route files.
import { images, texts, videos, catSlugs, videoModels, TEXT_FILTERS, inTextFilter, textFilterCounts } from './data';

export const IMAGE_PAGE = 48;
export const TEXT_PAGE = 60;
export const VIDEO_PAGE = 36;

export const imageListPaths = (paginate: any) => paginate(images, { pageSize: IMAGE_PAGE });

export const categoryPaths = (paginate: any) =>
  catSlugs.flatMap((cat) =>
    paginate(
      images.filter((p) => p.cats.includes(cat)),
      { params: { cat }, pageSize: IMAGE_PAGE },
    ),
  );

export const imagePromptPaths = () => {
  const byCat: Record<string, typeof images> = {};
  for (const p of images) (byCat[p.cats[0]] ||= []).push(p);
  return images.map((p) => {
    const pool = byCat[p.cats[0]];
    const i = pool.indexOf(p);
    const related = [1, 2, 3, 4].map((d) => pool[(i + d) % pool.length]).filter((r) => r !== p);
    return { params: { slug: p.slug }, props: { p, related } };
  });
};

export const videoListPaths = (paginate: any) => paginate(videos, { pageSize: VIDEO_PAGE });

export const videoModelPaths = (paginate: any) =>
  videoModels.flatMap((m) =>
    paginate(
      videos.filter((v) => v.model === m.label),
      { params: { model: m.slug }, pageSize: VIDEO_PAGE },
    ),
  );

export const videoPromptPaths = () =>
  videos.map((v, i) => ({
    params: { slug: v.slug },
    props: { v, related: [1, 2, 3, 4].map((d) => videos[(i + d) % videos.length]) },
  }));

export const textListPaths = (paginate: any) => paginate(texts, { pageSize: TEXT_PAGE });

export const textTypePaths = (paginate: any) =>
  TEXT_FILTERS.filter((f) => textFilterCounts[f]).flatMap((f) =>
    paginate(
      texts.filter((t) => inTextFilter(t, f)),
      { params: { type: f }, pageSize: TEXT_PAGE },
    ),
  );

export const textPromptPaths = () =>
  texts.map((t, i) => ({
    params: { slug: t.slug },
    props: { t, more: [1, 2, 3, 4, 5, 6].map((d) => texts[(i + d) % texts.length]) },
  }));
