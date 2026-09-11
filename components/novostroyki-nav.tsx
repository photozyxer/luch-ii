import Link from "next/link";

/** Шапка поддомена новостроек — без агентской навигации ЛУЧ. */
const links = [
  { href: "/novostroyki#rayony", label: "Районы" },
  { href: "/novostroyki#zastroyshchiki", label: "Застройщики" },
  { href: "/novostroyki/akcii", label: "Акции" },
  { href: "/novostroyki/ipoteka", label: "Ипотека" },
];

export default function NovostroykiNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/novostroyki" className="flex items-center gap-2 font-display text-sm font-semibold sm:text-base">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: "linear-gradient(135deg, var(--c-cyan), var(--c-indigo))" }} />
          Новостройки Екатеринбурга
        </Link>
        <nav className="ml-auto hidden items-center gap-5 text-sm text-muted sm:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="transition-colors hover:text-fg">{l.label}</Link>
          ))}
        </nav>
        <Link href="/novostroyki" className="glow-beam ml-auto shrink-0 rounded-xl bg-beam px-4 py-2 text-xs font-semibold text-white sm:ml-0 sm:text-sm">
          Подобрать квартиру →
        </Link>
      </div>
    </header>
  );
}
