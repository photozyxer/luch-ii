"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/agency", label: "Агентство" },
  { href: "/system", label: "ИИ-система" },
  { href: "/cases", label: "Кейсы" },
  { href: "/about", label: "О нас" },
  { href: "/contacts", label: "Контакты" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "py-2" : "py-4"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className={`flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 ${
            scrolled || open ? "glass" : ""
          }`}
        >
          <Link href="/" className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{
                background:
                  "conic-gradient(from 180deg, var(--c-cyan), var(--c-indigo), var(--c-violet), var(--c-warm), var(--c-cyan))",
                boxShadow: "0 0 16px -2px var(--beam)",
              }}
            />
            <span className="font-display text-lg font-semibold tracking-tight">
              ЛУЧ<span className="text-muted">·</span>ИИ
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm transition-colors hover:text-fg ${
                  pathname.startsWith(l.href) ? "text-fg" : "text-muted"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:block">
            <Link
              href="/contacts?topic=tender"
              className="glow-beam rounded-xl bg-beam px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              Пригласить в тендер
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden text-fg"
            aria-label="Меню"
          >
            <div className="space-y-1.5">
              <span className="block h-0.5 w-6 bg-fg" />
              <span className="block h-0.5 w-6 bg-fg" />
              <span className="block h-0.5 w-4 bg-fg" />
            </div>
          </button>
        </div>

        {open && (
          <div className="glass mt-2 rounded-2xl p-4 md:hidden">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-2 text-muted hover:text-fg"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/contacts?topic=tender"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-xl bg-beam px-4 py-2 text-center font-semibold text-white"
            >
              Пригласить в тендер
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
