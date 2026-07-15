import Link from "next/link";
import Hero from "@/components/hero";
import Reveal from "@/components/reveal";
import GlowCard from "@/components/glow-card";
import Marquee from "@/components/marquee";
import Stat from "@/components/stat";

const pains = [
  {
    quote: "Целевые обращения есть, а сделок нет",
    detail:
      "Реклама отчитывается лидами, отдел продаж — «лиды плохие». Где на самом деле теряются деньги, не знает никто.",
  },
  {
    quote: "Пять подрядчиков, и у каждого всё хорошо",
    detail:
      "Директолог, таргетолог, SMM, аналитик и колл-центр шлют красивые отчёты. В кассе это не сходится.",
  },
  {
    quote: "Отчёты приходят, решения — нет",
    detail:
      "Таблицы с цифрами есть у всех. Ответа «что именно сделать завтра, чтобы выполнить план» — ни у кого.",
  },
];

const agents = [
  {
    id: "calls",
    tag: "Продажи · КЦ",
    title: "Анализ звонков",
    desc: "Слушает каждый звонок: чек-лист, скрипт, отработка возражений. Показывает, какой менеджер теряет сделки и на чём именно.",
    live: true,
    color: "var(--c-cyan)",
  },
  {
    id: "analytics",
    tag: "Аналитика",
    title: "Сквозная + план-факт",
    desc: "Сводит рекламу и продажи в одну картину: прогноз от прокси-метрик до сделок, мониторинг цен и активности конкурентов.",
    color: "var(--c-indigo)",
  },
  {
    id: "performance",
    tag: "Performance",
    title: "ИИ ведёт рекламу",
    desc: "Сам настраивает и оптимизирует Директ и таргет, следит за прайс-площадками. Изменения утверждает человек — факапы не проходят.",
    color: "var(--c-violet)",
  },
  {
    id: "smm",
    tag: "SMM",
    title: "Соцсети и сообщества",
    desc: "Пишет посты, собирает макеты, публикует и следит за реакцией в сообществах ЖК. Черновики делает ИИ, финальное слово — за человеком.",
    color: "var(--c-warm)",
  },
  {
    id: "production",
    tag: "Продакшн",
    title: "Креативы и карточки",
    desc: "Баннеры, ролики, AI-staging, карточки квартир из проектной документации и шахматка на сайт — за минуты, а не недели.",
    color: "var(--c-cyan)",
  },
  {
    id: "consultant",
    tag: "Консультант ЖК",
    title: "Отвечает 24/7",
    desc: "Чат на сайте и в мессенджерах: подбирает лоты, рассказывает про акции, квалифицирует лид и передаёт его в отдел продаж тёплым.",
    color: "var(--c-indigo)",
  },
];

