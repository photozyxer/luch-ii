import { SYSTEM_PROMPT } from "@/lib/consultant-kb";
import { llmFetch } from "@/lib/llm";
import { sendLeadMail } from "@/lib/mailer";
import { tgPing } from "@/lib/notify";
import { rateLimit } from "@/lib/ratelimit";

/**
 * Чат ИИ-консультанта (демо агента «Консультант ЖК»).
 * Проксирует диалог в LLM (DeepSeek → OpenAI, см. lib/llm.ts) со стримингом;
 * если клиент оставил телефон — передаёт лид с историей диалога на РФ-почту,
 * а в Telegram шлёт только пинг без ПД.
 *
 * ПД в чате: перед отправкой в LLM телефоны/email в репликах маскируются, чтобы
 * персональные данные не уходили на зарубежный сервер модели (152-ФЗ). Исходный
 * текст используется только для извлечения телефона в лид (на РФ-почту).
 */

/* ── лимиты: публичный LLM-эндпоинт тратит реальные деньги ── */
const MAX_MESSAGES = 30; // реплик в истории на запрос
const MAX_MSG_CHARS = 600; // длина одной реплики
const MAX_TOKENS = 700;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 25; // сообщений с одного IP в окно

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
const PHONE_RE =
  /(?:\+7|8|7)?[\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

function findPhone(text: string): string | null {
  const m = text.match(PHONE_RE);
  if (!m) return null;
  const digits = m[0].replace(/\D/g, "");
  return digits.length >= 10 ? m[0].trim() : null;
}

/** Маскировка ПД (телефоны/email) в тексте перед отправкой в LLM. */
function redactPII(text: string): string {
  return text
    .replace(new RegExp(PHONE_RE, "g"), "[телефон]")
    .replace(EMAIL_RE, "[email]");
}

/** Лид на РФ-почту + пинг в Telegram без ПД. Провал не роняет чат. */
async function notifyLead(phone: string, history: Msg[]) {
  const dialog = history
    .slice(-12)
    .map((m) => `${m.role === "user" ? "👤" : "🤖"} ${m.content}`)
    .join("\n")
    .slice(0, 3000);
  const receivedAt = new Date().toLocaleString("ru-RU", {
    timeZone: "Asia/Yekaterinburg",
  });
  // полный лид с ПД — на РФ-ящик
  await sendLeadMail({
    subject: "Лид из чат-консультанта ЛУЧ-ИИ (демо)",
    text: [
      "💬 Лид из чат-консультанта (ЖК «Притяжение», демо)",
      `Телефон: ${phone}`,
      `\nДиалог:\n${dialog}`,
      `\nПолучено: ${receivedAt}`,
    ].join("\n"),
  });
  // пинг без ПД
  await tgPing(
    `💬 Новый лид из чат-консультанта (демо)\n📬 Телефон и диалог — на почте.\nПолучено: ${receivedAt}`,
  );
}

export async function POST(req: Request) {
  // x-real-ip выставляет платформа/прокси и клиент его не подделает;
  // x-forwarded-for — запасной, но его левый IP клиент может спуфить в обход лимита
  const ip =
    req.headers.get("x-real-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const limit = await rateLimit({
    ip,
    tag: "consult",
    max: RATE_MAX,
    windowMs: RATE_WINDOW_MS,
    budget: true, // тратит деньги на LLM → под дневным потолком
  });
  if (!limit.ok) {
    // budget: глобальный дневной потолок исчерпан → 503; ip: перебор с IP → 429
    return limit.reason === "budget"
      ? Response.json({ error: "temporarily unavailable" }, { status: 503 })
      : Response.json({ error: "too many requests" }, { status: 429 });
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

  // клиент оставил телефон в последней реплике → лид на РФ-почту (не блокируем ответ)
  const phone = findPhone(messages[messages.length - 1].content);
  const leadPromise = phone ? notifyLead(phone, messages) : null;

  // ПД в репликах маскируем перед отправкой в LLM (зарубежный сервер модели)
  const llmMessages = messages.map((m) => ({
    role: m.role,
    content: redactPII(m.content),
  }));

  const upstream = await llmFetch("consult", {
    stream: true,
    max_tokens: MAX_TOKENS,
    temperature: 0.7,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...llmMessages],
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
