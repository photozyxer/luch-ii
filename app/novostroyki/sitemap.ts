import type { MetadataRoute } from "next";
import { listDistricts, listDevelopers, listZk } from "@/lib/novostroyki/catalog";

/**
 * Sitemap раздела новостроек. Отдельный от корневого — на поддомене
 * novostroyki-ekb.luch-ii.ru станет самостоятельным. Базу/пути обновить при
 * переезде на поддомен (брик 5); до подключения поддомена в Вебмастер не сдаём.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://luch-ii.ru/novostroyki";
  const now = new Date();
  const urls: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/akcii", priority: 0.8 },
    { path: "/ipoteka", priority: 0.8 },
    ...listDistricts().map((d) => ({ path: `/rayon/${d.slug}`, priority: 0.8 })),
    ...listDevelopers().map((d) => ({ path: `/zastroyshchik/${d.slug}`, priority: 0.7 })),
    ...listZk().map((z) => ({ path: `/zhk/${z.slug}`, priority: 0.7 })),
  ];
  return urls.map((u) => ({
    url: `${base}${u.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: u.priority,
  }));
}
