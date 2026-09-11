import type { Metadata } from "next";
import Link from "next/link";
import { listPromos, discountedLots } from "@/lib/novostroyki/catalog";
import NovostroykiLotCard from "@/components/novostroyki-lot-card";

export const metadata: Metadata = {
  title: "Акции и скидки на новостройки Екатеринбурга — актуальные предложения застройщиков",
  description:
    "Актуальные акции, скидки и рассрочка на новостройки Екатеринбурга от застройщиков: квартиры со скидкой, спецпредложения, условия покупки. Подбор выгодных вариантов с ИИ-консультантом.",
  alternates: { canonical: "/novostroyki/akcii" },
};

export default async function AkciiPage() {
  const promos = listPromos();
  const lots = discountedLots(8);

  // группировка акций по застройщику
  const byDev = new Map<string, typeof promos>();
  for (const p of promos) { if (!byDev.has(p.developer)) byDev.set(p.developer, []); byDev.get(p.developer)!.push(p); }

  const faq = [
    { q: "Какие сейчас акции на новостройки в Екатеринбурге?", a: `Сейчас действует ${promos.length} акций и спецпредложений от застройщиков: скидки, рассрочка, подарки при покупке. Конкретную выгоду под вашу квартиру рассчитает ИИ-консультант.` },
    { q: "Как получить скидку на квартиру в новостройке?", a: "Скидки зависят от застройщика, ЖК, способа оплаты (полная оплата, ипотека, рассрочка) и акций месяца. Оставьте номер в чате — менеджер зафиксирует за вами актуальную цену и акцию." },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Новостройки Екатеринбурга", item: "/novostroyki" },
        { "@type": "ListItem", position: 2, name: "Акции и скидки", item: "/novostroyki/akcii" }] },
      { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-6 text-xs text-muted">
        <Link href="/novostroyki" className="hover:text-fg">Новостройки Екатеринбурга</Link>
        <span className="mx-1.5">/</span><span className="text-fg">Акции и скидки</span>
      </nav>

      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Акции и скидки на новостройки Екатеринбурга</h1>
      <p className="mt-3 text-muted">
        {promos.length} актуальных предложений от застройщиков — скидки, рассрочка, подарки. Ниже — живые квартиры со скидкой; выгоду под вашу ситуацию посчитает консультант.
      </p>
      <Link href="/novostroyki" className="glow-beam mt-5 inline-block rounded-xl bg-beam px-5 py-3 text-sm font-semibold text-white">
        Подобрать квартиру со скидкой →
      </Link>

      {lots.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold">Квартиры со скидкой прямо сейчас</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">{lots.map((l) => <NovostroykiLotCard key={l.id} l={l} />)}</div>
        </section>
      )}

      <section className="mt-10 space-y-6">
        <h2 className="font-display text-lg font-semibold">Акции застройщиков</h2>
        {[...byDev.entries()].map(([dev, ps]) => (
          <div key={dev}>
            <h3 className="text-sm font-semibold text-muted">{dev}</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {ps.map((p, i) => (
                <div key={i} className="glass rounded-xl p-4 text-sm">
                  <p className="font-semibold">
                    {p.title}
                    {p.discountPct ? <span className="ml-2 text-emerald-300">−{p.discountPct}%</span> : null}
                  </p>
                  {p.description && <p className="mt-1 text-muted">{p.description}</p>}
                  {p.validUntil && <p className="mt-1 text-xs text-muted">Действует до: {p.validUntil}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Частые вопросы</h2>
        <div className="mt-3 space-y-3">
          {faq.map((f) => (
            <div key={f.q} className="glass rounded-xl p-4">
              <p className="text-sm font-semibold">{f.q}</p><p className="mt-1.5 text-sm text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-8 text-xs text-muted/70">
        Актуальные цены и условия акций подтверждает менеджер застройщика. Скидки указаны по данным открытых каталогов и могут измениться.
      </p>
    </div>
  );
}
