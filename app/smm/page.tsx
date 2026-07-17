import type { Metadata } from "next";
import Link from "next/link";
import PageIntro from "@/components/page-intro";
import Reveal from "@/components/reveal";
import SmmApp from "@/components/smm-app";

export const metadata: Metadata = {
  title: "SMM-модуль ЛУЧ — карусели и посты в стиле ЖК | демо",
  description:
    "Живое демо SMM-агента: скаут трендовых механик, генерация каруселей и постов в фирменном стиле конкретного ЖК на реальных фото, экспорт макетов и контур эффективности пост → метрики → следующая итерация.",
};

export default function SmmPage() {
  return (
    <>
      <PageIntro
        kicker="SMM-агент · живое демо"
        color="var(--c-warm)"
        title={
          <>
            Карусели и посты —{" "}
            <span className="text-spectrum">в фирменном стиле ЖК</span>
          </>
        }
        lead="Полный контур SMM-агента на примере реального проекта — ЖК «Притяжение» (НИКС, Екатеринбург): скаут трендовых механик → генерация карусели или поста по фактам проекта → макеты в бренд-ките на реальных фото ЖК → метрики и следующая итерация. Введите свою тему — контент соберётся на лету."
      />

      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <div data-reveal>
              <SmmApp />
            </div>
          </Reveal>

          <Reveal>
            <div data-reveal className="mt-20 grid gap-4 md:grid-cols-3">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display text-base font-semibold">Как это работает в проде</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Скаут мониторит карусели и ролики конкурентов и ниши (а не только
                  видео), генератор собирает контент в бренд-ките вашего ЖК, метрики
                  публикаций замыкаются в цикл: что сработало — масштабируется.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display text-base font-semibold">Человек утверждает</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Всё, что уходит в паблик, проходит выпускающий контроль. Агент
                  готовит черновики, считает и предлагает — публикацию подтверждает
                  ваш маркетолог.
                </p>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display text-base font-semibold">Хотите на свой ЖК?</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Соберём бренд-кит, обучим агента на ваших фактах и подключим
                  VK/Telegram-каналы проекта.
                </p>
                <Link
                  href="/contacts?topic=module&module=smm"
                  className="glow-beam mt-4 inline-block rounded-xl bg-beam px-5 py-3 text-sm font-semibold text-white"
                >
                  Обсудить подключение →
                </Link>
              </div>
            </div>
          </Reveal>

          <p className="mt-10 text-xs leading-relaxed text-muted/70">
            Демо использует официальное руководство по фирменному стилю ЖК
            «Притяжение» (Fenomen Branding Agency) и реальные фотографии проекта.
            Метрики скаута и контура эффективности — синтетические, на реальных
            механиках виральных каруселей.
          </p>
        </div>
      </section>
    </>
  );
}
