import { NextResponse, type NextRequest } from "next/server";
import { NOVOSTROYKI_HOST } from "@/lib/novostroyki/config";

/**
 * Host-роутинг поддомена новостроек.
 *
 * Секция лежит под /novostroyki, но на поддомене novostroyki-ekb.luch-ii.ru должна
 * отдаваться В КОРНЕ с чистыми URL. Логика (ТОЛЬКО когда host === NOVOSTROYKI_HOST):
 *   • /novostroyki[/*]  → 301 на тот же путь без префикса (чистый) — убивает дубли
 *     от внутренних ссылок вида /novostroyki/rayon/viz.
 *   • всё остальное (/, /rayon/viz, /akcii, /sitemap.xml …) → внутренний rewrite на
 *     /novostroyki+path (URL в адресной строке остаётся чистым).
 *   • /api, /_next — passthrough.
 * На основном домене (luch-ii.ru) и localhost middleware НЕ вмешивается → агентский
 * сайт и текущее поведение /novostroyki/* не меняются.
 */
export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase().split(":")[0];
  if (host !== NOVOSTROYKI_HOST) return NextResponse.next();

  const { pathname, search } = req.nextUrl;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // префиксную форму на поддомене редиректим к чистой (канонизация)
  if (pathname === "/novostroyki" || pathname.startsWith("/novostroyki/")) {
    const clean = pathname.replace(/^\/novostroyki/, "") || "/";
    const url = req.nextUrl.clone();
    url.pathname = clean;
    return NextResponse.redirect(url, 301);
  }

  // чистый путь → внутренне отдаём из /novostroyki
  const url = req.nextUrl.clone();
  url.pathname = pathname === "/" ? "/novostroyki" : `/novostroyki${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // не гоняем middleware на статике/ассетах
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
