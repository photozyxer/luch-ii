"use client";

import { useState } from "react";

/**
 * CJM застройщика: путь клиента от первого касания до покупки,
 * и какие ИИ-модули ЛУЧ работают на каждом шаге.
 * На мобиле шаги свёрнуты в аккордеон, на десктопе раскрыты всегда.
 */

type CjmStep = {
  step: string;
  client: string;
  modules: { name: string; role: string; color: string }[];
};

const STEPS: CjmStep[] = [
  {
    step: "Узнаёт о проекте",
    client: "Видит ЖК в соцсетях, рекламе, у блогеров — бренд входит в шорт-лист.",
    modules: [
      { name: "ЛУЧ-SMM", role: "живые соцсети, рекомендации алгоритмов", color: "var(--c-warm)" },
      { name: "ЛУЧ-Продакшн", role: "креативы и ролики под каждый канал", color: "var(--c-cyan)" },
    ],
  },
  {
    step: "Изучает и сравнивает",
    client: "Смотрит цены, планировки, конкурентов. Реклама должна догнать в нужный момент.",
    modules: [
      { name: "ЛУЧ-Перформанс", role: "Директ, таргет, прайс-площадки", color: "var(--c-violet)" },
      { name: "ЛУЧ-Аналитика", role: "цены и офферы конкурентов — под контролем", color: "var(--c-indigo)" },
    ],
  },
  {
    step: "Обращается",
    client: "Пишет в чат или звонит — часто вечером или ночью, когда офис не работает.",
    modules: [
      { name: "ЛУЧ-Оператор", role: "берёт входящий звонок голосом, 24/7", color: "var(--c-violet)" },
      { name: "ЛУЧ-Консультант", role: "чат на сайте и в мессенджерах, квалифицирует лид", color: "var(--c-indigo)" },
    ],
  },
  {
    step: "Говорит с менеджером",
    client: "Один разговор решает: продвинется сделка или лид «подумает и пропадёт».",
    modules: [
      { name: "ЛУЧ-Звонки", role: "разбор 100% звонков, работа с менеджерами", color: "var(--c-cyan)" },
    ],
  },
  {
    step: "Выбирает и бронирует",
    client: "Сравнивает лоты, тянет с решением — нужен точный догрев, а не спам.",
    modules: [
      { name: "ЛУЧ-Продакшн", role: "карточки квартир, шахматка, AI-staging", color: "var(--c-cyan)" },
      { name: "ЛУЧ-Консультант", role: "напоминает про акции и подобранные лоты", color: "var(--c-indigo)" },
    ],
  },
  {
    step: "Покупает",
    client: "Сделка закрыта. Для команды — момент сверить план и факт по всей воронке.",
    modules: [
      { name: "ЛУЧ-Дашборд", role: "план-факт всего пути, рекомендации", color: "var(--c-indigo)" },
      { name: "ЛУЧ-Аналитика", role: "прогноз следующего месяца", color: "var(--c-violet)" },
    ],
  },
];

export default function CjmMap() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
      {STEPS.map((s, i) => {
        const open = expanded === i;
        return (
        <div
          key={s.step}
          onClick={() => setExpanded(open ? null : i)}
          className="hairline relative cursor-pointer rounded-2xl p-4 sm:cursor-default sm:p-5"
        >
          {/* стрелка к следующему шагу */}
          {i < STEPS.length - 1 && (
            <span
              className="absolute -right-3.5 top-7 z-10 hidden text-muted/50 lg:[&:nth-child(n)]:inline"
              aria-hidden
            >
              →
            </span>
          )}
          <div className="flex w-full items-baseline gap-3 text-left">
            <span className="num-ghost text-4xl">{`0${i + 1}`}</span>
            <p className="flex-1 font-display text-base font-semibold leading-snug">{s.step}</p>
            <span
              className={`text-xs text-muted transition-transform sm:hidden ${open ? "rotate-180" : ""}`}
              aria-hidden
            >
              ⌄
            </span>
          </div>
          <div className={`${open ? "block" : "hidden"} sm:block`}>
          <p className="mt-2 text-xs leading-relaxed text-muted">{s.client}</p>
          <div className="mt-4 space-y-2">
            {s.modules.map((m) => (
              <div
                key={m.name}
                className="flex items-baseline gap-2 rounded-lg px-3 py-2"
                style={{
                  background: `color-mix(in oklab, ${m.color} 9%, transparent)`,
                  border: `1px solid color-mix(in oklab, ${m.color} 22%, transparent)`,
                }}
              >
                <span className="text-xs font-semibold" style={{ color: m.color }}>
                  {m.name}
                </span>
                <span className="text-[11px] leading-snug text-muted">{m.role}</span>
              </div>
            ))}
          </div>
          </div>
        </div>
        );
      })}
    </div>
  );
}
