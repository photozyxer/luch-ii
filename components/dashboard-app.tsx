"use client";

import { useMemo, useState } from "react";

/* ═══════════════ статус-семантика ═══════════════ */
type S = "ok" | "warn" | "bad";
const SC: Record<S, string> = { ok: "#34d399", warn: "#fbbf24", bad: "#f87171" };

function Dot({ s }: { s: S }) {
  return (
    <span
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ background: SC[s], boxShadow: `0 0 10px -1px ${SC[s]}` }}
      aria-hidden
    />
  );
}

/* ═══════════════ форматтеры ═══════════════ */
type Fmt = "rub" | "rubM" | "int" | "intK" | "pct" | "rubK";
const nf = (n: number) => Math.round(n).toLocaleString("ru-RU").replace(/,/g, " ");
function fmt(v: number, k: Fmt): string {
  switch (k) {
    case "rub":
      return `${nf(v)} ₽`;
    case "rubK":
      return `${nf(v / 1000)} тыс. ₽`;
    case "rubM":
      return `${(v / 1_000_000).toFixed(2)} млн ₽`;
    case "int":
      return nf(v);
    case "intK":
      return `${nf(v / 1000)} тыс.`;
    case "pct":
      return `${v.toFixed(0)}%`;
  }
}

/* ═══════════════ детерминированный шум для рядов ═══════════════ */
function mulberry(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** веса-форма ряда (сумма ≈ days), лёгкий восходящий тренд + шум */
function shape(seed: number, days: number, trend: number, noise: number) {
  const r = mulberry(seed);
  const raw = Array.from({ length: days }, (_, i) => {
    const base = 1 + trend * (i / days - 0.5) * 2;
    return Math.max(0.15, base * (1 + (r() - 0.5) * noise));
  });
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((w) => (w / sum) * days);
}

/* ═══════════════ combo-график (бары факт + линия план) ═══════════════ */
type ChartCfg = {
  label: string;
  seed: number;
  type: "sum" | "ratio";
  fact: number;
  plan: number;
  fmtKind: Fmt;
  color: string;
  s: S;
  trend?: number;
  noise?: number;
};

function ComboChart({ c, mult, days }: { c: ChartCfg; mult: number; days: number }) {
  const { series, planPerBar } = useMemo(() => {
    const w = shape(c.seed, days, c.trend ?? 0.25, c.noise ?? 0.55);
    if (c.type === "sum") {
      const perDay = (c.fact * mult) / days;
      return { series: w.map((x) => perDay * x), planPerBar: (c.plan * mult) / days };
    }
    // ratio: колеблется вокруг значения
    const val = c.fact; // ratio-метрики (цены) уже отмасштабированы в конфиге
    const r = mulberry(c.seed + 7);
    const s = Array.from({ length: days }, () => val * (1 + (r() - 0.5) * 0.4));
    return { series: s, planPerBar: c.plan };
  }, [c, mult, days]);

  const W = 300;
  const H = 96;
  const pad = 4;
  const max = Math.max(...series, planPerBar) * 1.18 || 1;
  const bw = (W - pad * 2) / series.length;
  const y = (v: number) => H - (v / max) * (H - 10) - 2;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none" style={{ height: 96 }}>
      <defs>
        <linearGradient id={`g${c.seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.color} stopOpacity="0.95" />
          <stop offset="100%" stopColor={c.color} stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {series.map((v, i) => (
        <rect
          key={i}
          x={pad + i * bw + bw * 0.14}
          y={y(v)}
          width={bw * 0.72}
          height={H - 2 - y(v)}
          rx={1}
          fill={`url(#g${c.seed})`}
        />
      ))}
      {/* план — пунктир */}
      <line
        x1={pad}
        x2={W - pad}
        y1={y(planPerBar)}
        y2={y(planPerBar)}
        stroke={SC.warn}
        strokeWidth="1.2"
        strokeDasharray="4 3"
        opacity="0.9"
      />
    </svg>
  );
}

