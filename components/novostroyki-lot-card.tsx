import { type LotCard as Lot, fmtPrice, roomsLabel } from "@/lib/novostroyki/catalog";

/** Серверная карточка лота для pSEO-страниц (ссылка на источник застройщика). */
export default function NovostroykiLotCard({ l }: { l: Lot }) {
  return (
    <a
      href={l.source_url ?? "#"}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="glass flex gap-3 rounded-xl p-3 transition-colors hover:border-white/25"
    >
      {l.plan_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={l.plan_url} alt={`Планировка ${roomsLabel(l.rooms)} в ЖК ${l.zk}`} className="h-24 w-24 shrink-0 rounded-lg bg-white/5 object-contain" loading="lazy" />
      )}
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">
          {roomsLabel(l.rooms)}
          {l.area ? ` · ${l.area} м²` : ""}
          {l.floor ? ` · ${l.floor}${l.floors_total ? `/${l.floors_total}` : ""} эт.` : ""}
        </p>
        <p className="text-muted">
          {l.zk}
          {l.district ? ` · ${l.district}` : ""}
          {l.building ? ` · ${l.building}` : ""}
        </p>
        <p className="text-xs text-muted">
          {l.finishing ?? ""}
          {l.deadline ? ` · сдача ${l.deadline}` : ""}
        </p>
        <p className="mt-1 font-semibold text-white">
          {fmtPrice(l.price)}
          {l.price_base && l.discount ? <span className="ml-2 text-xs font-normal text-muted line-through">{fmtPrice(l.price_base)}</span> : null}
          {l.discount ? <span className="ml-1 text-xs text-emerald-300">−{fmtPrice(l.discount)}</span> : null}
        </p>
      </div>
    </a>
  );
}
