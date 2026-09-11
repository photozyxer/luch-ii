/**
 * Общий rate-limit для публичных API-роутов (consult, smm, lead).
 *
 * Два уровня защиты:
 *   1. per-IP — не даём одному источнику долбить эндпоинт;
 *   2. дневной бюджет LLM — глобальный потолок запросов в сутки на все модули,
 *      что тратят деньги (consult, smm). Это защита кошелька от накрутки счёта.
 *
 * Хранилище:
 *   - Если настроен Upstash Redis (UPSTASH_REDIS_REST_* или KV_REST_API_*) —
 *     лимиты ДОЛГОВЕЧНЫ и ОБЩИЕ между всеми serverless-инстансами и холодными
 *     стартами. Только так лимит реально работает на Vercel.
 *   - Если Redis не настроен ИЛИ временно недоступен — откатываемся на
 *     in-memory (счётчик в памяти инстанса). Это слабее (сбрасывается на
 *     холодном старте, не виден другим инстансам), но fail-open: демо не ляжет
 *     из-за флака Redis.
 */

import { Redis } from "@upstash/redis";

export type LimitResult = { ok: true } | { ok: false; reason: "ip" | "budget" };

export type LimitOpts = {
  ip: string;
  tag: string; // "consult" | "smm" | "lead" — префикс ключей и тег логов
  max: number; // максимум запросов с одного IP в окне
  windowMs: number; // длина окна per-IP
  budget?: boolean; // учитывать в дневном бюджете LLM (для платных эндпоинтов)
};

/**
 * Дневной потолок запросов к LLM — СВОЙ на каждый тег (модуль), чтобы модули не
 * ели бюджет друг друга. Переопределяется env LLM_DAILY_CAP_<TAG> (напр.
 * LLM_DAILY_CAP_NOVOSTROYKI=1500), иначе общий LLM_DAILY_CAP, иначе 800.
 */
const DEFAULT_DAILY_CAP = Number(process.env.LLM_DAILY_CAP) || 800;
function dailyCap(tag: string): number {
  const v = Number(process.env[`LLM_DAILY_CAP_${tag.toUpperCase()}`]);
  return Number.isFinite(v) && v > 0 ? v : DEFAULT_DAILY_CAP;
}
const BUDGET_TTL_S = 48 * 60 * 60; // ключ дня живёт 48ч (с запасом на часовые пояса)

/* ── клиент Redis: строим один раз, null если не настроен ── */
let redisClient: Redis | null | undefined;
function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;
  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  redisClient = url && token ? new Redis({ url, token }) : null;
  if (!redisClient) {
    console.warn(
      "ratelimit: Upstash Redis не настроен — лимиты только in-memory (слабее)",
    );
  }
  return redisClient;
}

/* ── долговечный лимит через Redis (фиксированное окно на INCR) ── */
async function durable(redis: Redis, o: LimitOpts): Promise<LimitResult> {
  const bucket = Math.floor(Date.now() / o.windowMs);
  const ipKey = `rl:${o.tag}:${o.ip}:${bucket}`;

  const ipCount = await redis.incr(ipKey);
  if (ipCount === 1) await redis.pexpire(ipKey, o.windowMs);
  if (ipCount > o.max) return { ok: false, reason: "ip" };

  if (o.budget) {
    const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
    const dayKey = `llm:day:${o.tag}:${day}`; // свой счётчик на тег
    const dayCount = await redis.incr(dayKey);
    if (dayCount === 1) await redis.expire(dayKey, BUDGET_TTL_S);
    if (dayCount > dailyCap(o.tag)) return { ok: false, reason: "budget" };
  }
  return { ok: true };
}

/* ── in-memory fallback: per-IP скользящее окно + per-инстанс дневной бюджет ── */
const hits = new Map<string, number[]>();
const memBudget = new Map<string, number>(); // "tag:day" → счётчик

function memory(o: LimitOpts): LimitResult {
  const now = Date.now();
  const key = `${o.tag}:${o.ip}`;
  const arr = (hits.get(key) ?? []).filter((t) => now - t < o.windowMs);
  if (arr.length >= o.max) {
    hits.set(key, arr);
    return { ok: false, reason: "ip" };
  }
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear(); // не даём Map расти бесконечно

  if (o.budget) {
    const day = new Date().toISOString().slice(0, 10);
    const k = `${o.tag}:${day}`;
    const c = (memBudget.get(k) ?? 0) + 1;
    memBudget.set(k, c);
    // чистим счётчики прошлых дней, чтобы Map не рос
    if (memBudget.size > 50) for (const key of memBudget.keys()) if (!key.endsWith(day)) memBudget.delete(key);
    if (c > dailyCap(o.tag)) return { ok: false, reason: "budget" };
  }
  return { ok: true };
}

/**
 * Проверить лимит. При наличии Redis — долговечно; при его отсутствии/сбое —
 * откат в in-memory (fail-open, чтобы сайт не падал из-за Redis).
 */
export async function rateLimit(o: LimitOpts): Promise<LimitResult> {
  const redis = getRedis();
  if (redis) {
    try {
      return await durable(redis, o);
    } catch (e) {
      console.error(`${o.tag}: redis ratelimit error, откат в память`, e);
    }
  }
  return memory(o);
}
