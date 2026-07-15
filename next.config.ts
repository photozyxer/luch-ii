import type { NextConfig } from "next";

const securityHeaders = [
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
};

export default nextConfig;
