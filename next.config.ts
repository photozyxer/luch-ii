import type { NextConfig } from "next";

// Content-Security-Policy: прагматичная политика под Next App Router.
// script/style — 'unsafe-inline' (Next инлайнит бутстрап-скрипты и стили без
// nonce-middleware); connect только на свой origin (клиент ходит лишь на /api);
// img — data:/blob: для превью html-to-image; frame-ancestors 'none' закрывает
// кликджекинг во всех современных браузерах; object/base/form-action заперты.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
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
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
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
