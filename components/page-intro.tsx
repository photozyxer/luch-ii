import { type ReactNode } from "react";
import Reveal from "@/components/reveal";

/** Верх подстраницы: кикер, заголовок, лид — на фоне блоба своего цвета. */
export default function PageIntro({
  kicker,
  title,
  lead,
  color = "var(--c-indigo)",
  children,
}: {
  kicker: string;
  title: ReactNode;
  lead?: ReactNode;
  color?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden pb-16 pt-36 sm:pb-24 sm:pt-44">
      <div className="absolute inset-0 grid-bg" aria-hidden />
      <div
        className="pointer-events-none absolute -top-32 left-1/2 h-[60vh] w-[70vw] -translate-x-1/2 rounded-full opacity-25 blur-[110px]"
        style={{ background: `radial-gradient(circle, ${color}, transparent 70%)` }}
        aria-hidden
      />
      <Reveal className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <p data-reveal className="kicker">
          {kicker}
        </p>
        <h1
          data-reveal
          className="mt-4 max-w-4xl font-display text-3xl font-semibold leading-[1.12] tracking-tight sm:text-5xl"
        >
          {title}
        </h1>
        {lead && (
          <p data-reveal className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
            {lead}
          </p>
        )}
        {children}
      </Reveal>
    </section>
  );
}
