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
  title: "ЛУЧ-ИИ — performance-агентство недвижимости на собственном ИИ",
  description:
    "Ведём рекламу, звонки, аналитику и продажи застройщика через собственную ИИ-систему ЛУЧ. Показываем не цифры, а что они значат — и что делать сейчас.",
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
        <SmoothScroll>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
