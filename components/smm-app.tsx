"use client";

import { useCallback, useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  BRAND,
  FORMULAS,
  TRENDS,
  CYCLE,
  type FormulaId,
} from "@/lib/smm-brand";

type Slide = { kind: "hook" | "value" | "cta"; title: string; text: string };
type Carousel = { slides: Slide[]; caption: string; hashtags: string[] };
type SinglePost = { title: string; text: string; caption: string; hashtags: string[] };
type Mode = "carousel" | "post";

/* ── фоны слайдов: бренд-графика (по гайду Fenomen) + реальные фото ЖК ── */
type BgId = "brand" | "paper" | "photo1" | "photo2" | "photo3" | "photo4" | "photo5";
const BGS: { id: BgId; label: string; photo?: boolean }[] = [
  { id: "brand", label: "Бренд" },
  { id: "paper", label: "Светлый" },
  { id: "photo1", label: "Двор", photo: true },
  { id: "photo2", label: "Фасад", photo: true },
  { id: "photo3", label: "Отделка", photo: true },
  { id: "photo4", label: "Лобби", photo: true },
  { id: "photo5", label: "Вход", photo: true },
];
/* position — точка кадрирования под макет 4:5: у ландшафтных фото режутся
   бока (важен % по горизонтали), у портретных — верх/низ */
const PHOTO_SRC: Record<string, { src: string; position: string }> = {
  photo1: { src: "/smm/real-court.jpg", position: "center" }, // пре-кроп 4:5: площадка, лавки, зелень
  photo2: { src: "/smm/real-facade.jpg", position: "center" },
  photo3: { src: "/smm/real-interior.jpg", position: "22% center" }, // окно, не глухая стена
  photo4: { src: "/smm/real-lobby.jpg", position: "center 90%" }, // диван + вывеска, без решётки потолка
  photo5: { src: "/smm/real-playground.jpg", position: "45% 75%" }, // вход, камни, деревья
};

const DEMO_CAROUSEL: Carousel = {
  slides: [
    { kind: "hook", title: "5 причин переехать в Академический в 2026", text: "" },
    { kind: "value", title: "Свой парк за окном", text: "Преображенский парк — прогулки без поездок. Плюс свой бульвар внутри квартала." },
    { kind: "value", title: "20 минут до центра", text: "Без пробок. 9 автобусных маршрутов, в планах — трамвайная линия." },
    { kind: "value", title: "Медицина рядом", text: "Поликлиники, станция скорой и растущий медицинский кластер — в своём районе." },
    { kind: "value", title: "Заезжай и живи", text: "Все квартиры в «Притяжении» — с чистовой отделкой. Студии от 4,07 млн ₽." },
    { kind: "value", title: "Двор без машин", text: "Многоуровневый паркинг до 500 мест. Во дворе — только площадки и зелень." },
    { kind: "cta", title: "Выбрать квартиру", text: "+7 (343) 343-28-27 · офис на Сахарова, 47" },
  ],
  caption:
    "Академический растёт быстрее всех районов Екатеринбурга — и вот почему мы строим «Притяжение» именно здесь 🧡 Листайте карусель: 5 причин, из-за которых сюда переезжают семьями. А вы бы что добавили шестым пунктом?",
  hashtags: ["#жкпритяжение", "#академический", "#новостройкиекатеринбург", "#квартирасотделкой", "#екатеринбург", "#переезд", "#новостройка2026", "#купитьквартиру"],
};

const DEMO_POST: SinglePost = {
  title: "Двор без машин — это как?",
  text: "Весь транспорт — в многоуровневом паркинге до 500 мест. Во дворе остаются только площадки, зелень и люди. Дети гуляют без «осторожно, машина!».",
  caption:
    "Первое, что замечают на экскурсии по «Притяжению», — тишина во дворе 🧡 Машины уезжают в паркинг, а двор остаётся людям. Приезжайте посмотреть сами — офис продаж на Сахарова, 47. Как вам такой формат двора?",
  hashtags: ["#жкпритяжение", "#академический", "#дворбезмашин", "#новостройкиекатеринбург", "#екатеринбург", "#квартирасотделкой"],
};

