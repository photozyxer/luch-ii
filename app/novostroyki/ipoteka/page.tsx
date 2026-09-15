import type { Metadata } from "next";
import Link from "next/link";
import { listMortgage } from "@/lib/novostroyki/catalog";

export const metadata: Metadata = {
  title: "Ипотека на новостройки Екатеринбурга — ставки, программы, рассрочка застройщиков",
  description:
    "Ипотека на новостройки Екатеринбурга: семейная, ИТ, господдержка, субсидированные программы застройщиков, рассрочка. Ставки, первый взнос, срок. Рассчитаем платёж с ИИ-консультантом.",
  alternates: { canonical: "/ipoteka" },
};

const rate = (r: number | null) => (r == null ? "—" : `${String(r).replace(".", ",")}%`);

export default async function IpotekaPage() {
  const programs = listMortgage();
  const byDev = new Map<string, typeof programs>();
  for (const m of programs) { if (!byDev.has(m.developer)) byDev.set(m.developer, []); byDev.get(m.developer)!.push(m); }
  const minRate = programs.reduce<number | null>((min, m) => (m.rate != null && (min == null || m.rate < min) ? m.rate : min), null);

  const faq = [
    { q: "Какая ставка по ипотеке на новостройку в Екатеринбурге?", a: `Ставки зависят от программы: семейная, ИТ, господдержка и субсидированные ставки застройщиков начинаются от ${rate(minRate)}. Точную ставку и платёж под вашу квартиру рассчитает ИИ-консультант.` },
    { q: "Какие льготные ипотечные программы доступны?", a: "Семейная ипотека, ИТ-ипотека, военная, субсидированные программы застройщиков и рассрочка. Условия (ставка, первый взнос, срок) отличаются по застройщикам — смотрите ниже или спросите консультанта." },
    { q: "Можно ли купить новостройку в рассрочку?", a: "Да, у ряда застройщиков есть рассрочка с первым взносом. Условия рассрочки консультант покажет по конкретному ЖК." },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Новостройки Екатеринбурга", item: "/novostroyki" },
        { "@type": "ListItem", position: 2, name: "Ипотека", item: "/novostroyki/ipoteka" }] },
      { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-6 text-xs text-muted">
        <Link href="/novostroyki" className="hover:text-fg">Новостройки Екатеринбурга</Link>
        <span className="mx-1.5">/</span><span className="text-fg">Ипотека</span>
      </nav>

      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Ипотека на новостройки Екатеринбурга</h1>
      <p className="mt-3 text-muted">
        Ставки от <b className="text-fg">{rate(minRate)}</b>: семейная, ИТ, господдержка, субсидированные программы застройщиков и рассрочка.
        Рассчитаем ежемесячный платёж под вашу квартиру.
      </p>
      <Link href="/novostroyki" className="glow-beam mt-5 inline-block rounded-xl bg-beam px-5 py-3 text-sm font-semibold text-white">
        Рассчитать ипотеку с консультантом →
      </Link>

      <section className="mt-10 space-y-6">
        <h2 className="font-display text-lg font-semibold">Ипотечные программы застройщиков</h2>
        {[...byDev.entries()].map(([dev, ms]) => (
          <div key={dev}>
            <h3 className="text-sm font-semibold text-muted">{dev}</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {ms.map((m, i) => (
                <div key={i} className="glass rounded-xl p-4 text-sm">
                  <p className="font-semibold">
                    {m.program}
                    {m.rate != null ? <span className="ml-2 text-emerald-300">{rate(m.rate)}</span> : null}
                  </p>
                  <p className="mt-1 text-muted">
                    {m.minDownpaymentPct != null ? `Взнос от ${m.minDownpaymentPct}%` : ""}
                    {m.termYears != null ? `${m.minDownpaymentPct != null ? " · " : ""}до ${m.termYears} лет` : ""}
                  </p>
                  {m.note && <p className="mt-1 text-xs text-muted">{m.note}</p>}
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
        Ставки и условия ипотеки указаны по данным застройщиков и банков-партнёров и могут измениться. Итоговые условия подтверждает банк и менеджер.
      </p>
    </div>
  );
}
