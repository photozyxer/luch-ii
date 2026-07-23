import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/smooth-scroll";
import Nav from "@/components/nav";
import Footer from "@/components/footer";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ru"
      className={`${unbounded.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <SmoothScroll>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
