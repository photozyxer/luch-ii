import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/page-intro";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных — ЛУЧ-ИИ",
  description:
    "Политика обработки персональных данных сайта ЛУЧ-ИИ в соответствии с Федеральным законом № 152-ФЗ «О персональных данных».",
  // Реквизиты оператора (ФИО, ИНН) доступны людям, но закрыты от поисковой индексации
  robots: { index: false, follow: true },
};

/* ── Реквизиты оператора — единственное место для правок ── */
const OPERATOR = {
  name: "Индивидуальный предприниматель Корниенко Георгий Бачукиевич",
  short: "ИП Корниенко Г. Б.",
  inn: "745209630248",
};

const UPDATED = "23 июля 2026 г.";

export default function PrivacyPage() {
  return (
    <>
      <PageIntro
        kicker="Правовая информация"
        color="var(--c-cyan)"
        title={
          <>
            Политика обработки{" "}
            <span className="text-spectrum">персональных данных</span>
          </>
        }
        lead={`Настоящая Политика разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных Оператором. Редакция от ${UPDATED}`}
      />

      <section className="pb-24">
        <Reveal className="mx-auto max-w-3xl px-4 sm:px-6">
          <div
            data-reveal
            className="glass space-y-8 rounded-3xl p-7 leading-relaxed text-muted sm:p-10"
          >
            <div>
              <h2 className="font-display text-xl font-semibold text-fg">
                1. Оператор
              </h2>
              <p className="mt-3">
                Оператором персональных данных является {OPERATOR.name}, ИНН{" "}
                {OPERATOR.inn} (далее — «Оператор»). Обращения по вопросам
                обработки персональных данных направляются через{" "}
                <Link
                  href="/contacts"
                  className="text-fg underline decoration-line underline-offset-4 hover:decoration-fg"
                >
                  форму обратной связи
                </Link>{" "}
                на сайте.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-fg">
                2. Какие данные обрабатываются
              </h2>
              <p className="mt-3">
                Оператор обрабатывает данные, которые вы добровольно
                предоставляете через формы обратной связи и чат на сайте:
              </p>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>номер телефона;</li>
                <li>имя;</li>
                <li>адрес электронной почты;</li>
                <li>
                  содержание вашего обращения, включая вложенные файлы (например,
                  записи звонков), если вы их прикладываете;
                </li>
                <li>
                  технические данные (IP-адрес), необходимые для защиты формы от
                  автоматических отправок.
                </li>
              </ul>
              <p className="mt-3">
                Оператор не запрашивает и не обрабатывает специальные категории
                персональных данных.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-fg">
                3. Цели обработки
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>обработка и ответ на ваши обращения и заявки;</li>
                <li>
                  предоставление консультаций и подготовка коммерческих
                  предложений по вашему запросу;
                </li>
                <li>связь с вами по оставленным контактным данным.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-fg">
                4. Правовые основания
              </h2>
              <p className="mt-3">
                Обработка осуществляется на основании вашего согласия, которое
                вы даёте при отправке формы, а также в целях исполнения договора
                или принятия мер по вашему запросу (ст. 6 152-ФЗ). Согласие
                можно отозвать в любой момент (см. раздел 7).
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-fg">
                5. Условия и сроки обработки
              </h2>
              <p className="mt-3">
                Данные обрабатываются с использованием средств автоматизации.
                Оператор не передаёт данные третьим лицам, за исключением
                случаев, предусмотренных законом, и сервисов, обеспечивающих
                работу сайта и приём обращений. Данные хранятся не дольше, чем
                этого требуют цели обработки, либо до отзыва согласия. Оператор
                принимает необходимые правовые, организационные и технические
                меры для защиты данных от неправомерного доступа.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-fg">
                6. Права субъекта персональных данных
              </h2>
              <p className="mt-3">Вы вправе:</p>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                <li>
                  получать информацию об обработке своих персональных данных;
                </li>
                <li>требовать уточнения, блокирования или уничтожения данных;</li>
                <li>отозвать согласие на обработку;</li>
                <li>
                  обжаловать действия Оператора в Роскомнадзоре или в судебном
                  порядке.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-fg">
                7. Как обратиться или отозвать согласие
              </h2>
              <p className="mt-3">
                Для реализации своих прав или отзыва согласия направьте обращение
                через{" "}
                <Link
                  href="/contacts"
                  className="text-fg underline decoration-line underline-offset-4 hover:decoration-fg"
                >
                  форму обратной связи
                </Link>{" "}
                на сайте. Оператор рассмотрит обращение в сроки, установленные
                законодательством.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-fg">
                8. Файлы cookie
              </h2>
              <p className="mt-3">
                Сайт использует технически необходимые файлы cookie для
                корректной работы. Системы веб-аналитики, отслеживающие поведение
                посетителей, на сайте не применяются. При их подключении в
                будущем настоящая Политика будет обновлена.
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold text-fg">
                9. Изменения Политики
              </h2>
              <p className="mt-3">
                Оператор вправе вносить изменения в настоящую Политику. Актуальная
                редакция всегда доступна на этой странице.
              </p>
            </div>

            <p className="border-t border-line/60 pt-6 text-sm">
              {OPERATOR.short} · ИНН {OPERATOR.inn} · редакция от {UPDATED}.{" "}
              <Link
                href="/contacts"
                className="text-fg underline decoration-line underline-offset-4 hover:decoration-fg"
              >
                Связаться
              </Link>
            </p>
          </div>
        </Reveal>
      </section>
    </>
  );
}
