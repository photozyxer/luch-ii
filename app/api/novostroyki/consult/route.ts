/**
 * Новостройки-консультант — агентная петля (retrieval-augmented tool-calling).
 *
 * Поток: реплики клиента → маскировка ПД → LLM с инструментами. LLM НЕ видит
 * базу: он зовёт search_lots / get_offers (узкая выборка) и capture_lead (заявка).
 * Телефон извлекается сервером из сырого текста и в промпт LLM не попадает; лид
 * уходит в Telegram. Non-streaming: петля модель↔инструменты собирается здесь.
 *
 * Лимиты: публичный LLM-эндпоинт тратит деньги → per-IP + дневной бюджет LLM.
 */
import { SYSTEM_PROMPT } from "@/lib/novostroyki/kb";
import { llmChat, type LlmMessage } from "@/lib/novostroyki/llm";
import { findPhone, redactPII } from "@/lib/novostroyki/privacy";
import { TOOL_SCHEMAS, searchLots, getOffers, captureLead, type Lot } from "@/lib/novostroyki/tools";
import { rateLimit } from "@/lib/ratelimit";

const MAX_MESSAGES = 30;
const MAX_MSG_CHARS = 600;
const MAX_TOOL_ROUNDS = 4;

// per-IP: тщательная консультация — десятки реплик; режем скрипт-долбёжку.
const RATE_WINDOW_MS = 30 * 60 * 1000;
const RATE_MAX = 40; // сообщений с одного IP в окно

type Msg = { role: "user" | "assistant"; content: string };

function sanitize(raw: unknown): Msg[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) return null;
  const out: Msg[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") return null;
    const role = (m as Msg).role;
    const content = (m as Msg).content;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string" || !content.trim()) return null;
    out.push({ role, content: content.trim().slice(0, MAX_MSG_CHARS) });
  }
  if (out[out.length - 1].role !== "user") return null;
  return out;
}

/** Последний телефон в репликах клиента (для лида, не для LLM). */
function extractPhone(messages: Msg[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role !== "user") continue;
    const ph = findPhone(messages[i].content);
    if (ph) return ph;
  }
  return null;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-real-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const limit = await rateLimit({ ip, tag: "novostroyki", max: RATE_MAX, windowMs: RATE_WINDOW_MS, budget: true });
  if (!limit.ok) {
    // budget — дневной потолок LLM исчерпан (503); ip — перебор с одного IP (429)
    return limit.reason === "budget"
      ? Response.json({ error: "Сервис временно перегружен, попробуйте позже." }, { status: 503 })
      : Response.json({ error: "Слишком много запросов, сделайте паузу." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  const messages = sanitize((body as { messages?: unknown })?.messages);
  if (!messages) return Response.json({ error: "bad request" }, { status: 400 });

  const phone = extractPhone(messages);
  const dialog = messages.slice(-12).map((m) => `${m.role === "user" ? "👤" : "🤖"} ${m.content}`).join("\n");
  const leadCtx = { phone, dialog };

  const llmMessages: LlmMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.map((m) => ({ role: m.role, content: redactPII(m.content) })),
  ];

  const shownLots = new Map<string, Lot>();
  let leadSent = false;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const result = await llmChat({ messages: llmMessages, tools: TOOL_SCHEMAS as unknown as unknown[] });
    if (!result.ok) {
      const status = result.error === "not_configured" ? 500 : 502;
      return Response.json({ error: result.error }, { status });
    }
    const msg = result.message;
    llmMessages.push(msg);

    if (!msg.tool_calls || msg.tool_calls.length === 0) {
      return Response.json({ reply: msg.content ?? "", lots: [...shownLots.values()], leadSent });
    }

    for (const tc of msg.tool_calls) {
      let args: Record<string, unknown> = {};
      try {
        args = JSON.parse(tc.function.arguments || "{}");
      } catch {
        /* битый JSON от модели — пустые аргументы */
      }
      let toolResult: unknown;
      if (tc.function.name === "search_lots") {
        const lots = await searchLots(args);
        for (const l of lots) shownLots.set(l.id, l);
        toolResult = { count: lots.length, lots };
      } else if (tc.function.name === "get_offers") {
        toolResult = await getOffers(args);
      } else if (tc.function.name === "capture_lead") {
        const r = await captureLead(args, leadCtx);
        if (r.ok) leadSent = true;
        toolResult = r;
      } else {
        toolResult = { error: "unknown tool" };
      }
      llmMessages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify(toolResult) });
    }
  }

  return Response.json({
    reply: "Секунду — уточните, пожалуйста, бюджет и число комнат, и я подберу варианты.",
    lots: [...shownLots.values()],
    leadSent,
  });
}
