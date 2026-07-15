"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/** Число, которое досчитывает себя при появлении в вьюпорте. */
export default function Stat({
  value,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fmt = (n: number) =>
      prefix + Math.round(n).toLocaleString("ru-RU").replace(/,/g, " ") + suffix;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmt(value);
      return;
    }

    let tween: gsap.core.Tween | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const counter = { n: 0 };
        tween = gsap.to(counter, {
          n: value,
          duration: 1.6,
          ease: "expo.out",
          onUpdate: () => {
            el.textContent = fmt(counter.n);
          },
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      tween?.kill();
    };
  }, [value, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  );
}
