"use client";

import { type ReactNode, useCallback, useRef } from "react";

/** Карточка со «прожектором», который следует за курсором. */
export default function GlowCard({
  children,
  className = "",
  color,
}: {
  children: ReactNode;
  className?: string;
  color?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = useCallback((e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  }, []);

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      className={`spot ${className}`}
      style={color ? ({ "--spot-color": color } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
