import type { Metadata } from "next";

/** Канонический адрес и параметры сайта для SEO-разметки. */
export const SITE = {
  url: "https://luch-ii.ru",
  name: "ЛУЧ-ИИ",
  locale: "ru_RU",
} as const;

/**
 * Метаданные страницы с каноникой и OG/Twitter, унаследованными от заголовка.
 * title передаётся БЕЗ бренда — суффикс добавит шаблон в layout.
 */
export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} — ${SITE.name}`,
      description,
      url: path,
      type: "website",
    },
    twitter: { title: `${title} — ${SITE.name}`, description },
  };
}