function ChartCard({ c, mult, days, labels }: { c: ChartCfg; mult: number; days: number; labels: string[] }) {
  const factScaled = c.type === "sum" ? c.fact * mult : c.fact;
  const planScaled = c.type === "sum" ? c.plan * mult : c.plan;
  const pct = Math.round((factScaled / planScaled) * 100);
  return (
    <div className="hairline rounded-2xl bg-surface/40 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex items-center gap-2 text-sm text-muted">
          <Dot s={c.s} />
          {c.label}
        </span>
        <span className="text-xs text-muted">
          факт <span className="font-semibold text-fg">{fmt(factScaled, c.fmtKind)}</span>
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
        <span className="inline-block h-0 w-4 border-t border-dashed" style={{ borderColor: SC.warn }} /> план{" "}
        {fmt(planScaled, c.fmtKind)} · {pct}%
      </div>
      <div className="mt-3">
        <ComboChart c={c} mult={mult} days={days} />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
        <span>{labels[2]}</span>
      </div>
    </div>
  );
}

/* ═══════════════ KPI-скоркарта ═══════════════ */
type Kpi = { label: string; fact: number; plan: number; fmtKind: Fmt; s: S; invert?: boolean };
function KpiCard({ k, mult }: { k: Kpi; mult: number }) {
  const f = k.fmtKind === "rub" || k.fmtKind === "pct" ? k.fact : k.fact * mult;
  const p = k.fmtKind === "rub" || k.fmtKind === "pct" ? k.plan : k.plan * mult;
  // для стоимостных метрик mult не применяем (цена за единицу)
  const isCost = k.invert;
  const factV = isCost ? k.fact : f;
  const planV = isCost ? k.plan : p;
  const pct = Math.round((factV / planV) * 100);
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-4">
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{ background: SC[k.s], boxShadow: `0 0 12px ${SC[k.s]}` }}
      />
      <p className="text-xs text-muted">{k.label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums leading-none">
        {fmt(factV, k.fmtKind)}
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
        <Dot s={k.s} /> план {fmt(planV, k.fmtKind)} · {pct}%
      </p>
    </div>
  );
}

