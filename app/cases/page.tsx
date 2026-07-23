import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import PageIntro from "@/components/page-intro";
import Reveal from "@/components/reveal";
import GlowCard from "@/components/glow-card";
import Stat from "@/components/stat";

export const metadata = pageMeta({
  title: "Кейсы в недвижимости — цифры под NDA",
  description:
    "Кейсы performance-продвижения недвижимости: жилые комплексы и загородные посёлки. Цифры вместо имён — названия проектов под NDA.",
  path: "/cases",
});

type Case = {
  segment: string;
  geo: string;
  period: string;
  color: string;
  services: string[];
  story: string;
  metrics: { value: number; prefix?: string; suffix?: string; label: string }[];
  note?: string;
};

const cases: Case[] = [
  {
    segment: "Семейный район комфорт-класса",
    geo: "пригород Екатеринбурга",
    period: "65 месяцев, продолжается",
    color: "var(--c-cyan)",
    services: ["Performance", "Сквозная аналитика", "Прайс-площадки", "Outdoor"],
    story:
      "Самый долгий наш контракт: ведём проект с 2019 года — через ковид, льготную ипотеку и её отмену. Когда рынок штормит, побеждает не креатив, а управляемость: план-факт каждую неделю и быстрые пересплиты бюджета между каналами.",
    metrics: [
      { value: 65, suffix: " мес", label: "непрерывной работы" },
      { value: 300, prefix: "до ", label: "целевых обращений в месяц на пике" },
      { value: 11, suffix: "%", label: "обращений доходит до сделки" },
      { value: 87, suffix: " т.₽", label: "стоимость сделки (CPO)" },
    ],
  },
  {
    segment: "ЖК комфорт-класса",
    geo: "Челябинск",
    period: "7 месяцев",
    color: "var(--c-indigo)",
    services: ["Performance", "Brandformance", "Сквозная аналитика"],
    story:
      "Зашли на проект с жёстким планом по обращениям. Первым делом поставили сквозную аналитику — чтобы спорить не про «чьи лиды лучше», а про цифры из одного источника. Дальше — методичная чистка каналов.",
    metrics: [
      { value: 90, suffix: "%+", label: "выполнение плана по целевым обращениям" },
      { value: 7, suffix: " каналов", label: "в связке: Директ, VK, Циан, Авито и другие" },
    ],
  },
  {
    segment: "Коттеджный посёлок премиум-класса",
    geo: "Челябинск",
    period: "9 месяцев",
    color: "var(--c-violet)",
    services: ["Позиционирование", "Сайт", "Performance", "Сквозная аналитика"],
    story:
      "Редкий случай, когда делали проект «с нуля»: позиционирование, сайт, запуск рекламы. Премиум за городом — узкая аудитория, где дёшево купить трафик невозможно, зато можно дёшево купить качественный лид, если не платить за случайных.",
    metrics: [
      { value: 2200, suffix: " ₽", label: "цена валового обращения (CPA)" },
      { value: 6900, suffix: " ₽", label: "цена качественного лида (CPL)" },
    ],
  },
  {
    segment: "Коттеджный посёлок у озера",
    geo: "Челябинская область",
    period: "17 месяцев",
    color: "var(--c-warm)",
    services: ["Performance", "Сквозная аналитика", "Прайс-площадки"],
    story:
      "Загородка с ярко выраженной сезонностью: летом спрос есть, зимой — тишина. Настроили воронку так, чтобы зимние месяцы работали на прогрев, а сезон снимал сливки.",
    metrics: [
      { value: 2600, suffix: " ₽", label: "цена валового обращения (CPA)" },
      { value: 7400, suffix: " ₽", label: "цена качественного лида (CPL)" },
      { value: 2, suffix: " сделки/мес", label: "в строительный сезон" },
    ],
    note: "Сезонный спрос — метрики усреднены за весь период, включая низкий сезон.",
  },
  {
    segment: "Индивидуальная загородная недвижимость",
    geo: "Урал",
    period: "проектная работа",
    color: "var(--c-cyan)",
    services: ["Performance", "Лидогенерация"],
    story:
      "ИЖС продаётся через экскурсию на участок: наша задача была довезти клиента до неё максимально дёшево. Считали всю цепочку — от клика до выезда и до договора.",
    metrics: [
      { value: 1200, suffix: " ₽", label: "цена обращения (CPA)" },
      { value: 12000, suffix: " ₽", label: "стоимость экскурсии на объект" },
      { value: 24000, suffix: " ₽", label: "стоимость договора (CPO)" },
    ],
  },
];

export default function CasesPage() {
  return (
    <>
      <PageIntro
        kicker="Кейсы"
        color="var(--c-cyan)"
        title={
          <>
            Цифры вместо имён — <span className="text-spectrum">имена под NDA</span>
          </>
        }
        lead="Мы не публикуем названия проектов и застройщиков: так честнее перед клиентами и спокойнее их юристам. Все цифры реальные — на встрече покажем кейсы с деталями и источниками."
      />

      <section className="pb-8">
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">
          {cases.map((c, i) => (
            <Reveal key={c.segment + c.geo}>
              <GlowCard
                className="glass overflow-hidden rounded-3xl p-7 sm:p-10"
                color={c.color}
              >
                <div data-reveal className="relative">
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl"
                    style={{ background: c.color }}
                    aria-hidden
                  />

                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                    <span className="num-ghost text-5xl">{`0${i + 1}`}</span>
                    <h2 className="font-display text-xl font-semibold sm:text-2xl">
                      {c.segment}
                    </h2>
                    <span className="text-sm text-muted">
                      {c.geo} · {c.period}
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {c.services.map((s) => (
                      <span
                        key={s}
                        className="hairline rounded-full px-3 py-1 text-xs text-muted"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                    <p className="leading-relaxed text-muted">{c.story}</p>
                    <div className="grid grid-cols-2 gap-5 self-center">
                      {c.metrics.map((m) => (
                        <div key={m.label}>
                          <p className="font-display text-2xl font-semibold sm:text-3xl">
                            <Stat value={m.value} prefix={m.prefix} suffix={m.suffix} />
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-muted">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {c.note && (
                    <p className="mt-5 text-xs text-muted">* {c.note}</p>
                  )}
                </div>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 sm:py-28">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <div
            data-reveal
            className="glass noise relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-16"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-50 blur-3xl"
              style={{
                background: "linear-gradient(90deg, var(--c-cyan), var(--c-violet))",
              }}
              aria-hidden
            />
            <p className="relative font-display text-2xl font-semibold sm:text-3xl">
              Хотите такие же цифры по своему проекту?
            </p>
            <p className="relative mx-auto mt-3 max-w-xl leading-relaxed text-muted">
              Расскажите про объект — покажем релевантные кейсы с деталями и
              посчитаем прогноз по вашему рынку.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contacts?topic=tender"
                className="glow-beam rounded-xl bg-beam px-6 py-3.5 font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                Обсудить проект
              </Link>
              <Link
                href="/contacts?topic=calls"
                className="glass rounded-xl px-6 py-3.5 font-semibold text-fg transition-colors hover:text-white"
              >
                Разбор 50 звонков — бесплатно
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
