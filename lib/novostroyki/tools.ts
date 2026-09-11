/**
 * Инструменты новостроек-консультанта (retrieval-augmented tool-calling).
 * LLM НЕ видит базу — он вызывает эти инструменты, каждый возвращает узкую
 * выборку. Токен-бюджет диалога не зависит от размера базы.
 *
 * Порт ядра ЕКБ-консультанта на сайт: search_lots + get_offers + capture_lead.
 * Отличие от источника: capture_lead шлёт лид ТОЛЬКО в Telegram (durable-канал),
 * без таблицы lead (in-memory БД её не переживает).
 */
import { getDb } from "./db";
import { tgSend } from "@/lib/notify";

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

export async function searchLots(args: SearchArgs): Promise<Lot[]> {
  const db = await getDb();
  const where: string[] = ["l.status = 'available'"];
  const params: unknown[] = [];
  const p = (v: unknown) => (params.push(v), `$${params.length}`);

  if (Array.isArray(args.rooms) && args.rooms.length) where.push(`l.rooms = any(${p(args.rooms)}::int[])`);
  if (typeof args.price_min === "number") where.push(`l.price >= ${p(args.price_min)}`);
  if (typeof args.price_max === "number") where.push(`l.price <= ${p(args.price_max)}`);
  if (typeof args.area_min === "number") where.push(`l.area >= ${p(args.area_min)}`);
  if (typeof args.area_max === "number") where.push(`l.area <= ${p(args.area_max)}`);
  if (typeof args.floor_min === "number") where.push(`l.floor >= ${p(args.floor_min)}`);
  if (typeof args.floor_max === "number") where.push(`l.floor <= ${p(args.floor_max)}`);
  if (args.district) {
    const clauses = [`z.district ilike ${p("%" + args.district + "%")}`];
    for (const d of districtSynonyms(args.district)) clauses.push(`z.district = ${p(d)}`);
    where.push(`(${clauses.join(" or ")})`);
  }
  if (args.developer) where.push(`z.developer ilike ${p("%" + args.developer + "%")}`);
  if (args.zk_name) where.push(`z.name ilike ${p("%" + args.zk_name + "%")}`);
  if (args.deadline) where.push(`coalesce(l.deadline, z.deadline) ilike ${p("%" + args.deadline + "%")}`);
  if (args.finishing) where.push(`l.finishing ilike ${p("%" + args.finishing + "%")}`);
  if (args.only_discount) where.push(`l.price_base is not null and l.price_base > l.price`);

  const limit = Math.min(Math.max(Number(args.limit) || 8, 1), 15);

  const sql = `
    select l.id, l.zk_id, z.name as zk, z.developer, z.district, z.klass, z.metro,
           coalesce(l.deadline, z.deadline) as deadline, l.building,
           l.rooms, l.area, l.floor, l.floors_total, l.price, l.price_base,
           l.finishing, l.plan_url, l.source_url
    from lot l join zk z on z.id = l.zk_id
    where ${where.join(" and ")}
    order by (l.price_base is not null and l.price_base > l.price) desc, l.price asc
    limit ${limit}`;

  const res = await db.query<Record<string, unknown>>(sql, params);
  return res.rows.map((r) => {
    const price = r.price == null ? null : Number(r.price);
    const base = r.price_base == null ? null : Number(r.price_base);
    return {
      id: String(r.id), zk_id: String(r.zk_id), zk: String(r.zk),
      developer: (r.developer as string) ?? null, district: (r.district as string) ?? null,
      klass: (r.klass as string) ?? null, metro: (r.metro as string) ?? null,
      deadline: (r.deadline as string) ?? null, building: (r.building as string) ?? null,
      rooms: r.rooms == null ? null : Number(r.rooms), area: r.area == null ? null : Number(r.area),
      floor: r.floor == null ? null : Number(r.floor), floors_total: r.floors_total == null ? null : Number(r.floors_total),
      price, price_base: base, discount: base && price && base > price ? base - price : null,
      finishing: (r.finishing as string) ?? null, plan_url: (r.plan_url as string) ?? null,
      source_url: (r.source_url as string) ?? null,
    };
  });
}

/* ─── get_offers (акции + ипотека) ─── */

export type Promo = { developer: string; zk_name: string | null; title: string; description: string | null; discount_pct: number | null; valid_until: string | null };
export type Mortgage = { developer: string; program: string; rate: number | null; min_downpayment_pct: number | null; term_years: number | null; note: string | null };

export async function getOffers(args: { developer?: string; kind?: "promos" | "mortgage" | "all" }): Promise<{ promos: Promo[]; mortgage: Mortgage[] }> {
  const db = await getDb();
  const kind = args.kind ?? "all";
  const devFilter = args.developer ? "where developer ilike $1" : "";
  const p = args.developer ? [`%${args.developer}%`] : [];

  let promos: Promo[] = [];
  let mortgage: Mortgage[] = [];

  if (kind === "promos" || kind === "all") {
    const r = await db.query<Record<string, unknown>>(
      `select developer, zk_name, title, description, discount_pct, valid_until from promo ${devFilter} order by discount_pct desc nulls last limit 20`, p,
    );
    promos = r.rows.map((x) => ({
      developer: String(x.developer), zk_name: (x.zk_name as string) ?? null, title: String(x.title),
      description: (x.description as string) ?? null, discount_pct: x.discount_pct == null ? null : Number(x.discount_pct),
      valid_until: (x.valid_until as string) ?? null,
    }));
  }
  if (kind === "mortgage" || kind === "all") {
    const r = await db.query<Record<string, unknown>>(
      `select developer, program, rate, min_downpayment_pct, term_years, note from mortgage ${devFilter} order by rate asc nulls last limit 20`, p,
    );
    mortgage = r.rows.map((x) => ({
      developer: String(x.developer), program: String(x.program), rate: x.rate == null ? null : Number(x.rate),
      min_downpayment_pct: x.min_downpayment_pct == null ? null : Number(x.min_downpayment_pct),
      term_years: x.term_years == null ? null : Number(x.term_years), note: (x.note as string) ?? null,
    }));
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
