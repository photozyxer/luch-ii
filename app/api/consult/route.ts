import { SYSTEM_PROMPT } from "@/lib/consultant-kb";
import { llmFetch } from "@/lib/llm";

/**
 * Чат ИИ-консультанта (демо агента «Консультант ЖК»).
 * Проксирует диалог в LLM (DeepSeek → OpenAI, см. lib/llm.ts) со стримингом;
 * если клиент оставил телефон — передаёт лид с историей диалога в Telegram.
 */

const TG_API = "https://api.telegram.org";

/* ── лимиты: публичный LLM-эндпоинт тратит реальные деньги ── */
const MAX_MESSAGES = 30; // реплик в истории на запрос
const MAX_MSG_CHARS = 600; // длина одной реплики
const MAX_TOKENS = 700;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 25; // сообщений с одного IP в окно
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return false;
}

type Msg = { role: "user" | "assistant"; content: string };

function sanitize(raw: unknown): Msg[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES)
    return null;
  const out: Msg[] = [];
  for (const m of raw) {
    if (!m || typeof m !== "object") return null;
    const role = (m as Msg).role;
    const content = (m as Msg).content;
    if (role !== "user" && role !== "assistant") return null;
    if (typeof content !== "string" || !content.trim()) return null;
    out.push({ role, content: content.trim().slice(0, MAX_MSG_CHARS) });
  }
  // диалог должен заканчиваться репликой клиента
  if (out[out.length - 1].role !== "user") return null;
  return out;
}

/** Телефон в свободном тексте: ≥10 цифр подряд с учётом разделителей. */
function findPhone(text: string): string | null {
  const m = text.match(/(?:\+7|8|7)?[\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/);
  if (!m) return null;
  const digits = m[0].replace(/\D/g, "");
  return digits.length >= 10 ? m[0].trim() : null;
}

/** Лид в Telegram — провал отправки не роняет чат. */
async function notifyLead(phone: string, history: Msg[]) {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!token || !chatId) {
    console.error("consult: TG_BOT_TOKEN / TG_CHAT_ID are not configured");
    return;
  }
  const dialog = history
    .slice(-12)
    .map((m) => `${m.role === "user" ? "👤" : "🤖"} ${m.content}`)
    .join("\n")
    .slice(0, 3000);
  const text = [
    "💬 Лид из чат-консультанта (ЖК «Притяжение», демо)",
    `Телефон: ${phone}`,
    `\nДиалог:\n${dialog}`,
    `\nПолучено: ${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Yekaterinburg" })}`,
  ].join("\n");
  try {
    const res = await fetch(`${TG_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!res.ok)
      console.error("consult: telegram failed", res.status, await res.text());
  } catch (e) {
    console.error("consult: telegram error", e);
  }
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return Response.json({ error: "too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  const messages = sanitize((body as { messages?: unknown })?.messages);
  if (!messages) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  // клиент оставил телефон в последней реплике → лид в Telegram (не блокируем ответ)
  const phone = findPhone(messages[messages.length - 1].content);
  const leadPromise = phone ? notifyLead(phone, messages) : null;

  const upstream = await llmFetch("consult", {
    stream: true,
    max_tokens: MAX_TOKENS,
    temperature: 0.7,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
  });

  if (!upstream) {
    return Response.json({ error: "not configured" }, { status: 500 });
  }
  if (!upstream.ok || !upstream.body) {
    return Response.json({ error: "llm unavailable" }, { status: 502 });
  }

  // SSE LLM → чистый текстовый стрим для клиента
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buf = "";
  const stream = upstream.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buf += decoder.decode(chunk, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          const data = line.trim();
          if (!data.startsWith("data:")) continue;
          const payload = data.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const delta =
              JSON.parse(payload)?.choices?.[0]?.delta?.content ?? "";
            if (delta) controller.enqueue(encoder.encode(delta));
          } catch {
            /* неполный JSON между чанками — дособерётся */
          }
        }
      },
    }),
  );

  // заголовок сообщает клиенту, что лид ушёл (для бейджа в UI)
  const headers = new Headers({
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  if (phone) headers.set("x-lead-sent", "1");
  if (leadPromise) leadPromise.catch(() => {});

  return new Response(stream, { headers });
}
