import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import PageIntro from "@/components/page-intro";
import Reveal from "@/components/reveal";
import GlowCard from "@/components/glow-card";
import Marquee from "@/components/marquee";

export const metadata = pageMeta({
  title: "7 ИИ-модулей для маркетинга и продаж застройщика",
  description:
    "Семь модулей ЛУЧ по вертикалям застройщика: голосовой приём звонков, анализ звонков, аналитика, перформанс, SMM, продакшн, консультант. Один дашборд, решения — за человеком.",
  path: "/system",
});

type Agent = {
  id: string;
  color: string;
  tag: string;
  name: string;
  pitch: string;
  does: string[];
  input: string;
  output: string;
  safety: string;
  live?: boolean;
  demo?: string;
};

const agents: Agent[] = [
  {
    id: "calls",
    color: "var(--c-cyan)",
    tag: "Анализ звонков · КЦ",
    name: "ЛУЧ-Звонки",
    live: true,
    pitch:
      "Слушает 100% звонков колл-центра и отдела продаж — не выборку из пяти записей, которую успевает прослушать РОП. По каждому разговору ставит оценку и объясняет её.",
    does: [
      "Проверяет соблюдение чек-листа и скрипта продаж",
      "Смотрит, выяснили ли потребность и боль клиента",
      "Фиксирует, предложили ли альтернативы, акции, следующий шаг",
      "Оценивает вежливость и отработку негатива",
      "Скорит теплоту лида — кого догревать в первую очередь",
      "Собирает статистику по каждому менеджеру в динамике",
    ],
    input: "Записи разговоров из телефонии или коллтрекинга — Mango, МегаФон, Calltouch, CoMagic.",
    output:
      "Разбор каждого звонка + еженедельный рейтинг менеджеров с конкретикой: кто и на каком шаге теряет сделки, что исправить в скрипте.",
    safety:
      "Агент не общается с клиентами — только анализирует. Спорные оценки размечаются для проверки человеком, критерии чек-листа настраиваете вы.",
  },
  {
    id: "analytics",
    color: "var(--c-indigo)",
    tag: "Сквозная аналитика + план-факт",
    name: "ЛУЧ-Аналитика",
    pitch:
      "Держит две картины сразу: вашу воронку от показа до сделки и рынок вокруг — спрос, конкурентов, цены. Отвечает на вопрос «выполним план или нет», пока ещё можно успеть.",
    does: [
      "Сквозная аналитика: реклама и продажи в одном контуре",
      "Прогноз продаж от прокси-метрик — за месяцы до сделок",
      "План-факт: сводит план и реальность, подсвечивает отклонения",
      "Спрос и брендовая ёмкость в динамике — по данным Wordstat",
      "Мониторинг витрин, цен и темпов продаж конкурентов — включая Наш.Дом.РФ",
      "Автосбор офферов и акций конкурентов, анализ их рекламной активности",
      "Рекомендации по ценообразованию на основе рынка",
    ],
    input: "Рекламные кабинеты, CRM, коллтрекинг, открытые источники по рынку.",
    output:
      "Живой план-факт и конкурентная сводка. Любой срез — по запросу простым языком: спросите «как идёт октябрь к плану?» — получите ответ по актуальным данным.",
    safety:
      "Каждая цифра прослеживается до источника. Прогноз всегда показывается с допущениями, а не как «истина от ИИ».",
  },
  {
    id: "performance",
    color: "var(--c-violet)",
    tag: "Performance-реклама",
    name: "ЛУЧ-Перформанс",
    pitch:
      "Сам создаёт, настраивает и оптимизирует рекламные кампании — как штатный директолог, который работает круглосуточно и не забывает про минус-слова.",
    does: [
      "Контекст: сборка и ведение кампаний в Яндекс.Директе",
      "Таргет: кампании в VK Ads",
      "Прайс-площадки: Циан, Авито, ДомКлик, Яндекс.Недвижимость",
      "Перераспределяет бюджеты между каналами по цене целевого обращения",
      "Чистит площадки и запросы, тестирует креативы и аудитории",
      "Пишет понятный отчёт: что сделал, что изменилось, что предлагает дальше",
    ],
    input: "Доступ к рекламным кабинетам и цели: план обращений и допустимая цена.",
    output:
      "Кампании, которые оптимизируются каждый день, а не раз в неделю. Отчёты не «по кликам», а по целевым обращениям и их цене.",
    safety:
      "Деньги без присмотра не тратит: изменения ставок и бюджетов выходят в виде предложений, человек утверждает одним нажатием. Жёсткие лимиты бюджета зашиты на уровне системы.",
  },
  {
    id: "smm",
    color: "var(--c-warm)",
    tag: "Соцсети и сообщества",
    name: "ЛУЧ-SMM",
    demo: "/smm",
    pitch:
      "Ведёт соцсети проекта как редакция: придумывает, рисует, публикует и смотрит, что сработало. Сообщество ЖК перестаёт быть заброшенной группой с тремя постами.",
    does: [
      "Генерирует макеты и дизайн в фирменном стиле проекта",
      "Пишет тексты постов под площадку и аудиторию",
      "Публикует по контент-плану в VK и Telegram",
      "Анализирует реакцию: какие темы дают подписки и обращения",
      "Мониторит сообщества ЖК и конкурентов: тон, негатив, офферы",
      "Шлёт ежедневные и еженедельные статусы с флагами и рекомендациями",
    ],
    input: "Доступ к сообществам, брендбук проекта, акции и инфоповоды.",
    output:
      "Живая лента без простоев, рост сообщества из целевой географии и ранние сигналы негатива — раньше, чем он попадёт в отзовики.",
    safety:
      "Уровни автономии настраиваются: от «каждый пост утверждает человек» до автопилота по согласованному контент-плану. Ответы на комментарии с негативом — всегда через человека.",
  },
  {
    id: "production",
    color: "var(--c-cyan)",
    tag: "Креативы и карточки",
    name: "ЛУЧ-Продакшн",
    pitch:
      "Превращает проектную документацию в продающие материалы. То, что студия делает недели и за отдельную смету, — здесь побочный продукт системы.",
    does: [
      "Карточки квартир из проектной документации: планировка, метражи, этаж, стороны света — в едином фирменном стиле",
      "Виды из окон по этажам и корпусам",
      "Шахматка наличия для любого сайта — аналог ProfitBase без его подписки",
      "AI-staging: меблировка и стилизация квартир по рендерам и фото",
      "Рекламные баннеры и ролики под каждый канал",
    ],
    input: "Проектная документация, рендеры, фирменный стиль.",
    output:
      "Комплект носителей под запуск и обновляемая витрина квартир на сайте.",
    safety:
      "Всё, что уходит в паблик, проходит выпускающий контроль человека. Планировки и метражи сверяются с документацией автоматически.",
  },
  {
    id: "consultant",
    color: "var(--c-indigo)",
    tag: "Консультант ЖК · 24/7",
    name: "ЛУЧ-Консультант",
    demo: "/consultant",
    pitch:
      "Первый контакт с покупателем — в любое время суток. Обучается на данных конкретного ЖК и отвечает как лучший менеджер проекта, а не как «универсальный чат-бот».",
    does: [
      "Консультирует на сайте и в мессенджерах 24/7",
      "Выявляет потребность: бюджет, комнатность, сроки, ипотека",
      "Подбирает лоты и проводит по акционным предложениям",
      "Квалифицирует лид и передаёт его в отдел продаж тёплым",
      "Инициирует повторные касания: «долгие» клиенты, холодная база",
    ],
    input: "Данные ЖК: лоты, цены, акции, регламент передачи лида в CRM.",
    output:
      "Квалифицированные обращения в CRM вместо пропущенных ночных заявок и «перезвоним завтра».",
    safety:
      "Отвечает только по данным проекта — не фантазирует про сроки и скидки. В сложных вопросах честно переводит на менеджера.",
  },
  {
    id: "operator",
    color: "var(--c-violet)",
    tag: "Оператор КЦ · входящие 24/7",
    name: "ЛУЧ-Оператор",
    pitch:
      "Голосовой ИИ, который берёт трубку с первого гудка — в любое время суток и по всем проектам сразу. Консультирует по всем ЖК, выявляет потребность и закрывает на встречу, пока живой оператор занят или офис закрыт.",
    does: [
      "Принимает входящий звонок голосом — без ожидания и «оставайтесь на линии»",
      "Консультирует по всем ЖК застройщика: цены, планировки, сроки, ипотека",
      "Выявляет потребность и квалифицирует: бюджет, комнатность, сроки",
      "Записывает на встречу или звонок менеджера, фиксирует лид в CRM",
      "Не теряет обращения: ночь, выходные, пропущенные и перелив с занятой линии",
      "Горячие и сложные звонки переводит на человека с уже собранным контекстом",
    ],
    input:
      "Подключение к телефонии или коллтрекингу (Mango, МегаФон, CoMagic, Calltouch) и база по всем ЖК: лоты, цены, акции, регламент передачи лида.",
    output:
      "Ни одного пропущенного звонка и тёплый лид с квалификацией в CRM — вместо гудков в пустоту вечером и в выходные.",
    safety:
      "Представляется ИИ-ассистентом, о записи разговора предупреждает. Цены и наличие берёт только из базы проекта. Конфликтные и нестандартные звонки передаёт живому оператору.",
  },
];

