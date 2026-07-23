import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import PageIntro from "@/components/page-intro";
import Reveal from "@/components/reveal";
import GlowCard from "@/components/glow-card";
import Marquee from "@/components/marquee";

export const metadata = pageMeta({
  title: "Услуги performance-агентства для застройщиков",
  description:
    "Performance, SMM, продакшн, аналитика и стратегия для застройщиков. Руками команды, на скорости ИИ. Отвечаем обращениями и сделками, а не часами.",
  path: "/agency",
});

const services = [
  {
    id: "performance",
    color: "var(--c-cyan)",
    name: "Performance-продвижение",
    pitch:
      "Ведём весь платный трафик проекта: от медиаплана до еженедельного план-факта. Оптимизируем не по кликам, а по целевым обращениям и их цене.",
    bullets: [
      "Яндекс.Директ и VK Ads — контекст и таргет",
      "Прайс-площадки: Авито, Циан, ДомКлик, Яндекс.Недвижимость",
      "Telegram Ads и CPA-сети под задачи объёма",
      "Медиаплан с прогнозом КЦО и защита бюджета",
      "Еженедельный план-факт: что идёт по плану, что чиним",
    ],
    result: "Целевые обращения по плану — и понятная цена каждого.",
  },
  {
    id: "smm",
    color: "var(--c-warm)",
    name: "SMM и сообщества",
    pitch:
      "Соцсети ЖК — это не «постики», а витрина стройки и работа с репутацией. Контент собирает ИИ, публикует и отвечает за тон — человек.",
    bullets: [
      "Контент-план, тексты и макеты в фирменном стиле проекта",
      "Ведение сообществ ЖК в VK и Telegram",
      "Работа с негативом: дольщики, отзовики, форумы",
      "Мониторинг сообществ конкурентов: офферы, акции, реакция аудитории",
      "Отчёт не «охватами», а подписчиками из целевой географии и обращениями",
    ],
    result: "Живые сообщества, которые продают и гасят негатив до того, как он разгорится.",
  },
  {
    id: "production",
    color: "var(--c-violet)",
    name: "Продакшн и дизайн",
    pitch:
      "Креативы больше не узкое горлышко запуска. Генерим и собираем за минуты то, на что у студий уходят недели, — рука дизайнера остаётся на финале.",
    bullets: [
      "Рекламные баннеры и видеоролики под каждый канал",
      "AI-staging: меблировка и стилизация квартир по рендерам и фото",
      "Карточки квартир из проектной документации — планировка, стороны света, метражи",
      "Рендеры видов из окон по этажам",
      "Шахматка наличия на сайт — без покупки отдельного сервиса",
    ],
    result: "Полный комплект носителей под запуск — быстрее, чем согласуется бриф у студии.",
  },
  {
    id: "analytics",
    color: "var(--c-indigo)",
    name: "Аналитика и сквозная отчётность",
    pitch:
      "Ставим систему, в которой видно путь денег: от показа до брони. И отвечаем на главный вопрос — выполним план или нет, пока ещё можно успеть.",
    bullets: [
      "Внедрение сквозной аналитики: Roistat, Smartis, Calltouch, CoMagic",
      "Связка с CRM: amoCRM, Битрикс24, MacroCRM",
      "Прогноз продаж от прокси-метрик — за месяцы до сделок",
      "Конкурентный мониторинг: спрос в Wordstat, витрины, цены, акции",
      "Рекомендации по ценообразованию на основе рынка",
    ],
    result: "План-факт, которому верит и маркетинг, и коммерческий директор.",
  },
  {
    id: "strategy",
    color: "var(--c-cyan)",
    name: "Стратегия и запуск проекта",
    pitch:
      "Подключаемся до старта продаж: помогаем упаковать проект так, чтобы реклама работала не вопреки позиционированию, а вместе с ним.",
    bullets: [
      "Разработка позиционирования и платформы бренда ЖК",
      "Нейминг с проверкой охраноспособности",
      "Медиастратегия запуска и выхода на план",
      "Разработка сайта проекта",
      "Тендерная защита с медиапланом и прогнозом",
    ],
    result: "Проект, готовый к продажам: имя, упаковка, сайт и план запуска.",
  },
];

