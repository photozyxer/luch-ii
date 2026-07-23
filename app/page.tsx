import Link from "next/link";
import Hero from "@/components/hero";
import FunnelUplift from "@/components/funnel-uplift";
import CjmMap from "@/components/cjm-map";
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
    tag: "Анализ звонков · КЦ",
    title: "ЛУЧ-Звонки",
    desc: "Слушает каждый звонок: чек-лист, скрипт, отработка возражений. Показывает, какой менеджер теряет сделки и на чём именно.",
    live: true,
    color: "var(--c-cyan)",
  },
  {
    id: "analytics",
    tag: "Сквозная + план-факт",
    title: "ЛУЧ-Аналитика",
    desc: "Сводит рекламу и продажи в одну картину: прогноз от прокси-метрик до сделок, мониторинг цен и активности конкурентов.",
    color: "var(--c-indigo)",
  },
  {
    id: "performance",
    tag: "ИИ ведёт рекламу",
    title: "ЛУЧ-Перформанс",
    desc: "Сам настраивает и оптимизирует Директ и таргет, следит за прайс-площадками. Изменения утверждает человек — факапы не проходят.",
    color: "var(--c-violet)",
  },
  {
    id: "smm",
    tag: "Соцсети и сообщества",
    title: "ЛУЧ-SMM",
    desc: "Пишет посты, собирает макеты, публикует и следит за реакцией в сообществах ЖК. Черновики делает ИИ, финальное слово — за человеком.",
    color: "var(--c-warm)",
  },
  {
    id: "production",
    tag: "Креативы и карточки",
    title: "ЛУЧ-Продакшн",
    desc: "Баннеры, ролики, AI-staging, карточки квартир из проектной документации и шахматка на сайт — за минуты, а не недели.",
    color: "var(--c-cyan)",
  },
  {
    id: "consultant",
    tag: "Консультант ЖК · 24/7",
    title: "ЛУЧ-Консультант",
    desc: "Чат на сайте и в мессенджерах: подбирает лоты, рассказывает про акции, квалифицирует лид и передаёт его в отдел продаж тёплым.",
    color: "var(--c-indigo)",
  },
  {
    id: "operator",
    tag: "Оператор КЦ · входящие 24/7",
    title: "ЛУЧ-Оператор",
    desc: "Голосовой ИИ берёт трубку с первого гудка по всем ЖК: консультирует, квалифицирует и закрывает на встречу. Ночь, выходные, пропущенные — ни одного потерянного звонка.",
    color: "var(--c-violet)",
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
            Сделки теряются <span className="text-spectrum">на стыках отделов и подрядчиков</span>
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
            Деньги утекают между рекламой, колл-центром и отделом продаж —
            там, где кончается зона ответственности одного подрядчика и ещё не
            началась зона другого. Поэтому мы держим воронку целиком:{" "}
            <span className="text-fg">одной командой и одной системой, от первого клика до брони</span>.
          </p>
        </Reveal>
      </section>

      {/* --- Воронка было → стало: эффект модулей в деньгах --- */}
      <section id="uplift" className="scroll-mt-24 py-8 sm:py-12">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <p data-reveal className="kicker">
            Эффект в деньгах
          </p>
          <h2
            data-reveal
            className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-5xl"
          >
            ЛУЧ наращивает продажи — <span className="text-spectrum">было → стало</span>
          </h2>
          <p data-reveal className="mt-4 max-w-3xl leading-relaxed text-muted">
            Каждый модуль усиливает свой этап: перформанс и SMM наращивают
            вал, оператор и консультант доводят обращения до целевых, анализ
            звонков и план-факт дожимают конверсию в сделку. По воронке эффекты
            перемножаются.
          </p>
          <div data-reveal className="mt-10">
            <FunnelUplift />
          </div>
        </Reveal>
      </section>

      {/* --- CJM: где модули работают на пути клиента --- */}
      <section id="cjm" className="scroll-mt-24 py-24 sm:py-32">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <p data-reveal className="kicker">
            Путь клиента
          </p>
          <h2
            data-reveal
            className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl"
          >
            Как работает ИИ-ЛУЧ{" "}
            <span className="text-spectrum">на пути клиента</span>
          </h2>
          <p data-reveal className="mt-4 max-w-3xl leading-relaxed text-muted">
            От первого касания с брендом до сделки покупатель проходит шесть
            шагов — и на каждом его можно потерять. Модули ЛУЧ закрывают путь
            целиком, без «слепых зон» между подрядчиками.
          </p>
          <div data-reveal className="mt-10">
            <CjmMap />
          </div>
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
            Полный цикл — <span className="text-spectrum">от знания бренда до брони</span>
          </h2>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-6">
            <GlowCard className="glass rounded-3xl p-4 sm:p-8" color="var(--c-cyan)">
              <div data-reveal>
                <div className="text-sm font-semibold text-cyan">Услуги агентства</div>
                <h3 className="mt-2 font-display text-lg font-semibold sm:mt-3 sm:text-2xl">
                  Берём воронку под ключ
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted sm:mt-3 sm:text-base">
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

            <GlowCard className="glass rounded-3xl p-4 sm:p-8" color="var(--c-violet)">
              <div data-reveal>
                <div className="text-sm font-semibold text-violet">ИИ-система ЛУЧ</div>
                <h3 className="mt-2 font-display text-lg font-semibold sm:mt-3 sm:text-2xl">
                  Подключите модули себе
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted sm:mt-3 sm:text-base">
                  Свой отдел маркетинга справляется? Усильте его отдельными
                  ИИ-модулями ЛУЧ: анализ звонков, дашборд план-факт,
                  консультант на сайт. Платите за модуль, а не за штат.
                </p>
                <Link
                  href="/system"
                  className="mt-6 inline-block font-semibold text-fg transition-colors hover:text-violet"
                >
                  Смотреть модули →
                </Link>
              </div>
            </GlowCard>
          </div>
        </Reveal>
      </section>

      {/* --- Сетка ИИ-модулей --- */}
      <section id="agents" className="scroll-mt-24 py-24 sm:py-32">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6" stagger={0.06}>
          <p data-reveal className="kicker">
            Что под капотом
          </p>
          <h2
            data-reveal
            className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl"
          >
            7 ИИ-модулей ЛУЧ:
          </h2>
          <p data-reveal className="mt-4 max-w-3xl leading-relaxed text-muted">
            ЛУЧ — не обёртка над ChatGPT, а собственная специализированная
            ИИ-разработка для застройщика: модули обучены на воронках, звонках
            и стройке, работают на ваших данных и связаны в одну систему.
          </p>

          {/* модули — цветные плитки с лучом слева, нарочно другой ритм,
              чем у glass-карточек остальных секций */}
          <div className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {agents.map((a, i) => (
              <Link key={a.id} href={`/system#${a.id}`} data-reveal className="group">
                <div
                  className="relative h-full overflow-hidden rounded-2xl p-4 pl-5 transition-transform duration-300 group-hover:-translate-y-1 sm:p-6 sm:pl-7"
                  style={{
                    background: `linear-gradient(135deg, color-mix(in oklab, ${a.color} 13%, transparent) 0%, rgba(255,255,255,0.02) 60%)`,
                    border: `1px solid color-mix(in oklab, ${a.color} 30%, transparent)`,
                  }}
                >
                  {/* луч-полоса слева — фирменный ход вместо блоба */}
                  <span
                    className="absolute inset-y-3 left-0 w-[3px] rounded-full transition-all duration-300 group-hover:inset-y-1.5"
                    style={{ background: a.color, boxShadow: `0 0 14px ${a.color}` }}
                    aria-hidden
                  />
                  <span className="num-ghost absolute right-3 top-2 text-4xl sm:text-5xl" aria-hidden>
                    {`0${i + 1}`}
                  </span>
                  <div className="relative flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted sm:text-xs">
                      {a.tag}
                    </span>
                    {a.live && (
                      <span className="hidden rounded-full bg-cyan/15 px-2 py-0.5 text-[11px] font-semibold text-cyan sm:inline">
                        уже в работе
                      </span>
                    )}
                  </div>
                  <h3
                    className="relative mt-2 font-display text-base font-semibold sm:mt-3 sm:text-xl"
                    style={{ color: `color-mix(in oklab, ${a.color} 55%, white)` }}
                  >
                    {a.title}
                  </h3>
                  <p className="relative mt-2 hidden text-sm leading-relaxed text-muted sm:block">
                    {a.desc}
                  </p>
                  <span
                    className="relative mt-3 hidden text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100 sm:inline-block"
                    style={{ color: a.color }}
                  >
                    Подробнее →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* дашборд — дирижёр модулей */}
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
                  ЛУЧ-Дашборд дирижирует всеми модулями
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
            Наши <span className="text-spectrum">кейсы</span>
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

      {/* --- Гарантия --- */}
      <section id="guarantee" className="scroll-mt-24 py-8 sm:py-12">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <div
            data-reveal
            className="glass relative overflow-hidden rounded-3xl p-8 sm:p-12"
          >
            <div
              className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl"
              style={{ background: "var(--c-cyan)" }}
              aria-hidden
            />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_1fr]">
              <div>
                <p className="kicker">Гарантия</p>
                <h2 className="mt-3 font-display text-2xl font-semibold leading-tight sm:text-4xl">
                  Если вас не устроит результат —{" "}
                  <span className="text-spectrum">вы не платите*</span>
                </h2>
                <p className="mt-4 max-w-2xl leading-relaxed text-muted">
                  Мы уверены в системе настолько, что берём риск первого
                  месяца на себя. Вы смотрите на цифры — вал, целевые,
                  динамику конверсий — и решаете, продолжать ли. Не понравится
                  — расстанемся без счёта и без обид.
                </p>
                <p className="mt-6 text-xs leading-relaxed text-muted/70">
                  * Первый месяц работы — за наш счёт: подключаем модули,
                  работаем на ваших данных, показываем результат. Платите
                  со второго месяца — только если решили продолжать.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="/contacts?topic=consult"
                  className="glow-beam rounded-xl bg-beam px-6 py-3.5 text-center font-semibold text-white transition-transform hover:scale-[1.03]"
                >
                  Запустить первый месяц
                </Link>
                <Link
                  href="/contacts?topic=calls"
                  className="glass rounded-xl px-6 py-3.5 text-center font-semibold text-fg transition-colors hover:text-white"
                >
                  Получить демо-анализ звонков
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* --- Инструменты --- */}
      <section className="pb-24 pt-8 sm:pb-32">
        <Marquee items={tools} />
      </section>
    </>
  );
}
