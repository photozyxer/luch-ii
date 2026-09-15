/**
 * Инструменты новостроек-консультанта (retrieval-augmented tool-calling).
 * LLM НЕ видит базу — он вызывает эти инструменты, каждый возвращает узкую
 * выборку. Токен-бюджет диалога не зависит от размера базы.
 *
 * Порт ядра ЕКБ-консультанта на сайт: search_lots + get_offers + capture_lead.
 * Данные — из seed.json на ЧИСТОМ JS (как lib/novostroyki/catalog.ts), БЕЗ PGlite:
 * PGlite (WASM) не инициализируется в прод-сборке Next standalone
 * («TypeError: f.instantiateWasm is not a function»). capture_lead шлёт лид ТОЛЬКО
 * в Telegram (durable-канал), таблицы lead нет.
 */
import seed from "./seed.json";
import { tgSend } from "@/lib/notify";

/* ── данные из seed (строятся один раз на модуль) ── */
const num = (v: unknown): number | null => (v == null || v === "" ? null : Number(v));

type RawZk = { id: string; name: string; developer: string | null; district: string | null; klass: string | null; metro: string | null; deadline: string | null };
type RawLot = { id: string; zk_id: string; rooms: unknown; area: unknown; floor: unknown; floors_total: unknown; price: unknown; price_base: unknown; finishing: string | null; plan_url: string | null; deadline: string | null; building: string | null; status: string; source_url: string | null };
type RawPromo = { developer: string; zk_name: string | null; title: string; description: string | null; discount_pct: unknown; valid_until: string | null };
type RawMortgage = { developer: string; program: string; rate: unknown; min_downpayment_pct: unknown; term_years: unknown; note: string | null };
type SeedShape = { tables: { zk: RawZk[]; lot: RawLot[]; promo: RawPromo[]; mortgage: RawMortgage[] } };

const S = seed as unknown as SeedShape;
const ZK = new Map(S.tables.zk.map((z) => [z.id, z]));

/** Доступные лоты, обогащённые полями ЖК — в форме Lot (см. ниже). */
const ALL_LOTS: Lot[] = S.tables.lot
  .filter((l) => (l.status ?? "available") === "available")
  .map((l) => {
    const z = ZK.get(l.zk_id);
    const price = num(l.price), base = num(l.price_base);
    return {
      id: l.id, zk_id: l.zk_id, zk: z?.name ?? l.zk_id, developer: z?.developer ?? null,
      district: z?.district ?? null, klass: z?.klass ?? null, metro: z?.metro ?? null,
      deadline: l.deadline ?? z?.deadline ?? null, building: l.building ?? null,
      rooms: num(l.rooms), area: num(l.area), floor: num(l.floor), floors_total: num(l.floors_total),
      price, price_base: base, discount: base && price && base > price ? base - price : null,
      finishing: l.finishing ?? null, plan_url: l.plan_url ?? null, source_url: l.source_url ?? null,
    };
  });

/* ─── Схемы инструментов для LLM (function-calling) ─── */