const steps = [
  {
    n: "01",
    title: "Тендер или аудит",
    desc: "Заходим через тендер с медиапланом — или начинаем с бесплатного разбора 50 звонков и аудита текущей рекламы.",
  },
  {
    n: "02",
    title: "План и KPI",
    desc: "Фиксируем цели в целевых обращениях и их цене. Вы видите прогноз до старта, а не после отчёта.",
  },
  {
    n: "03",
    title: "Ведение и план-факт",
    desc: "Еженедельные статусы: что по плану, что отклонилось, что делаем. Без «красивых отчётов» — только решения.",
  },
];

const tools = [
  "Яндекс.Директ",
  "VK Ads",
  "Telegram Ads",
  "Авито",
  "Циан",
  "ДомКлик",
  "Яндекс.Недвижимость",
  "CPA-сети",
  "Roistat",
  "Smartis",
  "Calltouch",
  "CoMagic",
  "amoCRM",
  "Битрикс24",
  "MacroCRM",
];

export default function AgencyPage() {
  return (
    <>
      <PageIntro
        kicker="Услуги агентства"
        color="var(--c-cyan)"
        title={
          <>
            Руками команды — <span className="text-spectrum">на скорости ИИ</span>
          </>
        }
        lead="Пять услуг, которые обычно разложены по пяти подрядчикам, — у нас в одном договоре. Под капотом каждой работает та же ИИ-система, что мы продаём модулями: поэтому дешевле и быстрее."
      />

      {/* --- Услуги --- */}
      <section className="pb-8">
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">
          {services.map((s, i) => (
            <Reveal key={s.id}>
              <GlowCard
                className="glass scroll-mt-28 rounded-3xl p-7 sm:p-10"
                color={s.color}
              >
                <div id={s.id} data-reveal className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
                  <div>
                    <span className="num-ghost text-6xl">{`0${i + 1}`}</span>
                    <h2 className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
                      {s.name}
                    </h2>
                    <p className="mt-4 leading-relaxed text-muted">{s.pitch}</p>
                    <p className="mt-6 border-l-2 pl-4 text-sm leading-relaxed" style={{ borderColor: s.color }}>
                      {s.result}
                    </p>
                  </div>
                  <ul className="space-y-3 self-center">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex gap-3 text-sm leading-relaxed text-muted">
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: s.color }}
                          aria-hidden
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --- Как начинается работа --- */}
      <section className="py-24 sm:py-28">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <p data-reveal className="kicker">
            Как начинается работа
          </p>
          <h2
            data-reveal
            className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl"
          >
            Три шага до первого план-факта
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((st) => (
              <div key={st.n} data-reveal className="hairline rounded-2xl p-7">
                <span className="num-ghost text-5xl">{st.n}</span>
                <h3 className="mt-4 font-display text-lg font-semibold">{st.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{st.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <Marquee items={tools} />

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
                background: "linear-gradient(90deg, var(--c-cyan), var(--c-indigo))",
              }}
              aria-hidden
            />
            <p className="relative font-display text-2xl font-semibold sm:text-3xl">
              Выбираете подрядчика?
            </p>
            <p className="relative mx-auto mt-3 max-w-xl leading-relaxed text-muted">
              Пригласите нас в тендер — придём с медиапланом и прогнозом
              обращений. Или начните со сметы: посчитаем ваш проект за 2 дня.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contacts?topic=tender"
                className="glow-beam rounded-xl bg-beam px-6 py-3.5 font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                Пригласить в тендер
              </Link>
              <Link
                href="/contacts?topic=estimate"
                className="glass rounded-xl px-6 py-3.5 font-semibold text-fg transition-colors hover:text-white"
              >
                Рассчитать смету
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
