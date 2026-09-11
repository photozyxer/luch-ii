import NovostroykiNav from "@/components/novostroyki-nav";
import NovostroykiFooter from "@/components/novostroyki-footer";

/** Обёртка секции новостроек: своя шапка/футер вместо агентских (см. chrome-gate). */
export default function NovostroykiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NovostroykiNav />
      <div className="flex-1">{children}</div>
      <NovostroykiFooter />
    </div>
  );
}
