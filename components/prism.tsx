"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const RAYS = [
  { color: "var(--c-cyan)", angle: -13, height: 44 },
  { color: "var(--c-indigo)", angle: 1, height: 52 },
  { color: "var(--c-violet)", angle: 15, height: 48 },
  { color: "var(--c-warm)", angle: 29, height: 40 },
];

/**
 * Сцена hero: белый луч входит в стеклянную призму, из неё веером
 * расходится спектр. Интро-таймлайн, «дыхание» в покое, веер
 * раскрывается по скроллу.
 */
export default function Prism() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const rays = gsap.utils.toArray<HTMLElement>(".pr-ray");

      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".pr-in", {
          scaleX: 0,
          opacity: 0,
          duration: 1.15,
          transformOrigin: "right center",
        })
        .from(".pr-glass-inner", { opacity: 0, scale: 0.7, duration: 0.9 }, "-=0.6")
        .fromTo(
          rays,
          { rotation: 10, opacity: 0, scaleX: 0.6, transformOrigin: "left center" },
          {
            rotation: (i) => RAYS[i].angle,
            opacity: 0.85,
            scaleX: 1,
            duration: 1.5,
            stagger: 0.09,
            // дыхание веера — только после того, как он раскрылся
            onComplete: () => {
              rays.forEach((el, i) => {
                gsap.to(el, {
                  rotation: RAYS[i].angle + 2,
                  duration: 5 + i * 1.3,
                  yoyo: true,
                  repeat: -1,
                  ease: "sine.inOut",
                });
              });
            },
          },
          "-=0.55"
        )
        .from(".pr-flare", { opacity: 0, scale: 0.4, duration: 1 }, "-=1.2");
      gsap.to(".pr-flare", {
        opacity: 0.55,
        scale: 1.15,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      // веер раскрывается, пока hero уезжает вверх
      gsap.to(".pr-fan", {
        rotate: 6,
        yPercent: -10,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* точка схождения — здесь стоит призма */}
      <div className="absolute left-[68%] top-[40%] sm:left-[62%] sm:top-[44%]">
        {/* входящий белый луч (идёт из левого верха к призме) */}
        <div
          className="pr-in absolute right-1 h-[3px] w-[80vw]"
          style={{
            top: -1,
            transform: "rotate(16deg)",
            transformOrigin: "right center",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.75))",
            boxShadow: "0 0 22px 3px rgba(255,255,255,0.28)",
          }}
        />

        {/* вспышка в точке преломления */}
        <div
          className="pr-flare absolute h-40 w-40"
          style={{
            left: -80,
            top: -80,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.5), color-mix(in oklab, var(--c-indigo) 40%, transparent) 35%, transparent 70%)",
            filter: "blur(10px)",
            opacity: 0.75,
          }}
        />

        {/* веер спектра */}
        <div className="pr-fan absolute left-0 top-0">
          {RAYS.map((r) => (
            <div
              key={r.color}
              className="pr-ray absolute left-0 w-[85vw]"
              style={{
                top: -r.height / 2,
                height: r.height,
                rotate: `${r.angle}deg`,
                transformOrigin: "left center",
                background: `linear-gradient(90deg, ${r.color} 0%, color-mix(in oklab, ${r.color} 55%, transparent) 45%, transparent 92%)`,
                filter: "blur(13px)",
                opacity: 0.85,
                mixBlendMode: "screen",
              }}
            />
          ))}
        </div>

        {/* стеклянная призма */}
        <div
          className="absolute"
          style={{ transform: "translate(-50%, -54%) rotate(8deg)" }}
        >
          <div
            className="pr-glass-inner h-28 w-28 sm:h-36 sm:w-36"
            style={{
              clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
              background:
                "linear-gradient(160deg, rgba(255,255,255,0.16), rgba(255,255,255,0.03) 55%, color-mix(in oklab, var(--c-indigo) 18%, transparent))",
              backdropFilter: "blur(6px)",
              boxShadow: "inset 0 0 30px rgba(255,255,255,0.06)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
