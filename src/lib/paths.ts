// getStaticPaths helpers shared by the English (root) and Malay (/ms) route files.
import { images, texts, catSlugs } from './data';

export const IMAGE_PAGE = 48;
export const TEXT_PAGE = 60;

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

export const textListPaths = (paginate: any) => paginate(texts, { pageSize: TEXT_PAGE });

export const textPromptPaths = () =>
  texts.map((t, i) => ({
    params: { slug: t.slug },
    props: { t, more: [1, 2, 3, 4, 5, 6].map((d) => texts[(i + d) % texts.length]) },
  }));
