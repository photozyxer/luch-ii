import { pageMeta } from "@/lib/seo";
import PageIntro from "@/components/page-intro";
import Reveal from "@/components/reveal";
import NovostroykiChat from "@/components/novostroyki-chat";

export const metadata = pageMeta({
  title: "Новостройки Екатеринбурга — ИИ-подбор квартиры",
  description:
    "Подберём квартиру в новостройках Екатеринбурга: все ЖК от застройщиков, цены, планировки, сроки сдачи, отделка, акции и ипотека. ИИ-консультант отвечает фактами из базы.",
  path: "/novostroyki",
});

const features = [
  {
    title: "Все застройщики в одном месте",
    text: "Подбор идёт по всей базе новостроек — цены, площади, этажи, срок сдачи по конкретному корпусу и тип отделки. Нейтрально: не продаём один ЖК, а находим подходящий.",
  },
  {
    title: "Отвечает фактами, не рекламой",
    text: "Консультант показывает только реальные квартиры из базы с актуальной ценой и планировкой. Чего нет в данных — не выдумывает.",
  },
  {
    title: "Акции и ипотека — как есть",
    text: "Текущие скидки, рассрочка, семейная и ИТ-ипотека, ставки и первый взнос застройщиков. Считаем выгоду в рублях под вашу ситуацию.",
  },
  {
    title: "Заявка — телефоном, без лишнего",
    text: "Понравился вариант — оставьте номер прямо в чате, менеджер зафиксирует цену/акцию или рассчитает ипотеку. Имя и лишние данные не спрашиваем.",
  },
];

export default function NovostroykiPage() {
  return (
    <>
      <PageIntro
        kicker="Новостройки Екатеринбурга"
        color="var(--c-cyan)"
        title={
          <>
            Найдём вашу квартиру в{" "}
            <span className="text-spectrum">новостройках Екатеринбурга</span>
          </>
        }
        lead="Опишите, что ищете — район, бюджет, число комнат, срок сдачи — и ИИ-консультант подберёт конкретные квартиры из базы всех застройщиков: с ценами, планировками, акциями и ипотекой."
      />

      <section className="relative pb-24">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_minmax(320px,420px)]">
          <Reveal>
            <div data-reveal>
              <NovostroykiChat />
              <p className="mt-3 text-xs leading-relaxed text-muted/70">
                Данные собраны из открытых каталогов застройщиков Екатеринбурга.
                Цены и наличие могли измениться — точные условия подтверждает
                менеджер. Телефон, оставленный в чате, передаётся менеджеру для
                связи; имя и другие данные мы не собираем.
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
          </Reveal>
        </div>
      </section>
    </>
  );
}
