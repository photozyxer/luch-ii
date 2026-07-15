import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/page-intro";
import Reveal from "@/components/reveal";
import ConsultantChat from "@/components/consultant-chat";

export const metadata: Metadata = {
  title: "ИИ-консультант ЖК — живое демо | ЛУЧ",
  description:
    "Живое демо агента «Консультант ЖК»: чат-консультант реального жилого дома отвечает на вопросы о квартирах, ценах и акциях, отрабатывает возражения, предлагает альтернативы и закрывает на встречу.",
};

const features = [
  {
    title: "Знает объект, а не «недвижимость вообще»",
    text: "Цены и наличие по очередям, отделка, акции, рассрочка, инфраструктура — консультант обучен на данных конкретного дома и отвечает фактами, а не общими словами.",
  },
  {
    title: "Продаёт, а не отвечает на FAQ",
    text: "Выявляет потребность, подбирает акцию под ситуацию клиента, отрабатывает «дорого» и «подумаю», предлагает альтернативы из портфеля застройщика — и закрывает на телефон и встречу.",
  },
  {
    title: "Лид приходит тёплым",
    text: "Как только клиент оставляет номер, менеджер получает заявку вместе с историей диалога: с чем пришёл, что смотрел, что его останавливало.",
  },
  {
    title: "Не фантазирует",
    text: "Отвечает только по базе знаний проекта. Чего не знает — честно переводит на менеджера. Точные цены и условия акций всегда подтверждает человек.",
  },
];

export default function ConsultantPage() {
  return (
    <>
      <PageIntro
        kicker="Консультант ЖК · живое демо"
        color="var(--c-cyan)"
        title={
          <>
            Поговорите с ИИ-консультантом{" "}
            <span className="text-spectrum">реального дома</span>
          </>
        }
        lead="Это демо агента «Консультант ЖК» на фактуре настоящего проекта — дома «Милый дом» от BAZA Development в Екатеринбурге. Спросите про цены, поторгуйтесь, скажите «дорого» — и посмотрите, как агент ведёт к сделке."
      />

      <section className="relative pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_minmax(320px,420px)]">
          <Reveal>
            <div data-reveal>
              <ConsultantChat />
              <p className="mt-3 text-xs leading-relaxed text-muted/70">
                Демо построено на открытых данных официального сайта baza.bz
                (снимок от 15.07.2026) и не аффилировано с BAZA Development.
                Цены и условия могли измениться. Оставленный в чате телефон
                попадёт в нашу демо-CRM — так мы показываем передачу лида.
              </p>
            </div>
          </Reveal>

          <Reveal className="space-y-4">
            {features.map((f) => (
              <div key={f.title} data-reveal className="glass rounded-2xl p-6">
                <h3 className="font-display text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
              </div>
            ))}
            <div data-reveal className="glass rounded-2xl p-6">
              <h3 className="font-display text-base font-semibold">
                Хотите такого консультанта на свой ЖК?
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Обучим агента на ваших лотах, ценах и регламентах, подключим к
                сайту и CRM. Запуск — от двух недель.
              </p>
              <Link
                href="/contacts?topic=module"
                className="glow-beam mt-5 inline-block rounded-xl bg-beam px-5 py-3 text-sm font-semibold text-white"
              >
                Обсудить подключение →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