const tools = [
  "Яндекс.Директ",
  "VK Ads",
  "Авито",
  "Циан",
  "ДомКлик",
  "Яндекс.Недвижимость",
  "Telegram Ads",
  "CPA-сети",
  "Roistat",
  "Smartis",
  "Calltouch",
  "CoMagic",
  "amoCRM",
  "Битрикс24",
  "MacroCRM",
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* --- Боль: три цитаты комдира --- */}
      <section className="py-24 sm:py-32">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <p data-reveal className="kicker">
            Знакомо?
          </p>
          <h2
            data-reveal
            className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-5xl"
          >
            Воронка рвётся <span className="text-spectrum">на стыках подрядчиков</span>
          </h2>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {pains.map((p, i) => (
              <GlowCard
                key={p.quote}
                className="glass rounded-2xl p-7"
                color="var(--c-violet)"
              >
                <div data-reveal>
                  <span className="num-ghost text-5xl">{`0${i + 1}`}</span>
                  <p className="mt-4 font-display text-lg font-semibold leading-snug">
                    «{p.quote}»
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{p.detail}</p>
                </div>
              </GlowCard>
            ))}
          </div>

          <p data-reveal className="mt-10 max-w-3xl text-lg leading-relaxed text-muted">
            Деньги теряются между рекламой, колл-центром и отделом продаж —
            там, где кончается зона ответственности одного подрядчика и ещё не
            началась зона другого. Поэтому мы держим воронку целиком:{" "}
            <span className="text-fg">одной командой и одной системой, от первого клика до брони</span>.
          </p>
        </Reveal>
      </section>

      {/* --- Две линии: сделаем сами / дадим инструмент --- */}
      <section id="offer" className="scroll-mt-24 py-8 sm:py-12">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <p data-reveal className="kicker">
            Два способа работать с нами
          </p>
          <h2
            data-reveal
            className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-5xl"
          >
            Сделаем за вас — <span className="text-spectrum">или дадим инструмент</span>
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <GlowCard className="glass rounded-3xl p-8" color="var(--c-cyan)">
              <div data-reveal>
                <div className="text-sm font-semibold text-cyan">Услуги агентства</div>
                <h3 className="mt-3 font-display text-2xl font-semibold">
                  Берём воронку под ключ
                </h3>
                <p className="mt-3 leading-relaxed text-muted">
                  Стратегия, performance, SMM, продакшн и аналитика — руками
                  нашей команды. ИИ работает под капотом: делаем быстрее
                  обычного агентства, а отвечаем не часами, а обращениями и
                  сделками.
                </p>
                <Link
                  href="/agency"
                  className="mt-6 inline-block font-semibold text-fg transition-colors hover:text-cyan"
                >
                  Что входит →
                </Link>
              </div>
            </GlowCard>

            <GlowCard className="glass rounded-3xl p-8" color="var(--c-violet)">
              <div data-reveal>
                <div className="text-sm font-semibold text-violet">ИИ-система ЛУЧ</div>
                <h3 className="mt-3 font-display text-2xl font-semibold">
                  Подключите модули себе
                </h3>
                <p className="mt-3 leading-relaxed text-muted">
                  Свой отдел маркетинга справляется? Усильте его отдельными
                  агентами: анализ звонков, дашборд план-факт, ИИ-консультант
                  на сайт. Платите за модуль, а не за штат.
                </p>
                <Link
                  href="/system"
                  className="mt-6 inline-block font-semibold text-fg transition-colors hover:text-violet"
                >
                  Смотреть агентов →
                </Link>
              </div>
            </GlowCard>
          </div>
        </Reveal>
      </section>

      {/* --- Сетка агентов --- */}
      <section id="agents" className="scroll-mt-24 py-24 sm:py-32">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6" stagger={0.06}>
          <p data-reveal className="kicker">
            Что под капотом
          </p>
          <h2
            data-reveal
            className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl"
          >
            Шесть агентов — по одному на каждую вертикаль
          </h2>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => (
              <Link key={a.id} href={`/system#${a.id}`} data-reveal className="group">
                <GlowCard
                  className="glass relative h-full overflow-hidden rounded-2xl p-6 transition-transform duration-300 group-hover:-translate-y-1"
                  color={a.color}
                >
                  <div
                    className="absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-60"
                    style={{ background: a.color }}
                    aria-hidden
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                      {a.tag}
                    </span>
                    {a.live && (
                      <span className="rounded-full bg-cyan/15 px-2 py-0.5 text-[11px] font-semibold text-cyan">
                        уже в работе
                      </span>
                    )}
                  </div>
                  <h3 className="relative mt-4 font-display text-xl font-semibold">
                    {a.title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-muted">
                    {a.desc}
                  </p>
                </GlowCard>
              </Link>
            ))}
          </div>

          {/* дашборд — дирижёр агентов */}
          <GlowCard
            className="glass mt-5 overflow-hidden rounded-2xl p-7 sm:p-9"
            color="var(--c-indigo)"
          >
            <div data-reveal className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Командный центр
                </span>
                <h3 className="mt-3 font-display text-xl font-semibold sm:text-2xl">
                  Дашборд ЛУЧ дирижирует всеми агентами
                </h3>
                <p className="mt-2 leading-relaxed text-muted">
                  Каждое утро — статусы и флаги в Telegram: что отклонилось от
                  плана и что с этим делать. А если нужно больше — спросите
                  словами, ответит по актуальным данным.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/dashboard"
                  className="glow-beam rounded-xl bg-beam px-5 py-3 text-center text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
                >
                  Живое демо →
                </Link>
                <Link
                  href="/system#dashboard"
                  className="text-center font-semibold text-fg transition-colors hover:text-indigo"
                >
                  Как это устроено
                </Link>
              </div>
            </div>
          </GlowCard>
        </Reveal>
      </section>

      {/* --- Кейсы-тизер --- */}
      <section className="py-8 sm:py-12">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <p data-reveal className="kicker">
            Кейсы
          </p>
          <h2
            data-reveal
            className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl"
          >
            Цифры вместо имён — <span className="text-spectrum">имена под NDA</span>
          </h2>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <GlowCard className="glass rounded-2xl p-7" color="var(--c-cyan)">
              <div data-reveal>
                <p className="text-sm text-muted">Семейный район, пригород Екатеринбурга</p>
                <p className="mt-3 font-display text-4xl font-semibold">
                  <Stat value={65} suffix=" мес" />
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  ведём проект без перерыва — до 300 целевых обращений в месяц,
                  11% доходят до сделки
                </p>
              </div>
            </GlowCard>
            <GlowCard className="glass rounded-2xl p-7" color="var(--c-indigo)">
              <div data-reveal>
                <p className="text-sm text-muted">ЖК комфорт-класса, Челябинск</p>
                <p className="mt-3 font-display text-4xl font-semibold">
                  <Stat value={90} prefix="" suffix="%+" />
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  плана по целевым обращениям — уже с первых 7 месяцев работы
                </p>
              </div>
            </GlowCard>
            <GlowCard className="glass rounded-2xl p-7" color="var(--c-violet)">
              <div data-reveal>
                <p className="text-sm text-muted">Посёлок премиум-класса, Челябинск</p>
                <p className="mt-3 font-display text-4xl font-semibold">
                  <Stat value={6900} suffix=" ₽" />
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  стоит качественный лид на загородный премиум — при рыночных
                  10–15 тысячах
                </p>
              </div>
            </GlowCard>
          </div>

          <div data-reveal className="mt-8">
            <Link
              href="/cases"
              className="font-semibold text-fg transition-colors hover:text-cyan"
            >
              Все кейсы с цифрами →
            </Link>
          </div>
        </Reveal>
      </section>

      {/* --- Инструменты --- */}
      <section className="py-16">
        <Marquee items={tools} />
      </section>

      {/* --- CTA band --- */}
      <section id="cta" className="scroll-mt-24 pb-24 sm:pb-32">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <div
            data-reveal
            className="glass noise relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-16"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-60 blur-3xl"
              style={{
                background:
                  "linear-gradient(90deg, var(--c-cyan), var(--c-indigo), var(--c-violet), var(--c-warm))",
              }}
              aria-hidden
            />
            <p className="relative font-display text-2xl font-semibold sm:text-4xl">
              Проверьте нас <span className="text-spectrum">на своих звонках</span>
            </p>
            <p className="relative mx-auto mt-4 max-w-xl leading-relaxed text-muted">
              Пришлите 50 записей колл-центра — за 3 дня вернём разбор: где
              воронка теряет деньги и что чинить первым. Бесплатно и без
              обязательств.
            </p>
            <div className="relative mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contacts?topic=calls"
                className="glow-beam rounded-xl bg-beam px-6 py-3.5 font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                Забрать разбор 50 звонков
              </Link>
              <Link
                href="/contacts?topic=tender"
                className="glass rounded-xl px-6 py-3.5 font-semibold text-fg transition-colors hover:text-white"
              >
                Пригласить в тендер
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
