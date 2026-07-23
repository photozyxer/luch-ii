import type { Metadata } from "next";
import PageIntro from "@/components/page-intro";
import Reveal from "@/components/reveal";
import LeadForm from "@/components/lead-form";

export const metadata: Metadata = {
  title: "Контакты — ЛУЧ-ИИ",
  description:
    "Пригласите в тендер, пришлите звонки на бесплатный разбор или обсудите модуль ИИ-системы. Ответим в течение рабочего дня.",
};

const intros: Record<string, { title: string; lead: string }> = {
  tender: {
    title: "Пригласите нас в тендер",
    lead: "Оставьте телефон — придём с медиапланом и прогнозом обращений по вашему проекту.",
  },
  calls: {
    title: "Пришлите звонки — вернём разбор",
    lead: "50 записей колл-центра, 3 дня — и вы видите, где воронка теряет деньги. Бесплатно и без обязательств. Записи можно прикрепить сразу или вставить ссылкой.",
  },
  module: {
    title: "Подключим модуль системы",
    lead: "Расскажите, какая вертикаль болит — звонки, реклама, аналитика, соцсети. Покажем модуль на ваших данных.",
  },
  estimate: {
    title: "Посчитаем смету проекта",
    lead: "Опишите объект и задачи — вернём расчёт за 2 рабочих дня.",
  },
  consult: {
    title: "Обсудим вашу задачу",
    lead: "Не уверены, с чего начать? Оставьте телефон — разберёмся вместе на коротком созвоне.",
  },
  default: {
    title: "Давайте поговорим",
    lead: "Тендер, разбор звонков, модуль системы или просто вопрос — оставьте телефон, ответим в течение рабочего дня.",
  },
};

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; module?: string }>;
}) {
  const { topic, module } = await searchParams;
  const intro = intros[topic ?? ""] ?? intros.default;

  return (
    <>
      <PageIntro
        kicker="Контакты"
        color="var(--c-indigo)"
        title={intro.title}
        lead={intro.lead}
      />

      <section className="pb-24 sm:pb-32">
        <Reveal className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div data-reveal className="glass rounded-3xl p-7 sm:p-10">
              <LeadForm topic={topic} module={module} />
            </div>

            <div data-reveal className="space-y-5 self-start">
              <div className="hairline rounded-2xl p-6">
                <p className="font-display font-semibold">Что будет после заявки</p>
                <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
                  <li>1. Перезвоним в течение рабочего дня</li>
                  <li>2. Уточним задачу — 15–20 минут</li>
                  <li>
                    3. Вернёмся с конкретикой: разбором звонков, медиапланом
                    или демо модуля
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
