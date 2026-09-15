import type { MetadataRoute } from "next";
import { listDistricts, listDevelopers, listZk } from "@/lib/novostroyki/catalog";
import { NOVOSTROYKI_BASE } from "@/lib/novostroyki/config";

/**
 * Sitemap раздела новостроек — самостоятельный, на поддомене отдаётся как
 * /sitemap.xml (middleware rewrite'ит /sitemap.xml → /novostroyki/sitemap.xml).
 * URL — чистые (корень поддомена), совпадают с canonical страниц.
 */
export default function sitemap(): MetadataRoute.Sitemap {
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
    url: `${NOVOSTROYKI_BASE}${u.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: u.priority,
  }));
}