const integrations = [
  "amoCRM",
  "Битрикс24",
  "MacroCRM",
  "Smartis",
  "Roistat",
  "CoMagic",
  "Calltouch",
  "Calibri",
  "Mango Office",
  "МегаФон",
  "Яндекс.Директ",
  "VK Ads",
  "Циан",
  "Авито",
  "ДомКлик",
];

const systemJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "ИИ-система ЛУЧ для застройщика",
  serviceType: "ИИ-автоматизация маркетинга и продаж застройщика",
  url: "https://luch-ii.ru/system",
  areaServed: "RU",
  provider: {
    "@type": "Organization",
    name: "ЛУЧ-ИИ",
    url: "https://luch-ii.ru",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "ИИ-модули ЛУЧ",
    itemListElement: [
      ...agents.map((a) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: a.name, description: a.pitch },
      })),
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "ЛУЧ-Дашборд",
          description:
            "Командный центр: все модули в одном экране, план-факт и рекомендации что делать.",
        },
      },
    ],
  },
};

export default function SystemPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(systemJsonLd) }}
      />
      <PageIntro
        kicker="ИИ-система ЛУЧ"
        color="var(--c-violet)"
        title={
          <>
            Семь ИИ-модулей. <span className="text-spectrum">Один дашборд.</span>{" "}
            Ноль самодеятельности
          </>
        }
        lead="ЛУЧ — собственная специализированная ИИ-разработка для застройщика, а не обёртка над готовым чат-ботом. Каждый модуль закрывает свою вертикаль, ЛУЧ-Дашборд сводит всё в план-факт, а решения с ценой ошибки утверждает человек."
      >
        <div data-reveal className="mt-8 flex flex-wrap gap-2">
          {agents.map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              className="glass rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-fg"
            >
              {a.name}
            </a>
          ))}
          <a
            href="#dashboard"
            className="glass rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-fg"
          >
            ЛУЧ-Дашборд
          </a>
        </div>
      </PageIntro>

      {/* --- Агенты: равные вертикали --- */}
      <section className="pb-8">
        <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">
          {agents.map((a, i) => (
            <Reveal key={a.id}>
              <GlowCard
                className="glass scroll-mt-28 overflow-hidden rounded-3xl p-7 sm:p-10"
                color={a.color}
              >
                <div id={a.id} data-reveal className="relative">
                  <div
                    className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-20 blur-3xl"
                    style={{ background: a.color }}
                    aria-hidden
                  />

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="num-ghost text-5xl">{`0${i + 1}`}</span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                      {a.tag}
                    </span>
                    {a.live && (
                      <span className="rounded-full bg-cyan/15 px-2.5 py-1 text-[11px] font-semibold text-cyan">
                        уже в работе у клиентов
                      </span>
                    )}
                  </div>

                  <div className="mt-5 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
                    <div>
                      <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                        {a.name}
                      </h2>
                      <p className="mt-4 leading-relaxed text-muted">{a.pitch}</p>

                      <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        <div className="hairline rounded-2xl p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                            Что на входе
                          </p>
                          <p className="mt-2 text-sm leading-relaxed">{a.input}</p>
                        </div>
                        <div className="hairline rounded-2xl p-4">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                            Что на выходе
                          </p>
                          <p className="mt-2 text-sm leading-relaxed">{a.output}</p>
                        </div>
                      </div>

                      <div
                        className="mt-4 rounded-2xl p-4"
                        style={{
                          background: `color-mix(in oklab, ${a.color} 8%, transparent)`,
                          border: `1px solid color-mix(in oklab, ${a.color} 25%, transparent)`,
                        }}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: a.color }}>
                          Защита от факапа
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted">{a.safety}</p>
                      </div>
                    </div>

                    <div className="self-center">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Что делает
                      </p>
                      <ul className="mt-3 space-y-3">
                        {a.does.map((d) => (
                          <li key={d} className="flex gap-3 text-sm leading-relaxed text-muted">
                            <span
                              className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                              style={{ background: a.color }}
                              aria-hidden
                            />
                            {d}
                          </li>
                        ))}
                      </ul>
                      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                        {a.demo && (
                          <Link
                            href={a.demo}
                            className="glow-beam rounded-xl bg-beam px-4 py-2.5 text-sm font-semibold text-white"
                          >
                            Живое демо →
                          </Link>
                        )}
                        <Link
                          href={`/contacts?topic=module&module=${a.id}`}
                          className="inline-block text-sm font-semibold text-fg transition-colors hover:opacity-80"
                          style={{ color: a.color }}
                        >
                          Подключить этот модуль →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --- Дашборд: дирижёр --- */}
      <section id="dashboard" className="scroll-mt-28 py-24 sm:py-28">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <GlowCard
            className="glass noise relative overflow-hidden rounded-3xl p-8 sm:p-12"
            color="var(--c-indigo)"
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-40 blur-3xl"
              style={{
                background:
                  "linear-gradient(90deg, var(--c-cyan), var(--c-indigo), var(--c-violet), var(--c-warm))",
              }}
              aria-hidden
            />
            <div data-reveal className="relative grid gap-10 lg:grid-cols-2">
              <div>
                <p className="kicker">Командный центр</p>
                <h2 className="mt-3 font-display text-2xl font-semibold sm:text-4xl">
                  ЛУЧ-Дашборд — <span className="text-spectrum">дирижёр модулей</span>
                </h2>
                <p className="mt-4 leading-relaxed text-muted">
                  Все модули сходятся в одном экране для коммерческого
                  директора, РОПа и маркетинга. Не «ещё одна система
                  отчётности», а место, где написано, что делать.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Сквозная картина: реклама → обращения → сделки, план-факт по каждому проекту",
                    "Ежедневные и еженедельные статусы с флагами — в Telegram или на почту",
                    "Не только «что случилось», но и рекомендация — что сделать",
                    "Вопрос свободным текстом → ответ по актуальным данным",
                  ].map((t) => (
                    <li key={t} className="flex gap-3 text-sm leading-relaxed text-muted">
                      <span
                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: "var(--c-indigo)" }}
                        aria-hidden
                      />
                      {t}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard"
                  className="glow-beam mt-7 inline-block rounded-xl bg-beam px-5 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
                >
                  Открыть живое демо дашборда →
                </Link>
              </div>

              {/* мокап утреннего статуса в Telegram */}
              <div className="glass self-center rounded-2xl p-5 font-mono text-[13px] leading-relaxed">
                <p className="text-muted">ЛУЧ · утренний статус — 09:00</p>
                <p className="mt-3">
                  🟢 Обращения: 8 за вчера <span className="text-muted">(план 7)</span>
                </p>
                <p className="mt-1.5">
                  🟡 Цена КЦО выросла на 12% — VK тянет вверх.{" "}
                  <span className="text-muted">Предлагаю перекинуть 15% бюджета в Директ, черновик готов — утвердить?</span>
                </p>
                <p className="mt-1.5">
                  🔴 Менеджер И. вчера не предложил ипотеку в 3 из 4 звонков.{" "}
                  <span className="text-muted">Скрипт и таймкоды приложил.</span>
                </p>
                <p className="mt-3 text-muted">— спросите меня: «как идём к плану месяца?»</p>
              </div>
            </div>
          </GlowCard>
        </Reveal>
      </section>

      {/* --- Интеграции + 152-ФЗ --- */}
      <section className="pb-8">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 data-reveal className="max-w-3xl font-display text-2xl font-semibold sm:text-3xl">
            Встраивается в ваш стек, а не наоборот
          </h2>
        </Reveal>
        <div className="mt-6">
          <Marquee items={integrations} />
        </div>
        <Reveal className="mx-auto mt-10 max-w-7xl px-4 sm:px-6">
          <div data-reveal className="grid gap-5 md:grid-cols-2">
            <div className="hairline rounded-2xl p-7">
              <h3 className="font-display text-lg font-semibold">152-ФЗ соблюдён</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Два варианта развёртывания: локально на вашей инфраструктуре —
                тогда и ИИ-модели работают локально, данные не покидают контур.
                Либо облачная версия с хранением персональных данных в РФ и
                российскими ИИ-сервисами для чувствительных модулей.
              </p>
            </div>
            <div className="hairline rounded-2xl p-7">
              <h3 className="font-display text-lg font-semibold">Модули — по отдельности</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Систему не обязательно брать целиком. Начните с одного модуля —
                чаще всего это анализ звонков, он показывает ценность за первую
                же неделю — и подключайте остальных, когда увидите эффект.
              </p>
            </div>
          </div>
        </Reveal>
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
                background: "linear-gradient(90deg, var(--c-violet), var(--c-warm))",
              }}
              aria-hidden
            />
            <p className="relative font-display text-2xl font-semibold sm:text-3xl">
              Начните с модуля ЛУЧ-Звонки
            </p>
            <p className="relative mx-auto mt-3 max-w-xl leading-relaxed text-muted">
              Пришлите 50 записей — вернём разбор через 3 дня. Увидите своими
              глазами, как модуль работает на ваших данных, до каких-либо
              договоров.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contacts?topic=calls"
                className="glow-beam rounded-xl bg-beam px-6 py-3.5 font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                Забрать разбор 50 звонков
              </Link>
              <Link
                href="/contacts?topic=module"
                className="glass rounded-xl px-6 py-3.5 font-semibold text-fg transition-colors hover:text-white"
              >
                Обсудить модули
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