export const TOOL_SCHEMAS = [
  {
    type: "function",
    function: {
      name: "search_lots",
      description:
        "Подобрать конкретные квартиры (лоты) из базы новостроек Екатеринбурга под запрос клиента. " +
        "Возвращает узкий список лотов с ценой, площадью, планировкой. Вызывай, как только известны хотя бы " +
        "бюджет ИЛИ число комнат. Не выдумывай квартиры — показывай только то, что вернул этот инструмент.",
      parameters: {
        type: "object",
        properties: {
          rooms: { type: "array", items: { type: "integer" }, description: "Число комнат (0 = студия). Можно несколько, напр. [1,2]." },
          price_min: { type: "integer", description: "Мин. бюджет, ₽" },
          price_max: { type: "integer", description: "Макс. бюджет, ₽" },
          area_min: { type: "number", description: "Мин. площадь, м²" },
          area_max: { type: "number", description: "Макс. площадь, м²" },
          floor_min: { type: "integer" },
          floor_max: { type: "integer" },
          district: {
            type: "string",
            description:
              "Район/микрорайон ЕКБ. В базе: ВИЗ, Академический, Центр, Пионерский, Уралмаш, Парковый, Вокзальный, Уктус, Вторчермет, Ботанический, Юго-Западный. " +
              "Понимает синонимы (Ботаника→Ботанический) и админ-районы (Чкаловский, Ленинский, Октябрьский, Орджоникидзевский, Кировский, Железнодорожный, Верх-Исетский).",
          },
          developer: { type: "string", description: "Застройщик (подстрока)" },
          zk_name: { type: "string", description: "Название ЖК (подстрока)" },
          deadline: { type: "string", description: "Срок сдачи КОНКРЕТНОГО лота (у корпусов/секций ЖК он разный): подстрока, напр. \"2026\" или \"Сдан\"" },
          finishing: {
            type: "string",
            description:
              "Тип отделки (подстрока). В базе: «Предчистовая», «Чистовая», «Без отделки», «Под чистовую». " +
              "Примеры: \"чистов\" — с чистовой/предчистовой; \"без отделки\" — под самостоятельный ремонт.",
          },
          only_discount: { type: "boolean", description: "Только лоты со скидкой/акцией" },
          limit: { type: "integer", description: "Сколько вернуть (1–15, по умолч. 8)" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_offers",
      description:
        "Текущие акции и ипотечные условия застройщика (ставки, программы: семейная/ИТ/господдержка, " +
        "рассрочка, первый взнос, срок, скидки со сроком действия). Вызывай, когда клиент спрашивает про " +
        "акции/скидки/ипотеку/рассрочку, ИЛИ чтобы подкрепить рекомендацию лота выгодой. Показывай только то, " +
        "что вернул инструмент — ставки и условия не выдумывай.",
      parameters: {
        type: "object",
        properties: {
          developer: { type: "string", description: "Застройщик (подстрока): Атлас, PRINZIP, ТЭН. Пусто = все." },
          kind: { type: "string", enum: ["promos", "mortgage", "all"], description: "Что вернуть (по умолч. all)." },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "capture_lead",
      description:
        "Зафиксировать заявку клиента, когда он согласился оставить контакт в обмен на ценность (зафиксировать " +
        "акцию/цену, персональный расчёт ипотеки, подборку в мессенджер, запись на просмотр). НЕ передавай телефон — " +
        "он берётся сервером автоматически и в диалог не попадает. Если телефона у сервера ещё нет, инструмент " +
        "попросит его — тогда вежливо запроси номер у клиента.",
      parameters: {
        type: "object",
        properties: {
          offer_type: {
            type: "string",
            enum: ["fix_price", "mortgage_calc", "selection", "viewing", "other"],
            description:
              "Что обещано клиенту за контакт: fix_price — зафиксировать цену/акцию; mortgage_calc — персональный " +
              "расчёт ипотеки; selection — подборка в мессенджер; viewing — запись на просмотр/бронь; other — иное.",
          },
          profile_summary: { type: "string", description: "Кратко: бюджет, комнаты, район, срок, ипотека — что известно из диалога." },
          recommended_zk_ids: { type: "array", items: { type: "string" }, description: "id ЖК, которые ты рекомендовал (из поля zk_id вернувшихся лотов)." },
        },
        required: ["profile_summary", "offer_type"],
      },
    },
  },
] as const;

/* ─── search_lots ─── */

export type Lot = {
  id: string; zk_id: string; zk: string; developer: string | null; district: string | null;
  klass: string | null; metro: string | null; deadline: string | null; building: string | null;
  rooms: number | null; area: number | null; floor: number | null; floors_total: number | null;
  price: number | null; price_base: number | null; discount: number | null;
  finishing: string | null; plan_url: string | null; source_url: string | null;
};

type SearchArgs = {
  rooms?: number[]; price_min?: number; price_max?: number; area_min?: number; area_max?: number;
  floor_min?: number; floor_max?: number; district?: string; developer?: string; zk_name?: string;
  deadline?: string; finishing?: string; only_discount?: boolean; limit?: number;
};

/**
 * Синонимы района → канонические значения в БД. Ключ — подстрока-стем запроса,
 * значение — районы, которые надо ДОБАВИТЬ к совпадениям. Покрывает то, что не
 * ловится подстрокой: морфологию (Ботаника vs Ботанический) и админ-районы.
 * ДОБАВКА к обычному ilike (через OR) — синонимы могут только расширить выборку.
 */
const DISTRICT_SYNONYMS: Record<string, string[]> = {
  "ботаника": ["Ботанический"], "академка": ["Академический"], "пионерка": ["Пионерский"],
  "центральн": ["Центр"], "вторчермет": ["Вторчермет"], "чермет": ["Вторчермет"],
  "верх-исетск": ["ВИЗ"], "верхисетск": ["ВИЗ"], "чкаловск": ["Уктус", "Вторчермет", "Ботанический"],
  "орджоникидзевск": ["Уралмаш"], "кировск": ["Пионерский"], "железнодорожн": ["Вокзальный"],
  "ленинск": ["Юго-Западный", "Центр"], "октябрьск": ["Парковый", "Центр"],
};

function districtSynonyms(query: string): string[] {
  const q = query.trim().toLowerCase();
  const out = new Set<string>();
  for (const [stem, districts] of Object.entries(DISTRICT_SYNONYMS)) {
    if (q.includes(stem)) districts.forEach((d) => out.add(d));
  }
  return [...out];
}

const ilike = (hay: string | null, needle: string) => (hay ?? "").toLowerCase().includes(needle.toLowerCase());

export async function searchLots(args: SearchArgs): Promise<Lot[]> {
  // район: подстрока ИЛИ синоним/админ-район (как было в SQL: ilike OR district=synonym)
  const syns = args.district ? districtSynonyms(args.district) : [];

  const out = ALL_LOTS.filter((l) => {
    if (Array.isArray(args.rooms) && args.rooms.length && !(l.rooms != null && args.rooms.includes(l.rooms))) return false;
    if (typeof args.price_min === "number" && !(l.price != null && l.price >= args.price_min)) return false;
    if (typeof args.price_max === "number" && !(l.price != null && l.price <= args.price_max)) return false;
    if (typeof args.area_min === "number" && !(l.area != null && l.area >= args.area_min)) return false;
    if (typeof args.area_max === "number" && !(l.area != null && l.area <= args.area_max)) return false;
    if (typeof args.floor_min === "number" && !(l.floor != null && l.floor >= args.floor_min)) return false;
    if (typeof args.floor_max === "number" && !(l.floor != null && l.floor <= args.floor_max)) return false;
    if (args.district && !(ilike(l.district, args.district) || (l.district != null && syns.includes(l.district)))) return false;
    if (args.developer && !ilike(l.developer, args.developer)) return false;
    if (args.zk_name && !ilike(l.zk, args.zk_name)) return false;
    if (args.deadline && !ilike(l.deadline, args.deadline)) return false;
    if (args.finishing && !ilike(l.finishing, args.finishing)) return false;
    if (args.only_discount && l.discount == null) return false;
    return true;
  });

  // сортировка: сначала со скидкой, затем дешевле
  out.sort((a, b) => (Number(!!b.discount) - Number(!!a.discount)) || ((a.price ?? Infinity) - (b.price ?? Infinity)));

  const limit = Math.min(Math.max(Number(args.limit) || 8, 1), 15);
  return out.slice(0, limit);
}

/* ─── get_offers (акции + ипотека) ─── */

export type Promo = { developer: string; zk_name: string | null; title: string; description: string | null; discount_pct: number | null; valid_until: string | null };
export type Mortgage = { developer: string; program: string; rate: number | null; min_downpayment_pct: number | null; term_years: number | null; note: string | null };

export async function getOffers(args: { developer?: string; kind?: "promos" | "mortgage" | "all" }): Promise<{ promos: Promo[]; mortgage: Mortgage[] }> {
  const kind = args.kind ?? "all";
  const devMatch = (dev: string) => !args.developer || ilike(dev, args.developer);

  let promos: Promo[] = [];
  let mortgage: Mortgage[] = [];

  if (kind === "promos" || kind === "all") {
    promos = S.tables.promo
      .filter((x) => devMatch(x.developer))
      .map((x) => ({ developer: x.developer, zk_name: x.zk_name, title: x.title, description: x.description, discount_pct: num(x.discount_pct), valid_until: x.valid_until }))
      .sort((a, b) => (b.discount_pct ?? -1) - (a.discount_pct ?? -1))
      .slice(0, 20);
  }
  if (kind === "mortgage" || kind === "all") {
    mortgage = S.tables.mortgage
      .filter((x) => devMatch(x.developer))
      .map((x) => ({ developer: x.developer, program: x.program, rate: num(x.rate), min_downpayment_pct: num(x.min_downpayment_pct), term_years: num(x.term_years), note: x.note }))
      .sort((a, b) => (a.rate ?? 999) - (b.rate ?? 999))
      .slice(0, 20);
  }
  return { promos, mortgage };
}

/* ─── capture_lead (лид → Telegram) ─── */

export type LeadContext = { phone: string | null; dialog: string };

const OFFER_LABEL: Record<string, string> = {
  fix_price: "зафиксировать цену/акцию", mortgage_calc: "персональный расчёт ипотеки",
  selection: "подборка в мессенджер", viewing: "запись на просмотр/бронь", other: "иное",
};

export async function captureLead(
  args: { profile_summary?: string; recommended_zk_ids?: string[]; offer_type?: string },
  ctx: LeadContext,
): Promise<{ ok: boolean; ask_phone?: boolean }> {
  if (!ctx.phone) return { ok: false, ask_phone: true };
  const offer = args.offer_type ?? "other";
  const sent = await tgSend(
    [
      "🏙 Лид — новостройки Екатеринбурга",
      `Телефон: ${ctx.phone}`,
      `Обещано: ${OFFER_LABEL[offer] ?? offer}`,
      args.profile_summary ? `\nПрофиль: ${args.profile_summary}` : "",
      args.recommended_zk_ids?.length ? `Рекомендованы ЖК: ${args.recommended_zk_ids.join(", ")}` : "",
    ].filter(Boolean).join("\n"),
  );
  return { ok: sent };
}