/* ═══════════════ воронка (горизонтальные бары) ═══════════════ */
function Funnel({ mult }: { mult: number }) {
  const steps = [
    { label: "Показы", v: 2_100_000, s: "warn" as S },
    { label: "Клики", v: 13_200, s: "warn" as S },
    { label: "Обращения", v: 1151, s: "warn" as S },
    { label: "КЦО (целевые)", v: 380, s: "warn" as S },
    { label: "Встречи", v: 163, s: "bad" as S },
    { label: "Брони", v: 51, s: "warn" as S },
    { label: "Сделки", v: 41, s: "ok" as S },
  ];
  const top = steps[0].v;
  return (
    <div className="space-y-2">
      {steps.map((st, i) => {
        const w = Math.max(6, (Math.log10(st.v * mult) / Math.log10(top * mult)) * 100);
        const conv = i > 0 ? ((st.v / steps[i - 1].v) * 100).toFixed(i > 3 ? 0 : 1) : null;
        return (
          <div key={st.label} className="flex items-center gap-3 text-sm">
            <span className="w-28 shrink-0 text-muted">{st.label}</span>
            <div className="relative h-7 flex-1 overflow-hidden rounded-md" style={{ background: "color-mix(in oklab, var(--fg) 6%, transparent)" }}>
              <div
                className="flex h-full items-center rounded-md px-2 text-xs font-semibold text-white"
                style={{
                  width: `${w}%`,
                  background: `linear-gradient(90deg, ${SC[st.s]}, color-mix(in oklab, ${SC[st.s]} 55%, var(--c-indigo)))`,
                }}
              >
                {fmt(st.v * mult, st.v >= 1000 ? "intK" : "int")}
              </div>
            </div>
            <span className="w-16 shrink-0 text-right text-xs text-muted">{conv ? `${conv}%` : ""}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════ рекомендации ═══════════════ */
type Reco = { id: string; s: S; symptom: string; action: string };

function RecoBand({ recos }: { recos: Reco[] }) {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [approved, setApproved] = useState<string[]>([]);
  const live = recos.filter((r) => !dismissed.includes(r.id));
  return (
    <div className="hairline rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold">
          Что делать <span className="text-spectrum">сейчас</span>
        </h3>
        <span className="text-xs text-muted">{live.length} рекомендаций · слой ЛУЧ поверх данных</span>
      </div>
      {live.length === 0 && (
        <p className="mt-4 text-sm text-muted">Все рекомендации обработаны. ЛУЧ следит за метриками дальше.</p>
      )}
      <div className="mt-4 space-y-3">
        {live.map((r) => {
          const ok = approved.includes(r.id);
          return (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-xl p-4 transition-colors sm:flex-row sm:items-center"
              style={{
                background: ok ? "color-mix(in oklab, #34d399 10%, transparent)" : `color-mix(in oklab, ${SC[r.s]} 7%, transparent)`,
                border: `1px solid color-mix(in oklab, ${ok ? "#34d399" : SC[r.s]} 28%, transparent)`,
              }}
            >
              <p className="flex flex-1 items-start gap-2 text-sm leading-relaxed text-fg">
                <span className="mt-1.5">
                  <Dot s={ok ? "ok" : r.s} />
                </span>
                <span>
                  {ok && <span className="mr-1 font-semibold" style={{ color: SC.ok }}>Принято ·</span>}
                  {r.symptom} <span className="text-muted">→ {r.action}</span>
                </span>
              </p>
              {!ok && (
                <div className="flex shrink-0 gap-2 pl-4 sm:pl-0">
                  <button
                    type="button"
                    onClick={() => setApproved((a) => [...a, r.id])}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold"
                    style={{ background: SC[r.s], color: "#0a0b10" }}
                  >
                    Утвердить
                  </button>
                  <button
                    type="button"
                    onClick={() => setDismissed((d) => [...d, r.id])}
                    className="hairline rounded-lg px-3 py-1.5 text-xs font-medium text-muted"
                  >
                    Отклонить
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════ менеджеры (вкладка Продажи) ═══════════════ */
function Managers() {
  const m = [
    { name: "Анна", score: 71, note: "3/4 встреч", s: "ok" as S },
    { name: "Раида", score: 68, note: "1/2", s: "ok" as S },
    { name: "Наталья", score: 55, note: "4/5", s: "warn" as S },
    { name: "Ирина", score: 33, note: "0/3", s: "bad" as S },
    { name: "Ираида", score: 30, note: "0/1", s: "bad" as S },
  ];
  return (
    <div className="hairline rounded-2xl p-5">
      <p className="text-sm font-semibold">Менеджеры · скор 0–100</p>
      <div className="mt-4 space-y-3">
        {m.map((x) => (
          <div key={x.name} className="flex items-center gap-3 text-sm">
            <Dot s={x.s} />
            <span className="w-20 text-muted">{x.name}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--fg) 8%, transparent)" }}>
              <div className="h-full rounded-full" style={{ width: `${x.score}%`, background: SC[x.s] }} />
            </div>
            <span className="w-8 text-right font-semibold tabular-nums">{x.score}</span>
            <span className="w-14 text-right text-xs text-muted">{x.note}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted">57% звонков без следующего шага · норма &lt; 30%</p>
    </div>
  );
}

/* ═══════════════ конфиги вкладок ═══════════════ */
const C = { cyan: "var(--c-cyan)", indigo: "var(--c-indigo)", violet: "var(--c-violet)", warm: "var(--c-warm)" };

type TabId = "svod" | "in" | "sales" | "smm";
type TabCfg = {
  id: TabId;
  label: string;
  kpis: Kpi[];
  charts: ChartCfg[];
  funnel?: boolean;
  managers?: boolean;
  recos: Reco[];
};

const TABS: TabCfg[] = [
  {
    id: "svod",
    label: "Сводный",
    kpis: [
      { label: "Затраты", fact: 4_290_000, plan: 4_500_000, fmtKind: "rubM", s: "ok" },
      { label: "Обращения всего", fact: 1151, plan: 1260, fmtKind: "int", s: "warn" },
      { label: "КЦО (целевые)", fact: 380, plan: 420, fmtKind: "int", s: "warn" },
      { label: "Сделки", fact: 41, plan: 45, fmtKind: "int", s: "warn" },
      { label: "Стоимость КЦО", fact: 11_300, plan: 10_700, fmtKind: "rub", s: "warn", invert: true },
      { label: "CPO (сделка)", fact: 104_600, plan: 100_000, fmtKind: "rub", s: "warn", invert: true },
    ],
    charts: [
      { label: "CPL", seed: 11, type: "ratio", fact: 3_730, plan: 3_570, fmtKind: "rub", color: C.cyan, s: "warn" },
      { label: "Стоимость КЦО", seed: 12, type: "ratio", fact: 11_300, plan: 10_700, fmtKind: "rub", color: C.violet, s: "warn" },
      { label: "CPO", seed: 13, type: "ratio", fact: 104_600, plan: 100_000, fmtKind: "rubK", color: C.warm, s: "warn" },
      { label: "Затраты", seed: 14, type: "sum", fact: 4_290_000, plan: 4_500_000, fmtKind: "rubM", color: C.indigo, s: "ok" },
      { label: "Показы", seed: 15, type: "sum", fact: 2_100_000, plan: 2_400_000, fmtKind: "intK", color: C.indigo, s: "warn" },
      { label: "Клики", seed: 16, type: "sum", fact: 13_200, plan: 14_000, fmtKind: "int", color: C.cyan, s: "warn" },
      { label: "Обращения", seed: 17, type: "sum", fact: 1151, plan: 1260, fmtKind: "int", color: C.indigo, s: "warn" },
      { label: "КЦО", seed: 18, type: "sum", fact: 380, plan: 420, fmtKind: "int", color: C.violet, s: "warn" },
      { label: "Сделки", seed: 19, type: "sum", fact: 41, plan: 45, fmtKind: "int", color: C.warm, s: "warn" },
    ],
    funnel: true,
    recos: [
      { id: "irina", s: "bad", symptom: "Менеджер Ирина: 0/3 встреч, ипотека не предложена в 3/3 звонках", action: "персональный разбор + скрипт ипотеки, таймкоды приложены" },
      { id: "vk", s: "warn", symptom: "Цена КЦО +12%, VK перегрет и тянет стоимость вверх", action: "переложить 15% бюджета VK → Директ, черновик сплита готов" },
      { id: "prit", s: "warn", symptom: "ЖК «Орбита»: CR вал→КЦО 21% — product gap по нижним этажам", action: "вынести на продуктовый разбор, звонки-примеры собраны" },
    ],
  },
  {
    id: "in",
    label: "Входящие",
    kpis: [
      { label: "Обращения всего", fact: 1151, plan: 1260, fmtKind: "int", s: "warn" },
      { label: "КЦО (целевые)", fact: 380, plan: 420, fmtKind: "int", s: "warn" },
      { label: "CPL", fact: 3_730, plan: 3_570, fmtKind: "rub", s: "warn", invert: true },
      { label: "CR вал→КЦО", fact: 33, plan: 36, fmtKind: "pct", s: "warn" },
    ],
    charts: [
      { label: "Показы", seed: 21, type: "sum", fact: 2_100_000, plan: 2_400_000, fmtKind: "intK", color: C.indigo, s: "warn" },
      { label: "Клики", seed: 22, type: "sum", fact: 13_200, plan: 14_000, fmtKind: "int", color: C.cyan, s: "warn" },
      { label: "CTR", seed: 23, type: "ratio", fact: 0.66, plan: 0.61, fmtKind: "pct", color: C.cyan, s: "ok" },
      { label: "Обращения · Директ", seed: 24, type: "sum", fact: 740, plan: 800, fmtKind: "int", color: C.indigo, s: "ok" },
      { label: "Обращения · VK", seed: 25, type: "sum", fact: 215, plan: 340, fmtKind: "int", color: C.violet, s: "bad" },
      { label: "Обращения · Telegram", seed: 26, type: "sum", fact: 46, plan: 120, fmtKind: "int", color: C.cyan, s: "bad" },
      { label: "CPL · Директ", seed: 27, type: "ratio", fact: 3_400, plan: 3_500, fmtKind: "rub", color: C.indigo, s: "ok" },
      { label: "CPL · VK", seed: 28, type: "ratio", fact: 5_100, plan: 4_600, fmtKind: "rub", color: C.violet, s: "bad" },
      { label: "Органика · вал", seed: 29, type: "sum", fact: 150, plan: 175, fmtKind: "int", color: C.warm, s: "warn" },
    ],
    funnel: true,
    recos: [
      { id: "vk2", s: "warn", symptom: "VK: вал −36% к плану и дороже на 11% — аукцион перегрет", action: "переложить 15% бюджета VK → Директ, черновик сплита готов" },
      { id: "tg", s: "bad", symptom: "Telegram Ads: 38% плана по валу, дорогой CPL", action: "пересобрать креативы под сегмент, снизить ставку" },
    ],
  },
  {
    id: "sales",
    label: "Продажи",
    kpis: [
      { label: "Сделки", fact: 41, plan: 45, fmtKind: "int", s: "warn" },
      { label: "Выручка", fact: 492_000_000, plan: 540_000_000, fmtKind: "rubM", s: "warn" },
      { label: "Средний чек", fact: 12_000_000, plan: 12_000_000, fmtKind: "rubM", s: "ok", invert: true },
      { label: "CPO", fact: 104_600, plan: 100_000, fmtKind: "rub", s: "warn", invert: true },
    ],
    charts: [
      { label: "Сделки · прямые (ОП)", seed: 31, type: "sum", fact: 29, plan: 32, fmtKind: "int", color: C.indigo, s: "warn" },
      { label: "Сделки · брокерский", seed: 32, type: "sum", fact: 12, plan: 13, fmtKind: "int", color: C.violet, s: "ok" },
      { label: "Выручка", seed: 33, type: "sum", fact: 492_000_000, plan: 540_000_000, fmtKind: "rubM", color: C.warm, s: "warn" },
      { label: "Встречи", seed: 34, type: "sum", fact: 163, plan: 190, fmtKind: "int", color: C.cyan, s: "bad" },
      { label: "Брони", seed: 35, type: "sum", fact: 51, plan: 59, fmtKind: "int", color: C.indigo, s: "warn" },
      { label: "CR КЦО→встреча", seed: 36, type: "ratio", fact: 43, plan: 50, fmtKind: "pct", color: C.cyan, s: "bad" },
    ],
    managers: true,
    recos: [
      { id: "irina2", s: "bad", symptom: "57% звонков без следующего шага; Ирина — 0/3 встреч", action: "персональный разбор + скрипт ипотеки, таймкоды приложены" },
      { id: "meet", s: "warn", symptom: "CR КЦО→встреча 43% против плана 50% — теряем на записи", action: "командный тренинг по закрытию на конкретную дату" },
    ],
  },
  {
    id: "smm",
    label: "SMM",
    kpis: [
      { label: "Публикации", fact: 15, plan: 24, fmtKind: "int", s: "bad" },
      { label: "Обращения из соц", fact: 57, plan: 70, fmtKind: "int", s: "warn" },
      { label: "Охват VK+TG", fact: 105_000, plan: 110_000, fmtKind: "intK", s: "ok" },
      { label: "Подписчики, +", fact: 680, plan: 900, fmtKind: "int", s: "warn" },
    ],
    charts: [
      { label: "Публикации", seed: 41, type: "sum", fact: 15, plan: 24, fmtKind: "int", color: C.violet, s: "bad" },
      { label: "Охват VK", seed: 42, type: "sum", fact: 84_000, plan: 88_000, fmtKind: "intK", color: C.indigo, s: "ok" },
      { label: "Охват Telegram", seed: 43, type: "sum", fact: 21_000, plan: 22_000, fmtKind: "intK", color: C.cyan, s: "ok" },
      { label: "Вовлечённость", seed: 44, type: "ratio", fact: 3.2, plan: 3.5, fmtKind: "pct", color: C.violet, s: "warn" },
      { label: "Обращения из соц", seed: 45, type: "sum", fact: 57, plan: 70, fmtKind: "int", color: C.warm, s: "warn" },
      { label: "Подписчики, +", seed: 46, type: "sum", fact: 680, plan: 900, fmtKind: "int", color: C.indigo, s: "warn" },
    ],
    recos: [
      { id: "post", s: "bad", symptom: "Темп постинга −37%, 9 постов в долге к контент-плану", action: "догнать до пятницы, черновики 4 постов готовы к вычитке" },
    ],
  },
];

/* ═══════════════ фильтры ═══════════════ */
const PERIODS = [
  { id: "oct", label: "Октябрь 2026", mult: 1, days: 26, labels: ["1 окт", "13 окт", "26 окт"] },
  { id: "sep", label: "Сентябрь 2026", mult: 1.1, days: 26, labels: ["1 сен", "15 сен", "30 сен"] },
  { id: "q3", label: "III квартал", mult: 3.05, days: 26, labels: ["июл", "авг", "сен"] },
];
const OBJECTS = [
  { id: "all", label: "Портфель · 6 ЖК", mult: 1 },
  { id: "pro", label: "Уральский квартал", mult: 0.18 },
  { id: "city", label: "Городской", mult: 0.12 },
  { id: "bluher", label: "Высота Восточная", mult: 0.28 },
  { id: "yar", label: "Высота Северная", mult: 0.16 },
  { id: "tank", label: "Высота Западная", mult: 0.13 },
  { id: "prit", label: "Орбита", mult: 0.15 },
];
const SOURCES = [
  { id: "all", label: "Все источники", mult: 1 },
  { id: "direct", label: "Яндекс.Директ", mult: 0.64 },
  { id: "vk", label: "VK Ads", mult: 0.19 },
  { id: "tg", label: "Telegram Ads", mult: 0.05 },
  { id: "org", label: "Органика", mult: 0.12 },
];

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="hairline cursor-pointer rounded-lg bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors hover:bg-surface2"
    >
      {options.map((o) => (
        <option key={o.id} value={o.id} className="bg-surface text-fg">
          {o.label}
        </option>
      ))}
    </select>
  );
}

/* ═══════════════ приложение ═══════════════ */
export default function DashboardApp() {
  const [tab, setTab] = useState<TabId>("svod");
  const [period, setPeriod] = useState("oct");
  const [obj, setObj] = useState("all");
  const [src, setSrc] = useState("all");

  const P = PERIODS.find((p) => p.id === period)!;
  const O = OBJECTS.find((o) => o.id === obj)!;
  const SRC = SOURCES.find((s) => s.id === src)!;
  const mult = P.mult * O.mult * SRC.mult;
  const cfg = TABS.find((t) => t.id === tab)!;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      {/* липкая шапка: табы + фильтры вместе */}
      <div
        className="glass sticky top-20 z-30 rounded-2xl p-2"
        style={{ background: "color-mix(in oklab, var(--ink) 88%, transparent)" }}
      >
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.id ? "bg-beam text-white" : "text-muted hover:text-fg"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-line px-1 pt-2">
          <span className="text-xs uppercase tracking-wider text-muted">Отчётный период:</span>
          <Select value={period} onChange={setPeriod} options={PERIODS} />
          <Select value={obj} onChange={setObj} options={OBJECTS} />
          <Select value={src} onChange={setSrc} options={SOURCES} />
          <span className="ml-auto hidden text-xs text-muted sm:block">
            {O.label} · {SRC.label} · {P.label}
          </span>
        </div>
      </div>

      {/* KPI-строка */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cfg.kpis.map((k) => (
          <KpiCard key={k.label} k={k} mult={mult} />
        ))}
      </div>

      {/* рекомендации — сразу под KPI, наш слой */}
      <div className="mt-4">
        <RecoBand recos={cfg.recos} />
      </div>

      {/* сетка графиков */}
      <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {cfg.charts.map((c) => (
          <ChartCard key={c.label} c={c} mult={mult} days={P.days} labels={P.labels} />
        ))}
      </div>

      {/* воронка / менеджеры */}
      {(cfg.funnel || cfg.managers) && (
        <div className={`mt-4 grid gap-3 ${cfg.funnel && cfg.managers ? "lg:grid-cols-2" : ""}`}>
          {cfg.funnel && (
            <div className="hairline rounded-2xl p-5">
              <p className="text-sm font-semibold">Воронка · показы → сделки</p>
              <div className="mt-4">
                <Funnel mult={mult} />
              </div>
            </div>
          )}
          {cfg.managers && <Managers />}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted">
        Демо на синтетических данных (порядки застройщика). Фильтры реально пересчитывают все виджеты. На вашем
        контуре — живые данные из amoCRM / Битрикс24, Roistat, Яндекс.Директа и коллтрекинга.
      </p>
    </div>
  );
}
