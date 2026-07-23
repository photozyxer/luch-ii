import type { MetadataRoute } from "next";

// /privacy не включаем — страница под noindex
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://luch-ii.ru";
  const now = new Date();
  const routes: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/system", priority: 0.9 },
    { path: "/agency", priority: 0.9 },
    { path: "/cases", priority: 0.8 },
    { path: "/consultant", priority: 0.7 },
    { path: "/smm", priority: 0.7 },
    { path: "/dashboard", priority: 0.7 },
    { path: "/about", priority: 0.6 },
    { path: "/contacts", priority: 0.6 },
  ];
  return routes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: r.priority,
  }));
}
