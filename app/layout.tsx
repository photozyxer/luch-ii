import type { Metadata } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import { headers } from "next/headers";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { NOVOSTROYKI_HOST } from "@/lib/novostroyki/config";

// Яндекс.Метрика (счётчик 111388370). Инлайн через next/script со стратегией
// afterInteractive — грузится один раз на всех роутах, очередь ym() ловит
// первый просмотр. Домен mc.yandex.ru разрешён в CSP (см. next.config.ts).
const YM_ID = 111388370;
const yandexMetrika = `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}', 'ym');ym(${YM_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});`;

// self-hosted вариативные шрифты: без запросов к Google Fonts (надёжно из РФ)
const unbounded = localFont({
  src: "./fonts/Unbounded.ttf",
  variable: "--font-unbounded",
  weight: "200 900",
  display: "swap",
});

const manrope = localFont({
  src: "./fonts/Manrope.ttf",
  variable: "--font-manrope",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://luch-ii.ru"),
  title: {
    default: "ЛУЧ-ИИ — performance-агентство для застройщиков + ИИ-система",
    template: "%s — ЛУЧ-ИИ",
  },
  description:
    "Реклама, звонки, аналитика и продажи застройщика в одной ИИ-системе ЛУЧ: 7 модулей — от голосового приёма звонков до план-факта. Показываем, что делать сейчас.",
  applicationName: "ЛУЧ-ИИ",
  authors: [{ name: "ЛУЧ-ИИ" }],
  keywords: [
    "маркетинг для застройщика",
    "ИИ для недвижимости",
    "анализ звонков отдела продаж",
    "сквозная аналитика застройщик",
    "performance-агентство недвижимость",
    "голосовой ИИ приём звонков",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "ЛУЧ-ИИ",
    locale: "ru_RU",
    url: "/",
    title: "ЛУЧ-ИИ — performance-агентство для застройщиков + ИИ-система",
    description:
      "7 ИИ-модулей ЛУЧ ведут рекламу, звонки, аналитику и продажи застройщика — и говорят, что делать сейчас.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ЛУЧ-ИИ — ИИ-система для маркетинга и продаж застройщика",
    description:
      "7 модулей: голосовой приём звонков, анализ звонков, перформанс, SMM, продакшн, консультант, аналитика с план-фактом.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// JSON-LD: организация и сайт — для сущностного графа и AI-поиска
const orgJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://luch-ii.ru/#org",
      name: "ЛУЧ-ИИ",
      url: "https://luch-ii.ru",
      description:
        "Performance-агентство для застройщиков с собственной ИИ-системой ЛУЧ из 7 модулей: реклама, звонки, аналитика, SMM, продакшн, консультант, приём звонков.",
      areaServed: "RU",
      knowsAbout: [
        "performance-маркетинг в недвижимости",
        "сквозная аналитика застройщика",
        "ИИ-анализ звонков",
        "голосовой ИИ приём входящих",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://luch-ii.ru/#website",
      name: "ЛУЧ-ИИ",
      url: "https://luch-ii.ru",
      inLanguage: "ru-RU",
      publisher: { "@id": "https://luch-ii.ru/#org" },
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // На поддомене новостроек агентский хедер/футер НЕ рендерим (у секции свой хром,
  // app/novostroyki/layout.tsx). Определяем по хосту серверно — без мигания.
  // На осн. домене luch-ii.ru Nav/Footer сами прячутся на /novostroyki (usePathname).
  const host = (await headers()).get("host")?.split(":")[0] ?? "";
  const isNovostroykiHost = host === NOVOSTROYKI_HOST;
  return (
    <html
      lang="ru"
      className={`${unbounded.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="yandex-metrika"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: yandexMetrika }}
        />
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${YM_ID}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <SmoothScroll>
          {!isNovostroykiHost && <Nav />}
          <main className="flex-1">{children}</main>
          {!isNovostroykiHost && <Footer />}
        </SmoothScroll>
      </body>
    </html>
  );
}
