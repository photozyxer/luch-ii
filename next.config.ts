import type { NextConfig } from "next";
import path from "node:path";

// Content-Security-Policy: прагматичная политика под Next App Router.
// script/style — 'unsafe-inline' (Next инлайнит бутстрап-скрипты и стили без
// nonce-middleware); connect только на свой origin (клиент ходит лишь на /api);
// img — data:/blob: для превью html-to-image; frame-ancestors 'none' закрывает
// кликджекинг во всех современных браузерах; object/base/form-action заперты.
// mc.yandex.ru — Яндекс.Метрика (tag.js, пиксели, отправка хитов, вебвизор).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://mc.yandex.ru",
  "style-src 'self' 'unsafe-inline'",
  // + домены планировок застройщиков (новостройки-консультант): PRINZIP (SVG),
  //   Атлас (s3.timeweb.cloud), ТЭН, Брусника (cdn.brusnika.ru)
  "img-src 'self' data: blob: https://mc.yandex.ru https://prinzip.su https://s3.timeweb.cloud https://ten-stroy.ru https://cdn.brusnika.ru https://api.atomstroy.net",
  "font-src 'self'",
  "connect-src 'self' https://mc.yandex.ru",
  "frame-src 'self' https://mc.yandex.ru",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // принудительный HTTPS на 2 года + поддомены (сайт только по https, www→apex)
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // белый список источников контента — защита от XSS/инъекций
  { key: "Content-Security-Policy", value: csp },
  // запрет угадывания MIME-типов
  { key: "X-Content-Type-Options", value: "nosniff" },
  // запрет встраивания сайта в iframe (кликджекинг)
  { key: "X-Frame-Options", value: "DENY" },
  // не отдавать полный referrer на чужие домены
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // сайту не нужны камера/микрофон/геолокация
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  // самодостаточная сборка для Docker/Timeweb: .next/standalone/server.js
  // тянет только нужные файлы, node_modules ставить в рантайме не нужно
  output: "standalone",
  // проект — подпапка в git-репозитории wiki (выше есть свои lock-файлы), поэтому
  // явно фиксируем корень трассировки на папке luch, иначе standalone уезжает
  // в .next/standalone/luch/ и Dockerfile не находит server.js
  outputFileTracingRoot: path.resolve(),
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      // стриминг чат-консультанта: отключаем буферизацию на прокси Timeweb/nginx,
      // иначе ответ придёт целиком в конце, а не по мере генерации (см. self-hosting)
      {
        source: "/api/consult",
        headers: [{ key: "X-Accel-Buffering", value: "no" }],
      },
    ];
  },
  // канонический адрес — https://luch-ii.ru; www перебрасываем на без-www
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.luch-ii.ru" }],
        destination: "https://luch-ii.ru/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
