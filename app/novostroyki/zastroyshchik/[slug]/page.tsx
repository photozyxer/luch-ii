import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDeveloper, listDevelopers, fmtMillions, fmtPrice, roomsLabel } from "@/lib/novostroyki/catalog";
import NovostroykiLotCard from "@/components/novostroyki-lot-card";
import NovostroykiLeadForm from "@/components/novostroyki-lead-form";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listDevelopers()).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDeveloper(slug);
  if (!d) return {};
  return {
    title: `Новостройки застройщика ${d.name} в Екатеринбурге — ${d.lots} квартир от ${fmtMillions(d.minPrice)}`,
    description: `Квартиры в новостройках от застройщика ${d.name}, Екатеринбург: ${d.lots} квартир в ${d.zk} ЖК от ${fmtMillions(d.minPrice)}. Планировки, сроки сдачи, отделка, акции и ипотека — подбор с ИИ-консультантом.`,
    alternates: { canonical: `/novostroyki/zastroyshchik/${slug}` },
  };
}

export default async function DeveloperPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await getDeveloper(slug);
  if (!d) notFound();
  const others = (await listDevelopers()).filter((x) => x.slug !== slug);

  const faq = [
    { q: `Сколько ЖК строит ${d.name} в Екатеринбурге?`, a: `У застройщика ${d.name} в продаже ${d.zk} ЖК, всего ${d.lots} квартир от ${fmtPrice(d.minPrice)}. Районы: ${d.districts.filter(Boolean).join(", ")}.` },
    { q: `Какие акции и ипотека у ${d.name}?`, a: `Актуальные скидки, рассрочку и ипотечные программы застройщика (семейная, ИТ, господдержка) подскажет ИИ-консультант — он берёт условия из базы, а не выдумывает.` },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Новостройки Екатеринбурга", item: "/novostroyki" },
        { "@type": "ListItem", position: 2, name: d.name, item: `/novostroyki/zastroyshchik/${slug}` }] },
      { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-6 text-xs text-muted">
        <Link href="/novostroyki" className="hover:text-fg">Новостройки Екатеринбурга</Link>
        <span className="mx-1.5">/</span><span className="text-fg">{d.name}</span>
      </nav>

      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Новостройки застройщика {d.name}, Екатеринбург</h1>
      <p className="mt-3 text-muted">
        В продаже <b className="text-fg">{d.lots} квартир</b> в {d.zk} ЖК — цены от <b className="text-fg">{fmtPrice(d.minPrice)}</b>.
        Районы: {d.districts.filter(Boolean).join(", ")}.
      </p>
      <Link href="/novostroyki" className="glow-beam mt-5 inline-block rounded-xl bg-beam px-5 py-3 text-sm font-semibold text-white">
        Подобрать квартиру от {d.name} →
      </Link>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Квартиры по числу комнат</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {d.byRooms.map((r) => (
            <div key={String(r.rooms)} className="glass rounded-xl p-3 text-sm">
              <p className="font-semibold">{roomsLabel(r.rooms)}</p>
              <p className="text-muted">{r.count} шт · от {fmtPrice(r.minPrice)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Примеры квартир от {d.name}</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">{d.sampleLots.map((l) => <NovostroykiLotCard key={l.id} l={l} />)}</div>
      </section>

      <section className="mt-10">
        <NovostroykiLeadForm context={`Застройщик ${d.name}`} title={`Квартиры от ${d.name} — оставьте номер, подберём`} />
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

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Другие застройщики</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {others.map((o) => (
            <Link key={o.slug} href={`/novostroyki/zastroyshchik/${o.slug}`} className="rounded-full border border-white/12 px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-white/25 hover:text-fg">{o.name} · {o.lots}</Link>
          ))}
        </div>
      </section>
    </div>
  );
}
