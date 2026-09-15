import type { Metadata } from "next";
import NovostroykiNav from "@/components/novostroyki-nav";
import NovostroykiFooter from "@/components/novostroyki-footer";
import { NOVOSTROYKI_BASE } from "@/lib/novostroyki/config";

/**
 * Мета секции: свой бренд-суффикс в title (перекрывает агентский «— ЛУЧ-ИИ» из
 * root layout) + metadataBase поддомена, чтобы относительные canonical/OG-URL
 * резолвились на поддомен, а не на luch-ii.ru.
 */
export const metadata: Metadata = {
  metadataBase: new URL(NOVOSTROYKI_BASE),
  title: { template: "%s — Новостройки Екатеринбурга", default: "Новостройки Екатеринбурга — ИИ-подбор квартиры" },
};

/** Обёртка секции новостроек: своя шапка/футер вместо агентских. */
export default function NovostroykiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NovostroykiNav />
      <div className="flex-1">{children}</div>
      <NovostroykiFooter />
    </div>
  );
}
