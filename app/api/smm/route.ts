import { KB } from "@/lib/consultant-kb";
import { FORMULAS, type FormulaId } from "@/lib/smm-brand";

/**
 * SMM-модуль (демо): генерация структуры виральной карусели.
 * Тема + формула → LLM (JSON) → слайды hook/value/cta + подпись + хэштеги.
 * Факты берёт из той же базы знаний «Притяжения», что и чат-консультант.
 */

const LLM_URL =
  process.env.LLM_BASE_URL ?? "https://api.openai.com/v1/chat/completions";
const LLM_MODEL = process.env.LLM_MODEL ?? "gpt-4.1";

const MAX_TOPIC = 200;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 15;
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

const SYSTEM = `Ты — SMM-редактор застройщика НИКС, делаешь виральные карусели для Instagram/VK про ЖК «Притяжение» (Екатеринбург, район Академический).

Тебе дают тему и виральную формулу. Собери карусель из 6–8 слайдов СТРОГО в JSON:

{
  "slides": [
    { "kind": "hook",  "title": "...", "text": "" },
    { "kind": "value", "title": "...", "text": "..." },
    ...
    { "kind": "cta",   "title": "...", "text": "..." }
  ],
  "caption": "...",
  "hashtags": ["...", "..."]
}

ПРАВИЛА:
- Первый слайд kind="hook": только title — цепляющий заголовок до 60 символов. Цифра, интрига или страх потери. Без воды.
- 4–6 слайдов kind="value": title до 40 символов (суть тезиса), text до 160 символов (раскрытие). Один тезис = один слайд. Конкретика и цифры из базы знаний, не общие слова.
- Последний слайд kind="cta": title — призыв (до 50 символов), text — телефон +7 (343) 343-28-27 и/или приглашение в офис.
- caption: подпись к посту до 500 символов, живым языком, с 1–2 эмодзи, в конце вопрос для комментариев.
- hashtags: 8–12 штук, микс широких (#новостройкиекатеринбург) и узких (#жкпритяжение).
- Факты (цены, акции, сроки) бери ТОЛЬКО из базы знаний ниже. Не выдумывай. Цены — с «от».
- Пиши на русском. Тон: полезный сосед-эксперт, не «купи-купи».

БАЗА ЗНАНИЙ:
${KB}`;

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("smm: OPENAI_API_KEY is not configured");
    return Response.json({ error: "not configured" }, { status: 500 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return Response.json({ error: "too many requests" }, { status: 429 });
  }

  let body: { topic?: unknown; formula?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  const topic = String(body.topic ?? "").trim().slice(0, MAX_TOPIC);
  const formula = FORMULAS.find((f) => f.id === body.formula);
  if (!topic || !formula) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  const upstream = await fetch(LLM_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      max_tokens: 1800,
      temperature: 0.8,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: `Тема: ${topic}\nФормула: ${formula.label} — ${formula.hint}`,
        },
      ],
    }),
  });

  if (!upstream.ok) {
    console.error("smm: llm failed", upstream.status, await upstream.text());
    return Response.json({ error: "llm unavailable" }, { status: 502 });
  }

  const data = await upstream.json();
  let parsed: {
    slides?: { kind?: string; title?: string; text?: string }[];
    caption?: string;
    hashtags?: string[];
  };
  try {
    parsed = JSON.parse(data.choices[0].message.content);
  } catch {
    return Response.json({ error: "bad llm output" }, { status: 502 });
  }

  // жёсткая валидация формы перед отдачей на клиент
  const slides = (parsed.slides ?? [])
    .filter((s) => s && typeof s.title === "string")
    .slice(0, 8)
    .map((s) => ({
      kind: s.kind === "hook" || s.kind === "cta" ? s.kind : ("value" as const),
      title: String(s.title).slice(0, 90),
      text: String(s.text ?? "").slice(0, 220),
    }));
  if (slides.length < 3) {
    return Response.json({ error: "bad llm output" }, { status: 502 });
  }

  return Response.json({
    slides,
    caption: String(parsed.caption ?? "").slice(0, 800),
    hashtags: (parsed.hashtags ?? [])
      .map((h) => String(h).replace(/\s/g, "").slice(0, 40))
      .filter(Boolean)
      .slice(0, 12),
  });
}
