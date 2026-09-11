/**
 * Слой данных новостроек-консультанта на сайте.
 *
 * Данные (24 ЖК + 4649 лотов + акции/ипотека) собраны офлайн в ЕКБ-консультанте
 * и выгружены в seed.json. Здесь грузим их в PGlite (Postgres в WASM) В ПАМЯТИ —
 * та же SQL-схема, что в источнике, поэтому запросы (`lib/novostroyki/tools.ts`)
 * переносятся 1:1. База read-only, пересобирается из seed при старте контейнера;
 * путь к боевому Postgres — заменить клиент, запросы не трогать.
 */
import { PGlite } from "@electric-sql/pglite";
import seed from "./seed.json";

const SCHEMA = `
create table if not exists zk (
  id text primary key, name text not null, developer text, district text,
  klass text, metro text, deadline text, address text, description text, source_url text
);
create table if not exists lot (
  id text primary key, zk_id text not null, rooms int, area numeric, floor int,
  floors_total int, price bigint, price_base bigint, finishing text, plan_url text,
  deadline text, building text, status text default 'available',
  updated_at timestamptz, source_url text
);
create table if not exists promo (
  id text primary key, developer text not null, zk_id text, zk_name text, title text not null,
  description text, discount_pct numeric, valid_until text, source_url text, fetched_at timestamptz
);
create table if not exists mortgage (
  id text primary key, developer text not null, zk_id text, program text not null, rate numeric,
  min_downpayment_pct numeric, term_years int, note text, source_url text, fetched_at timestamptz
);
`;

type Row = Record<string, unknown>;
type Seed = { exported_at: string; tables: Record<string, Row[]> };

/** Пакетная вставка строк одной таблицы (параметризованно, без escaping). */
async function bulkInsert(db: PGlite, table: string, rows: Row[]) {
  if (!rows.length) return;
  const cols = Object.keys(rows[0]);
  const colList = cols.map((c) => `"${c}"`).join(",");
  const BATCH = 200;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const params: unknown[] = [];
    const tuples = chunk.map((row) => {
      const ph = cols.map((c) => {
        params.push(row[c] ?? null);
        return `$${params.length}`;
      });
      return `(${ph.join(",")})`;
    });
    await db.query(
      `insert into ${table} (${colList}) values ${tuples.join(",")} on conflict (id) do nothing`,
      params,
    );
  }
}

async function open(): Promise<PGlite> {
  const db = new PGlite(); // без пути = в памяти
  await db.waitReady;
  await db.exec(SCHEMA);
  const s = seed as unknown as Seed;
  for (const t of ["zk", "lot", "promo", "mortgage"]) {
    await bulkInsert(db, t, s.tables[t] ?? []);
  }
  return db;
}

let _db: PGlite | null = null;
let _ready: Promise<PGlite> | null = null;

/** Синглтон БД (переживает HMR в dev через globalThis). */
export function getDb(): Promise<PGlite> {
  const g = globalThis as unknown as { __novDb?: Promise<PGlite> };
  if (_db) return Promise.resolve(_db);
  if (!_ready) {
    _ready = g.__novDb ?? open();
    g.__novDb = _ready;
    _ready.then((db) => (_db = db));
  }
  return _ready;
}
