/**
 * Конфиг поддомена новостроек. Секция физически лежит под /novostroyki в app-роутере,
 * но канонически живёт на поддомене novostroyki-ekb.luch-ii.ru В КОРНЕ (чистые URL).
 * Middleware (middleware.ts) переписывает запросы поддомена /x → /novostroyki/x и
 * редиректит /novostroyki/x → /x, чтобы не плодить дубли. canonical/sitemap ссылаются
 * на BASE. Хост переопределяется env NOVOSTROYKI_HOST (для смены домена при переезде).
 */
export const NOVOSTROYKI_HOST = process.env.NOVOSTROYKI_HOST || "novostroyki-ekb.luch-ii.ru";
export const NOVOSTROYKI_BASE = `https://${NOVOSTROYKI_HOST}`;

/** Внутренний путь /novostroyki/x → канонический URL поддомена (чистый, без префикса). */
export function canonicalUrl(pathAfterNovostroyki: string): string {
  const p = pathAfterNovostroyki.replace(/^\/novostroyki/, "").replace(/^\/?/, "/");
  return NOVOSTROYKI_BASE + (p === "/" ? "" : p);
}
