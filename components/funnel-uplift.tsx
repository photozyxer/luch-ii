"use client";

import { useState } from "react";

/**
 * Две воронки рядом: «сегодня» и «с ЛУЧ» (модельный эффект за 3 месяца).
 * База — порядки одного ЖК в месяц: вал 500, вал→КЦО 30%, вал→сделка 3,5%,
 * средний чек 6 млн ₽. Приросты консервативные, относительные.
 * Клик по этапу правой воронки раскрывает, какие модули дают прирост.
 */

type Contribution = { module: string; why: string };

type Stage = {
  id: string;
  label: string;
  before: number;
  after: number;
  beforeNote?: string;
  afterNote?: string;
  contributions: Contribution[];
};

const STAGES: Stage[] = [
  {
    id: "reach",
    label: "Охваты",
    before: 600_000,
    after: 840_000,
    contributions: [
      {
        module: "ЛУЧ-SMM",
        why: "Живой контент попадает в рекомендации алгоритмов — брендовые охваты растут без рекламной ставки.",
      },
      {
        module: "ЛУЧ-Продакшн",
        why: "Свежие креативы под каждый канал не выгорают: охваты не проседают от баннерной слепоты.",
      },
    ],
  },
  {
    id: "clicks",
    label: "Клики",
    before: 12_000,
    after: 15_000,
    contributions: [
      {
        module: "ЛУЧ-Перформанс",
        why: "Ежедневная чистка запросов и площадок + тесты креативов: CTR растёт, клик дешевеет.",
      },
    ],
  },
  {
    id: "leads",
    label: "Обращения (вал)",
    before: 500,
    after: 610,
    contributions: [
      {
        module: "ЛУЧ-Перформанс",
        why: "Бюджет перетекает в каналы с дешёвым обращением — вала больше за те же деньги (+15%).",
      },
      {
        module: "ЛУЧ-SMM",
        why: "Брендовый спрос: люди приходят сами из соцсетей и поиска по названию ЖК (+7%).",
      },
    ],
  },
  {
    id: "kco",
    label: "Целевые (КЦО)",
    before: 150,
    after: 201,
    beforeNote: "30% вала",
    afterNote: "33% вала",
    contributions: [
      {
        module: "ЛУЧ-Оператор",
        why: "Голосовой ИИ берёт 100% входящих звонков, включая ночные, выходные и пропущенные с занятой линии — обращения, которые раньше терялись в гудках, доходят до квалификации.",
      },
      {
        module: "ЛУЧ-Консультант",
        why: "Сайт даёт ~20% вала. Консультант отвечает мгновенно и ночью — часть «потеряшек» доходит до разговора (+20% к конверсии сайтовых обращений).",
      },
      {
        module: "ЛУЧ-SMM",
        why: "Обращения от людей, знающих проект по соцсетям, целевые заметно чаще холодного трафика.",
      },
    ],
  },
  {
    id: "books",
    label: "Брони",
    before: 26,
    after: 38,
    contributions: [
      {
        module: "ЛУЧ-Звонки",
        why: "Прослушано 100% звонков: видно, какой менеджер на каком шаге теряет клиента. Работа со скриптом возвращает часть потерь.",
      },
      {
        module: "ЛУЧ-Консультант",
        why: "Догрев «долгих» клиентов: напоминания об акциях и подобранных лотах возвращают к брони.",
      },
    ],
  },
  {
    id: "deals",
    label: "Сделки",
    before: 18,
    after: 26,
    beforeNote: "3,5% вала",
    afterNote: "4,3% вала",
    contributions: [
      {
        module: "ЛУЧ-Аналитика + ЛУЧ-Дашборд",
        why: "План-факт каждый день и рекомендации «что сделать сегодня»: отклонения чинятся за дни, а не в отчёте за квартал.",
      },
    ],
  },
];

const REVENUE = { before: 108, after: 156 }; // млн ₽/мес при чеке 6 млн

const fmt = (n: number) => n.toLocaleString("ru-RU");

/** Ширины «этажей» воронки, % — фиксированная лесенка для читаемой формы. */
const WIDTHS = [100, 86, 72, 58, 45, 33];

