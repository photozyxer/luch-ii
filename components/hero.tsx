"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import Prism from "@/components/prism";
import Stat from "@/components/stat";

/* слова заголовка — каждое в маске, выезжают по очереди */
const LINE_1 = ["Весь", "маркетинг", "застройщика"];
const LINE_2 = ["одним", "лучом"];

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".hw-inner", {
          yPercent: 115,
          duration: 1.05,
          stagger: 0.07,
          delay: 0.15,
        })
        .from(
          "[data-hero]",
          { opacity: 0, y: 26, duration: 0.9, stagger: 0.1 },
          "-=0.6"
        );
    }, root);

    return () => ctx.revert();
  }, []);

  const word = (w: string, spectrum = false) => (
    <span key={w} className="hw inline-block overflow-hidden pb-[0.12em] -mb-[0.12em]">
      <span
        className={`hw-inner inline-block will-change-transform ${
          spectrum ? "text-spectrum-live" : ""
        }`}
      >
        {w}
      </span>
    </span>
  );

  return (
    <section
      id="top"
      ref={root}
      className="noise relative flex min-h-dvh items-center overflow-hidden"
    >
      <div className="absolute inset-0 grid-bg" aria-hidden />
      <Prism />

      {/* лёгкое затемнение под текстом, чтобы лучи не спорили с заголовком */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-[70%]"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in oklab, var(--ink) 88%, transparent), transparent)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 pt-24 sm:px-6">
        <div className="max-w-4xl">
          <span
            data-hero
            className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs text-muted"
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--c-cyan)", boxShadow: "0 0 10px var(--c-cyan)" }}
            />
            агентство + ИИ-система для застройщиков
          </span>

          <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
            {LINE_1.map((w, i) => (
              <span key={w}>
                {word(w)}
                {i < LINE_1.length - 1 ? " " : ""}
              </span>
            ))}
            {" — "}
            <br className="hidden sm:block" />
            {word(LINE_2[0], true)} {word(LINE_2[1], true)}
          </h1>

          <p
            data-hero
            className="mt-6 max-w-2xl text-lg leading-relaxed text-muted sm:text-xl"
          >
            Реклама, соцсети, звонки и аналитика — в одной связке.
            Ведёт наша команда, разгоняет наша мультиагентная ИИ-система.
            Одна точка входа вместо пяти подрядчиков.
          </p>

          <div data-hero className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/contacts?topic=tender"
              className="glow-beam rounded-xl bg-beam px-6 py-3.5 text-center font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              Пригласить в тендер
            </Link>
            <Link
              href="/contacts?topic=calls"
              className="glass rounded-xl px-6 py-3.5 text-center font-semibold text-fg transition-colors hover:text-white"
            >
              Разбор 50 звонков — бесплатно →
            </Link>
          </div>

          <dl
            data-hero
            className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-line/60 pt-6"
          >
            <div>
              <dt className="text-xs text-muted">самый долгий контракт</dt>
              <dd className="mt-1 whitespace-nowrap font-display text-xl font-semibold sm:text-3xl">
                <Stat value={65} suffix=" мес" />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">целевых обращений в месяц</dt>
              <dd className="mt-1 whitespace-nowrap font-display text-xl font-semibold sm:text-3xl">
                <Stat value={300} prefix="до " />
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">обращений доходит до сделки</dt>
              <dd className="mt-1 whitespace-nowrap font-display text-xl font-semibold sm:text-3xl">
                <Stat value={11} suffix="%" />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
