import Link from "next/link";

const nav = [
  { href: "/agency", label: "Услуги агентства" },
  { href: "/system", label: "ИИ-система" },
  { href: "/dashboard", label: "Демо дашборда" },
  { href: "/cases", label: "Кейсы" },
  { href: "/about", label: "О нас" },
  { href: "/contacts", label: "Контакты" },
];

export default function Footer() {
  return (
    <footer className="border-t border-line/60 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{
                background:
                  "conic-gradient(from 180deg, var(--c-cyan), var(--c-indigo), var(--c-violet), var(--c-warm), var(--c-cyan))",
              }}
            />
            <span className="font-display text-lg font-semibold">
              ЛУЧ<span className="text-muted">·</span>ИИ
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            Performance-агентство для застройщиков с собственной мультиагентной
            ИИ-системой. Жилые комплексы, загородные посёлки, брокеры.
          </p>
        </div>

        <nav className="flex flex-col gap-2.5 text-sm">
          {nav.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="w-fit text-muted transition-colors hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div>
          <p className="text-sm text-muted">Проверить нас проще всего так:</p>
          <Link
            href="/contacts?topic=calls"
            className="mt-3 inline-block rounded-xl bg-beam px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Бесплатный разбор 50 звонков →
          </Link>
          <p className="mt-6 text-sm text-muted">© {new Date().getFullYear()} ЛУЧ-ИИ</p>
        </div>
      </div>
    </footer>
  );
}
