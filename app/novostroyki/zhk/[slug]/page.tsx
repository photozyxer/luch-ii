import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getZk, listZk, slugify, fmtMillions, fmtPrice, roomsLabel } from "@/lib/novostroyki/catalog";
import NovostroykiLotCard from "@/components/novostroyki-lot-card";
import NovostroykiLeadForm from "@/components/novostroyki-lead-form";

export const dynamicParams = false;

export async function generateStaticParams() {
  return (await listZk()).map((z) => ({ slug: z.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const z = await getZk(slug);
  if (!z) return {};
  return {
    title: `ЖК ${z.name} (Екатеринбург) — ${z.lots} квартир от ${fmtMillions(z.minPrice)}, цены и планировки`,
    description: `ЖК ${z.name}${z.developer ? ` от ${z.developer}` : ""}${z.district ? `, район ${z.district}` : ""}: ${z.lots} квартир в продаже от ${fmtMillions(z.minPrice)}. Планировки, цены, срок сдачи по корпусам, отделка, акции. Подбор с ИИ-консультантом.`,
    alternates: { canonical: `/zhk/${slug}` },
  };
}

export default async function ZkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const z = await getZk(slug);
  if (!z) notFound();
  const siblings = (await listZk()).filter((x) => x.slug !== slug && x.developer === z.developer).slice(0, 8);

  const faq = [
    { q: `Сколько стоит квартира в ЖК ${z.name}?`, a: `В продаже ${z.lots} квартир от ${fmtPrice(z.minPrice)} до ${fmtPrice(z.maxPrice)}. Цена зависит от площади, этажа, корпуса и отделки.` },
    { q: `Когда сдача ЖК ${z.name}?`, a: `${z.deadline ? `Ориентировочный срок сдачи — ${z.deadline}. ` : ""}Срок может отличаться по корпусам и секциям — точный срок конкретной квартиры покажет ИИ-консультант.` },
    { q: `Какой застройщик и район у ЖК ${z.name}?`, a: `${z.developer ? `Застройщик — ${z.developer}. ` : ""}${z.district ? `Район — ${z.district}. ` : ""}${z.address ? `Адрес: ${z.address}.` : ""}` },
  ];
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Новостройки Екатеринбурга", item: "/novostroyki" },
        { "@type": "ListItem", position: 2, name: `ЖК ${z.name}`, item: `/novostroyki/zhk/${slug}` }] },
      { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      { "@type": "ApartmentComplex", name: `ЖК ${z.name}`, address: z.address ?? undefined, numberOfAvailableAccommodationUnits: z.lots },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mb-6 text-xs text-muted">
        <Link href="/novostroyki" className="hover:text-fg">Новостройки Екатеринбурга</Link>
        <span className="mx-1.5">/</span><span className="text-fg">ЖК {z.name}</span>
      </nav>

      <h1 className="font-display text-2xl font-semibold sm:text-3xl">ЖК {z.name}</h1>
      <p className="mt-3 text-muted">
        {z.developer ? <>Застройщик {z.developer}. </> : null}
        {z.district ? (
          <>Район <Link href={`/novostroyki/rayon/${slugify(z.district)}`} className="text-fg underline decoration-line underline-offset-2 hover:decoration-fg">{z.district}</Link>. </>
        ) : null}
        В продаже <b className="text-fg">{z.lots} квартир</b> от <b className="text-fg">{fmtPrice(z.minPrice)}</b> до {fmtPrice(z.maxPrice)}
        {z.deadline ? <>, срок сдачи {z.deadline}</> : null}.
      </p>
      <Link href="/novostroyki" className="glow-beam mt-5 inline-block rounded-xl bg-beam px-5 py-3 text-sm font-semibold text-white">
        Подобрать квартиру в ЖК {z.name} →
      </Link>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Квартиры в {z.name} по числу комнат</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {z.byRooms.map((r) => (
            <div key={String(r.rooms)} className="glass rounded-xl p-3 text-sm">
              <p className="font-semibold">{roomsLabel(r.rooms)}</p>
              <p className="text-muted">{r.count} шт · от {fmtPrice(r.minPrice)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Квартиры в ЖК {z.name}</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">{z.sampleLots.map((l) => <NovostroykiLotCard key={l.id} l={l} />)}</div>
      </section>

      <section className="mt-10">
        <NovostroykiLeadForm context={`ЖК ${z.name}`} title={`Заявка на квартиру в ЖК ${z.name}`} />
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

      {siblings.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg font-semibold">Другие ЖК{z.developer ? ` от ${z.developer}` : ""}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {siblings.map((o) => (
              <Link key={o.slug} href={`/novostroyki/zhk/${o.slug}`} className="rounded-full border border-white/12 px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-white/25 hover:text-fg">{o.name} · {o.lots}</Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
