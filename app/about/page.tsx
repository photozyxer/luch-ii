import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import PageIntro from "@/components/page-intro";
import Reveal from "@/components/reveal";
import GlowCard from "@/components/glow-card";

export const metadata = pageMeta({
  title: "О нас",
  description:
    "Команда performance-маркетинга в недвижимости, которая построила собственную ИИ-систему ЛУЧ. Принципы работы и для кого мы.",
  path: "/about",
});

const principles = [
  {
    color: "var(--c-cyan)",
    title: "Отвечаем за воронку целиком",
    text: "Не бывает «реклама хорошая, продажи подвели». Если обращения не становятся сделками — это и наша проблема тоже: найдём, где рвётся, и покажем на цифрах.",
  },
  {
    color: "var(--c-indigo)",
    title: "Решения, а не отчёты",
    text: "Каждый отчёт заканчивается предложением: что делаем дальше и почему. Таблицу без вывода считаем браком.",
  },
  {
    color: "var(--c-violet)",
    title: "ИИ работает, человек отвечает",
    text: "Агенты готовят черновики, анализируют и предлагают. Всё, что тратит деньги или уходит в паблик, утверждает человек. Уровень автономии выбираете вы.",
  },
  {
    color: "var(--c-warm)",
    title: "Цифры проверяемы",
    text: "Любая метрика в наших отчётах прослеживается до источника — кабинета, CRM или записи звонка. Не сходится — разбираемся, а не «усредняем».",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        kicker="О нас"
        color="var(--c-warm)"
        title={
          <>
            Маркетологи, которые <span className="text-spectrum">построили себе ИИ</span>
          </>
        }
        lead="Мы — команда performance-маркетинга, которая много лет ведёт проекты застройщиков: от квартир комфорт-класса до загородного премиума. Рутину, которая съедала часы, мы отдали собственной ИИ-системе ЛУЧ — и теперь предлагаем её клиентам."
      />

      {/* --- История в двух абзацах --- */}
      <section className="pb-8">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <div data-reveal className="glass rounded-3xl p-7 sm:p-10">
            <div className="grid gap-8 lg:grid-cols-2">
              <p className="leading-relaxed text-muted">
                Сначала был обычный агентский цикл: медиапланы, кампании,
                отчёты, планёрки. Потом мы посчитали, сколько времени команда
                тратит на прослушивание звонков, сведение план-факта и сборку
                креативов — и начали строить ИИ-модули, которые делают это сами.{" "}
                <span className="text-fg">
                  Каждый модуль сначала обкатывается на наших собственных
                  проектах
                </span>{" "}
                — клиентам достаётся то, что уже пережило контакт с реальностью.
              </p>
              <p className="leading-relaxed text-muted">
                Поэтому у нас две линии на равных:{" "}
                <Link href="/agency" className="text-fg underline decoration-line underline-offset-4 hover:decoration-fg">
                  услуги агентства
                </Link>{" "}
                — когда нужно, чтобы воронку вели мы, и{" "}
                <Link href="/system" className="text-fg underline decoration-line underline-offset-4 hover:decoration-fg">
                  модули ИИ-системы
                </Link>{" "}
                — когда команда у вас своя, а не хватает инструмента. Это один
                и тот же ИИ: в первом случае им управляем мы, во втором — вы.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* --- Принципы --- */}
      <section className="py-24 sm:py-28">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <p data-reveal className="kicker">
            Принципы
          </p>
          <h2
            data-reveal
            className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl"
          >
            Четыре правила, на которых всё держится
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {principles.map((p, i) => (
              <GlowCard key={p.title} className="glass rounded-2xl p-7" color={p.color}>
                <div data-reveal>
                  <span className="num-ghost text-5xl">{`0${i + 1}`}</span>
                  <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
                </div>
              </GlowCard>
            ))}
          </div>
        </Reveal>
      </section>

      {/* --- Для кого --- */}
      <section className="pb-8">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <p data-reveal className="kicker">
            Для кого мы
          </p>
          <h2
            data-reveal
            className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight sm:text-4xl"
          >
            Работаем с теми, кто продаёт недвижимость
          </h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Застройщики МКД",
                text: "Наш основной профиль: жилые комплексы от комфорта до бизнес-класса. Комдир, РОП и маркетинг получают каждый свой срез системы.",
              },
              {
                title: "Загородные проекты и ИЖС",
                text: "Коттеджные посёлки и индивидуальное строительство: сезонность, узкие аудитории, длинные сделки — знаем, умеем.",
              },
              {
                title: "Брокеры и агентства",
                text: "Модули системы как инструмент: анализ звонков и консультант ЖК усиливают отдел продаж без найма новых людей.",
              },
            ].map((a) => (
              <div key={a.title} data-reveal className="hairline rounded-2xl p-7">
                <h3 className="font-display text-lg font-semibold">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{a.text}</p>
              </div>
            ))}
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
                background: "linear-gradient(90deg, var(--c-warm), var(--c-violet))",
              }}
              aria-hidden
            />
            <p className="relative font-display text-2xl font-semibold sm:text-3xl">
              Проще всего познакомиться на деле
            </p>
            <p className="relative mx-auto mt-3 max-w-xl leading-relaxed text-muted">
              Пришлите 50 звонков вашего колл-центра — вернём разбор за 3 дня
              и заодно покажем, как мы работаем.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/contacts?topic=calls"
                className="glow-beam rounded-xl bg-beam px-6 py-3.5 font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                Забрать разбор 50 звонков
              </Link>
              <Link
                href="/contacts"
                className="glass rounded-xl px-6 py-3.5 font-semibold text-fg transition-colors hover:text-white"
              >
                Просто написать
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
