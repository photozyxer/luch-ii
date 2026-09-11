/**
 * Слой каталога для pSEO-страниц новостроек (районы, ЖК, застройщики, pillar).
 *
 * Читает seed.json и считает агрегации на ЧИСТОМ JS (4649 лотов — мгновенно),
 * БЕЗ PGlite. Почему не БД: PGlite (WASM) не инициализируется при рендере
 * серверных компонентов Next (грузит .wasm через URL → падает), а страницы —
 * это server components. Консультанту (API-роут) БД доступна, а страницам она и
 * не нужна: тут только группировки/счётчики. Слаги — транслит русских названий.
 */
import seed from "./seed.json";

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i",
  й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t",
  у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "",
  э: "e", ю: "yu", я: "ya",
};

export function slugify(s: string): string {
  return s.toLowerCase().split("").map((c) => TRANSLIT[c] ?? c).join("")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const n = (v: unknown): number | null => (v == null || v === "" ? null : Number(v));

type RawZk = { id: string; name: string; developer: string | null; district: string | null; klass: string | null; deadline: string | null; address: string | null; description: string | null };
type RawLot = { id: string; zk_id: string; rooms: unknown; area: unknown; floor: unknown; floors_total: unknown; price: unknown; price_base: unknown; finishing: string | null; plan_url: string | null; deadline: string | null; building: string | null; status: string; source_url: string | null };
type RawPromo = { developer: string; zk_name: string | null; title: string; description: string | null; discount_pct: unknown; valid_until: string | null };
type RawMortgage = { developer: string; program: string; rate: unknown; min_downpayment_pct: unknown; term_years: unknown; note: string | null };
type Seed = { tables: { zk: RawZk[]; lot: RawLot[]; promo: RawPromo[]; mortgage: RawMortgage[] } };

export type LotCard = {
  id: string; zk: string; zk_id: string; developer: string | null; district: string | null;
  deadline: string | null; building: string | null; rooms: number | null; area: number | null;
  floor: number | null; floors_total: number | null; price: number | null; price_base: number | null;
  discount: number | null; finishing: string | null; plan_url: string | null; source_url: string | null;
};

/* ── индекс: собираем доступные лоты, обогащённые полями ЖК (один раз на модуль) ── */
const S = seed as unknown as Seed;
const ZK_BY_ID = new Map(S.tables.zk.map((z) => [z.id, z]));

const LOTS: LotCard[] = S.tables.lot
  .filter((l) => (l.status ?? "available") === "available")
  .map((l) => {
    const z = ZK_BY_ID.get(l.zk_id);
    const price = n(l.price), base = n(l.price_base);
    return {
      id: l.id, zk: z?.name ?? l.zk_id, zk_id: l.zk_id, developer: z?.developer ?? null,
      district: z?.district ?? null, deadline: l.deadline ?? z?.deadline ?? null, building: l.building ?? null,
      rooms: n(l.rooms), area: n(l.area), floor: n(l.floor), floors_total: n(l.floors_total),
      price, price_base: base, discount: base && price && base > price ? base - price : null,
      finishing: l.finishing ?? null, plan_url: l.plan_url ?? null, source_url: l.source_url ?? null,
    };
  });

const min = (xs: (number | null)[]) => { const v = xs.filter((x): x is number => x != null); return v.length ? Math.min(...v) : null; };
const max = (xs: (number | null)[]) => { const v = xs.filter((x): x is number => x != null); return v.length ? Math.max(...v) : null; };
const uniq = (xs: (string | null)[]) => [...new Set(xs.filter((x): x is string => !!x))];
/** Витрина: сначала со скидкой, потом дешевле. */
const showcase = (lots: LotCard[], limit = 6) =>
  [...lots].sort((a, b) => (Number(!!b.discount) - Number(!!a.discount)) || ((a.price ?? Infinity) - (b.price ?? Infinity))).slice(0, limit);

type ByRooms = { rooms: number | null; count: number; minPrice: number | null };
function byRooms(lots: LotCard[]): ByRooms[] {
  const g = new Map<number | null, LotCard[]>();
  for (const l of lots) { const k = l.rooms; if (!g.has(k)) g.set(k, []); g.get(k)!.push(l); }
  return [...g.entries()].map(([rooms, ls]) => ({ rooms, count: ls.length, minPrice: min(ls.map((x) => x.price)) }))
    .sort((a, b) => (a.rooms ?? 99) - (b.rooms ?? 99));
}

/* ─── Общая статистика (pillar) ─── */
export function overallStats() {
  return {
    lots: LOTS.length,
    zk: uniq(LOTS.map((l) => l.zk_id)).length,
    developers: uniq(LOTS.map((l) => l.developer)).length,
    districts: uniq(LOTS.map((l) => l.district)).length,
    minPrice: min(LOTS.map((l) => l.price)),
  };
}

/* ─── Районы ─── */
export type DistrictBrief = { name: string; slug: string; lots: number; minPrice: number | null; developers: number };

export function listDistricts(): DistrictBrief[] {
  const g = new Map<string, LotCard[]>();
  for (const l of LOTS) { if (!l.district) continue; if (!g.has(l.district)) g.set(l.district, []); g.get(l.district)!.push(l); }
  return [...g.entries()].map(([name, ls]) => ({ name, slug: slugify(name), lots: ls.length, minPrice: min(ls.map((x) => x.price)), developers: uniq(ls.map((x) => x.developer)).length }))
    .sort((a, b) => b.lots - a.lots);
}

export function getDistrict(slug: string) {
  const brief = listDistricts().find((d) => d.slug === slug);
  if (!brief) return null;
  const ls = LOTS.filter((l) => l.district === brief.name);
  const devMap = new Map<string, number>();
  for (const l of ls) { if (l.developer) devMap.set(l.developer, (devMap.get(l.developer) ?? 0) + 1); }
  return {
    ...brief, maxPrice: max(ls.map((x) => x.price)), byRooms: byRooms(ls),
    developers: [...devMap.entries()].map(([developer, lots]) => ({ developer, lots })).sort((a, b) => b.lots - a.lots),
    sampleLots: showcase(ls, 6),
  };
}

/* ─── Застройщики ─── */
export type DeveloperBrief = { name: string; slug: string; lots: number; minPrice: number | null; zk: number };

export function listDevelopers(): DeveloperBrief[] {
  const g = new Map<string, LotCard[]>();
  for (const l of LOTS) { if (!l.developer) continue; if (!g.has(l.developer)) g.set(l.developer, []); g.get(l.developer)!.push(l); }
  return [...g.entries()].map(([name, ls]) => ({ name, slug: slugify(name), lots: ls.length, minPrice: min(ls.map((x) => x.price)), zk: uniq(ls.map((x) => x.zk_id)).length }))
    .sort((a, b) => b.lots - a.lots);
}

export function getDeveloper(slug: string) {
  const brief = listDevelopers().find((d) => d.slug === slug);
  if (!brief) return null;
  const ls = LOTS.filter((l) => l.developer === brief.name);
  return { ...brief, byRooms: byRooms(ls), sampleLots: showcase(ls, 6), districts: uniq(ls.map((x) => x.district)) };
}

/* ─── ЖК ─── */
export type ZkBrief = { id: string; name: string; slug: string; developer: string | null; district: string | null; lots: number; minPrice: number | null };

export function listZk(): ZkBrief[] {
  const g = new Map<string, LotCard[]>();
  for (const l of LOTS) { if (!g.has(l.zk_id)) g.set(l.zk_id, []); g.get(l.zk_id)!.push(l); }
  return [...g.entries()].map(([id, ls]) => ({ id, name: ls[0].zk, slug: slugify(ls[0].zk), developer: ls[0].developer, district: ls[0].district, lots: ls.length, minPrice: min(ls.map((x) => x.price)) }))
    .sort((a, b) => b.lots - a.lots);
}

export function getZk(slug: string) {
  const brief = listZk().find((z) => z.slug === slug);
  if (!brief) return null;
  const z = ZK_BY_ID.get(brief.id);
  const ls = LOTS.filter((l) => l.zk_id === brief.id);
  return {
    ...brief, maxPrice: max(ls.map((x) => x.price)), address: z?.address ?? null, deadline: z?.deadline ?? null,
    klass: z?.klass ?? null, description: z?.description ?? null, byRooms: byRooms(ls), sampleLots: showcase(ls, 8),
  };
}

/* ─── Акции ─── */
export type Promo = { developer: string; zkName: string | null; title: string; description: string | null; discountPct: number | null; validUntil: string | null };

export function listPromos(): Promo[] {
  return S.tables.promo
    .map((p) => ({ developer: p.developer, zkName: p.zk_name, title: p.title, description: p.description, discountPct: n(p.discount_pct), validUntil: p.valid_until }))
    .sort((a, b) => (b.discountPct ?? -1) - (a.discountPct ?? -1));
}

/** Лоты с реальной скидкой (price_base > price) — для витрины на странице акций. */
export function discountedLots(limit = 8): LotCard[] {
  return showcase(LOTS.filter((l) => l.discount != null), limit);
}

/* ─── Ипотека ─── */
export type Mortgage = { developer: string; program: string; rate: number | null; minDownpaymentPct: number | null; termYears: number | null; note: string | null };

export function listMortgage(): Mortgage[] {
  return S.tables.mortgage
    .map((m) => ({ developer: m.developer, program: m.program, rate: n(m.rate), minDownpaymentPct: n(m.min_downpayment_pct), termYears: n(m.term_years), note: m.note }))
    .sort((a, b) => (a.rate ?? 999) - (b.rate ?? 999));
}

/* ─── Форматирование ─── */
export const fmtPrice = (v: number | null) => (v == null ? "—" : v.toLocaleString("ru-RU") + " ₽");
export const fmtMillions = (v: number | null) => (v == null ? "—" : (v / 1_000_000).toFixed(1).replace(".", ",") + " млн ₽");
export const roomsLabel = (r: number | null) => (r == null ? "" : r === 0 ? "Студия" : `${r}-комн.`);
