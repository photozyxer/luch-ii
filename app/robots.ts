import type { MetadataRoute } from "next";

// /privacy в robots НЕ запрещаем: он закрыт от индексации meta-тегом noindex,
// а чтобы краулер этот тег увидел — страница должна оставаться доступной для обхода.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://luch-ii.ru/sitemap.xml",
    host: "https://luch-ii.ru",
  };
}