/* ────────────────────────── слайд карусели ────────────────────────── */

function SlideCard({
  slide,
  index,
  total,
  bg,
}: {
  slide: Slide;
  index: number;
  total: number;
  bg: BgId;
}) {
  const isPhoto = bg.startsWith("photo");
  const isCta = slide.kind === "cta";
  const isHook = slide.kind === "hook";

  // фон слайда
  let bgStyle: React.CSSProperties = {};
  if (isPhoto) {
    bgStyle = {
      backgroundImage: `linear-gradient(180deg, ${BRAND.navy}22 0%, ${BRAND.navy}E8 78%), url(${PHOTO_SRC[bg].src})`,
      backgroundSize: "cover",
      backgroundPosition: PHOTO_SRC[bg].position,
    };
  } else if (bg === "paper") {
    bgStyle = { background: BRAND.paper };
  } else {
    // бренд: коралловый хук/CTA, светлые value со звездой
    bgStyle = isHook || isCta
      ? { background: `linear-gradient(160deg, ${BRAND.coral} 0%, #e03d33 100%)` }
      : { background: "#fff" };
  }

  // палитра по гайду: только Warm Red, Cool Black и белый
  const light = isPhoto || ((bg === "brand") && (isHook || isCta));
  const fg = light ? "#ffffff" : BRAND.navy;
  const accent = light ? "#ffffff" : BRAND.coral;

  return (
    <div
      className="relative flex h-full w-full flex-col justify-between overflow-hidden p-[7%]"
      style={{ ...bgStyle, color: fg, fontFamily: "var(--font-body), Manrope, sans-serif" }}
    >
      {/* декоративная звезда бренда */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[12%] -top-[10%] select-none leading-none"
        style={{ fontSize: "min(38cqw, 340px)", color: accent, opacity: light ? 0.25 : 0.1 }}
      >
        ✦
      </div>

      {/* верх: лого + счётчик */}
      <div className="relative flex items-center justify-between text-[3.2cqw] font-semibold tracking-[0.18em]">
        <span>{BRAND.logo}</span>
        <span style={{ opacity: 0.7 }}>
          {index + 1}/{total}
        </span>
      </div>

      {/* центр: контент */}
      <div className="relative">
        {slide.kind === "value" && (
          <div
            className="mb-[4cqw] flex h-[11cqw] w-[11cqw] items-center justify-center rounded-full text-[5cqw] font-bold"
            style={{ background: accent, color: light ? BRAND.navy : "#fff" }}
          >
            {index}
          </div>
        )}
        <h3
          className="font-semibold leading-[1.12]"
          style={{ fontSize: isHook ? "9.5cqw" : "7.2cqw", letterSpacing: "-0.01em" }}
        >
          {slide.title}
        </h3>
        {slide.text && (
          <p className="mt-[3.5cqw] leading-[1.45]" style={{ fontSize: "4.4cqw", opacity: 0.88 }}>
            {slide.text}
          </p>
        )}
        {isHook && (
          <p className="mt-[5cqw] text-[3.6cqw] font-semibold" style={{ color: light ? "#fff" : BRAND.coral }}>
            Листайте → сохраните на потом
          </p>
        )}
      </div>

      {/* низ: подпись проекта */}
      <div className="relative flex items-center justify-between text-[3cqw]" style={{ opacity: 0.75 }}>
        <span>{isCta ? BRAND.phone : `ЖК «${BRAND.name}» · Академический`}</span>
        <span>{BRAND.site}</span>
      </div>
    </div>
  );
}

/* ────────────────────────── одиночный пост ────────────────────────── */

function PostCard({ post, bg }: { post: SinglePost; bg: BgId }) {
  const isPhoto = bg.startsWith("photo");

  let bgStyle: React.CSSProperties;
  if (isPhoto) {
    bgStyle = {
      backgroundImage: `linear-gradient(180deg, ${BRAND.navy}11 0%, ${BRAND.navy}F0 82%), url(${PHOTO_SRC[bg].src})`,
      backgroundSize: "cover",
      backgroundPosition: PHOTO_SRC[bg].position,
    };
  } else if (bg === "paper") {
    bgStyle = { background: BRAND.paper };
  } else {
    bgStyle = { background: BRAND.coral };
  }

  const light = isPhoto || bg === "brand";
  const fg = light ? "#ffffff" : BRAND.navy;

  return (
    <div
      className="relative flex h-full w-full flex-col justify-between overflow-hidden p-[7%]"
      style={{ ...bgStyle, color: fg, fontFamily: "var(--font-body), Manrope, sans-serif" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-[10%] -top-[8%] select-none leading-none"
        style={{ fontSize: "min(34cqw, 300px)", color: light ? "#ffffff" : BRAND.coral, opacity: light ? 0.22 : 0.1 }}
      >
        ✦
      </div>

      <div className="relative text-[3.4cqw] font-semibold tracking-[0.14em]">{BRAND.logo}</div>

      <div className="relative">
        <h3 className="font-semibold leading-[1.1]" style={{ fontSize: "8.6cqw", letterSpacing: "-0.01em" }}>
          {post.title}
        </h3>
        {post.text && (
          <p className="mt-[3.5cqw] leading-[1.45]" style={{ fontSize: "4.4cqw", opacity: 0.9 }}>
            {post.text}
          </p>
        )}
      </div>

      <div className="relative flex items-center justify-between text-[3cqw]" style={{ opacity: 0.8 }}>
        <span>{BRAND.tagline}</span>
        <span>{BRAND.site}</span>
      </div>
    </div>
  );
}

/* ────────────────────────── основной модуль ────────────────────────── */

export default function SmmApp() {
  const [topic, setTopic] = useState("");
  const [mode, setMode] = useState<Mode>("carousel");
  const [formula, setFormula] = useState<FormulaId>("listicle");
  const [carousel, setCarousel] = useState<Carousel>(DEMO_CAROUSEL);
  const [post, setPost] = useState<SinglePost>(DEMO_POST);
  const [isDemoData, setIsDemoData] = useState(true);
  const [current, setCurrent] = useState(0);
  const [bg, setBg] = useState<BgId>("photo1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const slideRef = useRef<HTMLDivElement>(null);

  const generate = useCallback(async () => {
    const t = topic.trim();
    if (!t || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/smm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t, formula, mode }),
      });
      if (res.status === 429) throw new Error("Слишком много генераций подряд — минутку паузы.");
      if (!res.ok) throw new Error("Не получилось сгенерировать. Попробуйте ещё раз.");
      const data = await res.json();
      if (mode === "post") {
        setPost(data as SinglePost);
      } else {
        setCarousel(data as Carousel);
        setCurrent(0);
      }
      setIsDemoData(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка генерации.");
    } finally {
      setBusy(false);
    }
  }, [topic, formula, mode, busy]);

  const download = useCallback(async () => {
    if (!slideRef.current) return;
    const node = slideRef.current;
    const png = await toPng(node, {
      pixelRatio: 1080 / node.offsetWidth,
      cacheBust: true,
    });
    const a = document.createElement("a");
    a.href = png;
    a.download =
      mode === "post" ? "prityazhenie-post.png" : `prityazhenie-slide-${current + 1}.png`;
    a.click();
  }, [current, mode]);

  const caption = mode === "post" ? post.caption : carousel.caption;
  const hashtags = mode === "post" ? post.hashtags : carousel.hashtags;

  const copyCaption = useCallback(() => {
    navigator.clipboard
      .writeText(`${caption}\n\n${hashtags.join(" ")}`)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
  }, [caption, hashtags]);

  const total = carousel.slides.length;

  return (
    <div className="space-y-20">
      {/* ── 1. Скаут трендов ── */}
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Скаут: что сейчас залетает в нише
          </h2>
          <span className="text-xs text-muted">
            паттерны по данным скаута · в демо — синтетика на реальных механиках
          </span>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRENDS.map((t) => {
            const f = FORMULAS.find((f) => f.id === t.formula)!;
            return (
              <button
                key={t.title}
                type="button"
                onClick={() => {
                  setFormula(t.formula);
                  document.getElementById("smm-gen")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="glass group rounded-2xl p-5 text-left transition-colors hover:border-white/25"
              >
                <span className="rounded-full bg-white/8 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {f.label}
                </span>
                <p className="mt-3 text-sm font-semibold leading-snug">{t.title}</p>
                <p className="mt-1 text-xs text-muted">{t.niche}</p>
                <div className="mt-4 flex gap-4 text-xs">
                  <span>ER <b className="text-fg">{t.er}%</b></span>
                  <span>💾 <b className="text-fg">{t.saves}</b></span>
                  <span>👁 <b className="text-fg">{t.reach}</b></span>
                </div>
                <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-relaxed text-muted">
                  {t.insight}
                </p>
                <span className="mt-3 inline-block text-xs font-semibold text-cyan-300 opacity-0 transition-opacity group-hover:opacity-100">
                  Взять формулу →
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 2. Генератор ── */}
      <section id="smm-gen" className="scroll-mt-28">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">
          Генератор контента — в фирменном стиле ЖК
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Тема + формат → контент по фактам проекта → макеты в бренд-ките
          «Притяжения» по официальному гайдлайну (Warm Red #FF4438, Cool Black,
          фирменная звезда) на реальных фото ЖК.
        </p>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_minmax(340px,420px)]">
          {/* левая колонка: управление + подпись */}
          <div>
            <div className="glass rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Формат
              </p>
              <div className="mt-2 flex gap-2">
                {([
                  { id: "carousel", label: "Карусель" },
                  { id: "post", label: "Пост (текст + картинка)" },
                ] as { id: Mode; label: string }[]).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                      mode === m.id
                        ? "border-transparent bg-beam font-semibold text-white"
                        : "border-white/12 text-muted hover:border-white/25 hover:text-fg"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-muted">
                Тема {mode === "post" ? "поста" : "карусели"}
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && generate()}
                maxLength={200}
                placeholder="Например: почему квартира с отделкой выгоднее"
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-white/25"
              />
              {mode === "carousel" && (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted">
                    Виральная формула
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {FORMULAS.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFormula(f.id)}
                        title={f.hint}
                        className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                          formula === f.id
                            ? "border-transparent bg-beam font-semibold text-white"
                            : "border-white/12 text-muted hover:border-white/25 hover:text-fg"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <button
                type="button"
                onClick={generate}
                disabled={busy || !topic.trim()}
                className="glow-beam mt-5 rounded-xl bg-beam px-5 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
              >
                {busy
                  ? "Генерирую…"
                  : mode === "post"
                    ? "Сгенерировать пост"
                    : "Сгенерировать карусель"}
              </button>
              {error && <p className="mt-3 text-xs text-amber-300/90">{error}</p>}
              {isDemoData && !busy && (
                <p className="mt-3 text-xs text-muted">
                  Сейчас показан пример. Введите свою тему — модуль соберёт контент заново.
                </p>
              )}
            </div>

            {/* подпись + хэштеги */}
            <div className="glass mt-4 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Подпись к посту
                </p>
                <button
                  type="button"
                  onClick={copyCaption}
                  className="text-xs font-semibold text-cyan-300 hover:opacity-80"
                >
                  {copied ? "✓ Скопировано" : "Копировать"}
                </button>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{caption}</p>
              <p className="mt-3 text-xs leading-relaxed text-cyan-300/80">
                {hashtags.join(" ")}
              </p>
            </div>

            {/* фотофоны */}
            <div className="glass mt-4 rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Реальные фото проекта
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Фоны — реальные фотографии ЖК «Притяжение»: двор, фасады, чистовая
                отделка, места общего пользования и благоустройство. Оформление —
                строго по фирменному гайдлайну Fenomen (Warm Red, Cool Black,
                фирменная звезда). В боевом контуре модуль сам подбирает фото под
                тему слайда, выпускающий контроль остаётся за человеком.
              </p>
            </div>
          </div>

          {/* правая колонка: превью карусели */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Фон:</span>
              {BGS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBg(b.id)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    bg === b.id
                      ? "border-transparent bg-white/15 font-semibold text-fg"
                      : "border-white/12 text-muted hover:text-fg"
                  }`}
                >
                  {b.label}
                  {b.photo && <span className="ml-1 text-[9px] text-cyan-300">фото</span>}
                </button>
              ))}
            </div>

            <div
              ref={slideRef}
              className="mt-3 w-full overflow-hidden rounded-none"
              style={{ aspectRatio: "4 / 5", containerType: "inline-size" }}
            >
              {mode === "post" ? (
                <PostCard post={post} bg={bg} />
              ) : (
                <SlideCard slide={carousel.slides[current]} index={current} total={total} bg={bg} />
              )}
            </div>

            {/* навигация — только для карусели */}
            {mode === "carousel" && (
              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                  disabled={current === 0}
                  className="glass rounded-xl px-4 py-2 text-sm disabled:opacity-30"
                >
                  ←
                </button>
                <div className="flex gap-1.5">
                  {carousel.slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setCurrent(i)}
                      aria-label={`Слайд ${i + 1}`}
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: i === current ? 18 : 6,
                        background: i === current ? "#fff" : "rgba(255,255,255,0.3)",
                      }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
                  disabled={current === total - 1}
                  className="glass rounded-xl px-4 py-2 text-sm disabled:opacity-30"
                >
                  →
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={download}
              className="glass mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors hover:border-white/25"
            >
              ⬇ Скачать {mode === "post" ? "пост" : `слайд ${current + 1}`} в PNG (1080×1350)
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. Эффективность и циклы ── */}
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Контур эффективности: пост → метрики → следующая итерация
          </h2>
          <span className="text-xs text-muted">демо-данные</span>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Агент собирает метрики опубликованных каруселей, извлекает инсайт и
          закладывает его в следующую генерацию. Формулы, которые работают, —
          масштабируются; слабые хуки — переделываются.
        </p>
        <div className="mt-6 space-y-3">
          {CYCLE.map((c, i) => (
            <div key={c.week} className="glass grid gap-4 rounded-2xl p-5 sm:grid-cols-[80px_1.2fr_repeat(4,minmax(70px,0.5fr))_1.4fr] sm:items-center">
              <span className="text-xs font-semibold text-muted">{c.week}</span>
              <div>
                <p className="text-sm font-semibold leading-snug">{c.title}</p>
                <p className="mt-0.5 text-xs text-muted">{c.formula}</p>
              </div>
              <div className="text-sm"><span className="block text-[10px] uppercase tracking-wider text-muted">Охват</span>{c.reach.toLocaleString("ru-RU")}</div>
              <div className="text-sm"><span className="block text-[10px] uppercase tracking-wider text-muted">Сохр.</span>{c.saves}</div>
              <div className="text-sm"><span className="block text-[10px] uppercase tracking-wider text-muted">ER</span>{c.er}%</div>
              <div className="text-sm"><span className="block text-[10px] uppercase tracking-wider text-muted">Лиды</span>{c.leads}</div>
              <p className="text-xs leading-relaxed text-muted">
                <span className="font-semibold" style={{ color: i === CYCLE.length - 1 ? "#22d3ee" : undefined }}>
                  →
                </span>{" "}
                {c.insight}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
