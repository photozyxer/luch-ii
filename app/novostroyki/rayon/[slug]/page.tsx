import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDistrict, listDistricts, fmtMillions, fmtPrice, roomsLabel } from "@/lib/novostroyki/catalog";
import NovostroykiLotCard from "@/components/novostroyki-lot-card";

export const dynamicParams = false; // только известные районы; прочее → 404

export async function generateStaticParams() {
  return (await listDistricts()).map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDistrict(slug);
  if (!d) return {};
  const title = `Новостройки в районе ${d.name} (Екатеринбург) — ${d.lots} квартир от ${fmtMillions(d.minPrice)}`;
  const description = `Купить квартиру в новостройке в районе ${d.name}, Екатеринбург: ${d.lots} квартир в продаже от ${d.developers.length} застройщиков, цены от ${fmtMillions(d.minPrice)}. Планировки, сроки сдачи, отделка, акции и ипотека — подбор с ИИ-консультантом.`;
  return { title, description, alternates: { canonical: `/novostroyki/rayon/${slug}` } };
}

const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
};

export default async function DistrictPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const d = await getDistrict(slug);
  if (!d) notFound();

  const others = (await listDistricts()).filter((x) => x.slug !== slug);
  const lotsWord = plural(d.lots, "квартира", "квартиры", "квартир");
  const devsList = d.developers.map((x) => x.developer).join(", ");

  const faq = [
    { q: `Сколько стоит квартира в новостройке в районе ${d.name}?`, a: `Сейчас в продаже ${d.lots} ${lotsWord} от ${fmtPrice(d.minPrice)} до ${fmtPrice(d.maxPrice)}. Точная цена зависит от площади, этажа, корпуса и отделки.` },
    { q: `Какие застройщики строят в районе ${d.name}?`, a: `В районе ${d.name} представлены: ${devsList}. Подобрать квартиру по нужным критериям поможет ИИ-консультант.` },
    { q: `Есть ли квартиры с готовой отделкой в районе ${d.name}?`, a: `Да, в базе есть варианты с разной отделкой — от «под чистовую» до «чистовой» (заезжай и живи). Уточните тип отделки у консультанта, и он покажет подходящие квартиры.` },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Новостройки Екатеринбурга", item: "/novostroyki" },
          { "@type": "ListItem", position: 2, name: `Район ${d.name}`, item: `/novostroyki/rayon/${slug}` },
        ],
      },
      { "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
      {
        "@type": "ItemList",
        itemListElement: d.sampleLots.map((l, i) => ({
          "@type": "ListItem", position: i + 1,
          item: { "@type": "Apartment", name: `${roomsLabel(l.rooms)} ${l.area ?? ""} м² в ЖК ${l.zk}`, numberOfRooms: l.rooms ?? undefined, floorSize: l.area ? { "@type": "QuantitativeValue", value: l.area, unitCode: "MTK" } : undefined, offers: l.price ? { "@type": "Offer", price: l.price, priceCurrency: "RUB", availability: "https://schema.org/InStock" } : undefined },
        })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-6 text-xs text-muted">
        <Link href="/novostroyki" className="hover:text-fg">Новостройки Екатеринбурга</Link>
        <span className="mx-1.5">/</span>
        <span className="text-fg">Район {d.name}</span>
      </nav>

      <h1 className="font-display text-2xl font-semibold sm:text-3xl">
        Новостройки в районе {d.name}, Екатеринбург
      </h1>
      <p className="mt-3 text-muted">
        В продаже <b className="text-fg">{d.lots} {lotsWord}</b> от {d.developers.length}{" "}
        {plural(d.developers.length, "застройщика", "застройщиков", "застройщиков")} — цены от{" "}
        <b className="text-fg">{fmtPrice(d.minPrice)}</b> до {fmtPrice(d.maxPrice)}. Подберём под ваш бюджет,
        число комнат, срок сдачи и отделку.
      </p>

      <Link href="/novostroyki" className="glow-beam mt-5 inline-block rounded-xl bg-beam px-5 py-3 text-sm font-semibold text-white">
        Подобрать квартиру в {d.name} с ИИ-консультантом →
      </Link>

      {/* по комнатности */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Квартиры в {d.name} по числу комнат</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {d.byRooms.map((r) => (
            <div key={String(r.rooms)} className="glass rounded-xl p-3 text-sm">
              <p className="font-semibold">{roomsLabel(r.rooms)}</p>
              <p className="text-muted">{r.count} шт · от {fmtPrice(r.minPrice)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* витрина лотов */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Примеры квартир в {d.name}</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {d.sampleLots.map((l) => <NovostroykiLotCard key={l.id} l={l} />)}
        </div>
      </section>

      {/* застройщики */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Застройщики в районе {d.name}</h2>
        <p className="mt-2 text-sm text-muted">{d.developers.map((x) => `${x.developer} (${x.lots})`).join(" · ")}</p>
      </section>

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Частые вопросы</h2>
        <div className="mt-3 space-y-3">
          {faq.map((f) => (
            <div key={f.q} className="glass rounded-xl p-4">
              <p className="text-sm font-semibold">{f.q}</p>
              <p className="mt-1.5 text-sm text-muted">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* перелинковка */}
      <section className="mt-10">
        <h2 className="font-display text-lg font-semibold">Новостройки в других районах</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {others.map((o) => (
            <Link key={o.slug} href={`/novostroyki/rayon/${o.slug}`} className="rounded-full border border-white/12 px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-white/25 hover:text-fg">
              {o.name} · {o.lots}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