function FunnelColumn({
  title,
  kind,
  onStageClick,
  openStage,
}: {
  title: string;
  kind: "before" | "after";
  onStageClick?: (id: string) => void;
  openStage?: string | null;
}) {
  const isAfter = kind === "after";
  return (
    <div>
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted">
        {title}
      </p>
      <div className="mt-4 flex flex-col items-center gap-1.5">
        {STAGES.map((s, i) => {
          const value = isAfter ? s.after : s.before;
          const note = isAfter ? s.afterNote : s.beforeNote;
          const delta = Math.round((s.after / s.before - 1) * 100);
          const open = isAfter && openStage === s.id;
          return (
            <button
              key={s.id}
              type="button"
              disabled={!isAfter}
              onClick={() => onStageClick?.(s.id)}
              className={`relative flex flex-col items-center justify-center py-2.5 text-center transition-all sm:py-3 ${
                isAfter ? "cursor-pointer hover:brightness-110" : "cursor-default"
              }`}
              style={{
                width: `${WIDTHS[i]}%`,
                clipPath: "polygon(0 0, 100% 0, 93% 100%, 7% 100%)",
                background: isAfter
                  ? `linear-gradient(90deg, color-mix(in oklab, var(--c-cyan) ${80 - i * 9}%, var(--c-indigo)), color-mix(in oklab, var(--c-violet) ${55 + i * 7}%, var(--c-indigo)))`
                  : "rgba(255,255,255,0.09)",
                outline: open ? "2px solid rgba(255,255,255,0.6)" : "none",
                outlineOffset: -2,
              }}
            >
              <span className={`text-[11px] leading-none ${isAfter ? "text-white/75" : "text-muted"}`}>
                {s.label}
                {note ? ` · ${note}` : ""}
              </span>
              <span className={`mt-1 font-display text-sm font-semibold leading-none sm:text-base ${isAfter ? "text-white" : "text-fg/80"}`}>
                {fmt(value)}
                {isAfter && (
                  <span className="ml-1.5 text-[11px] font-semibold text-cyan-200">
                    +{delta}%
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      {/* выручка — результат под воронкой */}
      <div
        className={`mx-auto mt-3 w-[55%] rounded-xl px-3 py-3 text-center ${
          isAfter ? "" : "hairline"
        }`}
        style={
          isAfter
            ? {
                background:
                  "linear-gradient(90deg, color-mix(in oklab, var(--c-cyan) 25%, transparent), color-mix(in oklab, var(--c-violet) 30%, transparent))",
                border: "1px solid rgba(255,255,255,0.18)",
              }
            : undefined
        }
      >
        <p className="text-[11px] text-muted">Выручка, млн ₽/мес</p>
        <p className="mt-1 font-display text-xl font-semibold sm:text-2xl">
          {isAfter ? (
            <>
              {REVENUE.after}
              <span className="ml-2 text-sm font-semibold text-cyan">
                +{Math.round((REVENUE.after / REVENUE.before - 1) * 100)}%
              </span>
            </>
          ) : (
            REVENUE.before
          )}
        </p>
      </div>
    </div>
  );
}

export default function FunnelUplift() {
  const [openStage, setOpenStage] = useState<string | null>("kco");
  const [mobileView, setMobileView] = useState<"before" | "after">("after");
  const active = STAGES.find((s) => s.id === openStage);

  return (
    <div>
      {/* мобильный переключатель было/стало — на десктопе воронки рядом */}
      <div className="mb-6 flex justify-center gap-2 sm:hidden">
        {([
          { id: "before", label: "Сегодня" },
          { id: "after", label: "С модулями ЛУЧ" },
        ] as const).map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => setMobileView(v.id)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
              mobileView === v.id
                ? "border-transparent bg-beam text-white"
                : "border-white/12 text-muted"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="grid gap-10 sm:grid-cols-2 sm:gap-6 lg:gap-14">
        <div className={`${mobileView === "before" ? "block" : "hidden"} sm:block`}>
          <FunnelColumn title="Сегодня" kind="before" />
        </div>
        <div className={`${mobileView === "after" ? "block" : "hidden"} sm:block`}>
          <FunnelColumn
            title="С модулями ЛУЧ"
            kind="after"
            openStage={openStage}
            onStageClick={(id) => setOpenStage(openStage === id ? null : id)}
          />
        </div>
      </div>

      {/* пояснение по выбранному этапу */}
      {active && (
        <div className="glass mt-8 rounded-2xl p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display text-base font-semibold">
              {active.label}: {fmt(active.before)} → {fmt(active.after)}
            </p>
            <span className="rounded-full bg-cyan/15 px-2.5 py-1 text-xs font-semibold text-cyan">
              +{Math.round((active.after / active.before - 1) * 100)}%
            </span>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {active.contributions.map((c) => (
              <div key={c.module} className="hairline rounded-xl p-4">
                <p className="text-sm font-semibold">{c.module}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{c.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-6 text-xs leading-relaxed text-muted/70">
        Модельный расчёт на горизонте 3 месяцев, цифры — порядки одного ЖК
        комфорт-класса в месяц: вал 500 обращений, в целевое конвертируется
        30%, в сделку — 3,5% вала, средний чек 6 млн ₽. У застройщика уже
        настроены реклама, КЦ и CRM — модули наращивают существующую воронку,
        а не строят её с нуля. Приросты — консервативные относительные оценки;
        стартовая точка у каждого проекта своя, вашу посчитаем на первой
        встрече. Нажмите на этап правой воронки — покажем, какие модули дают
        прирост.
      </p>
    </div>
  );
}
