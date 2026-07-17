import { KB } from "@/lib/consultant-kb";
import { llmFetch } from "@/lib/llm";
import { FORMULAS } from "@/lib/smm-brand";

/**
 * SMM-модуль (демо): генерация виральной карусели или одиночного поста.
 * Карусель: тема + формула → LLM (JSON) → слайды hook/value/cta + подпись + хэштеги.
 * Пост (mode="post"): тема → LLM (JSON) → title/text для картинки + подпись + хэштеги.
 * Факты берёт из той же базы знаний «Притяжения», что и чат-консультант.
 */

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

const SYSTEM_POST = `Ты — SMM-редактор застройщика НИКС, делаешь посты для Instagram/VK про ЖК «Притяжение» (Екатеринбург, район Академический). Слоган бренда: «Дом, который в тебя влюблен».

Тебе дают тему. Собери одиночный пост (одна картинка + подпись) СТРОГО в JSON:

{
  "title": "...",
  "text": "...",
  "caption": "...",
  "hashtags": ["...", "..."]
}

ПРАВИЛА:
- title: заголовок на картинке до 60 символов. Цепляющий, с цифрой или интригой, без воды.
- text: подзаголовок на картинке до 180 символов — раскрытие тезиса, конкретика из базы знаний.
- caption: подпись к посту до 600 символов, живым языком, с 1–2 эмодзи, в конце вопрос для комментариев.
- hashtags: 6–10 штук, микс широких (#новостройкиекатеринбург) и узких (#жкпритяжение).
- Факты (цены, акции, сроки) бери ТОЛЬКО из базы знаний ниже. Не выдумывай. Цены — с «от».
- Пиши на русском. Тон: полезный сосед-эксперт, не «купи-купи».

БАЗА ЗНАНИЙ:
${KB}`;

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
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return Response.json({ error: "too many requests" }, { status: 429 });
  }

  let body: { topic?: unknown; formula?: unknown; mode?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  const topic = String(body.topic ?? "").trim().slice(0, MAX_TOPIC);
  const mode = body.mode === "post" ? "post" : "carousel";
  const formula = FORMULAS.find((f) => f.id === body.formula);
  if (!topic || (mode === "carousel" && !formula)) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  const upstream = await llmFetch("smm", {
    max_tokens: 1800,
    temperature: 0.8,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: mode === "post" ? SYSTEM_POST : SYSTEM },
      {
        role: "user",
        content:
          mode === "post"
            ? `Тема: ${topic}`
            : `Тема: ${topic}\nФормула: ${formula!.label} — ${formula!.hint}`,
      },
    ],
  });

  if (!upstream) {
    return Response.json({ error: "not configured" }, { status: 500 });
  }
  if (!upstream.ok) {
    return Response.json({ error: "llm unavailable" }, { status: 502 });
  }

  const data = await upstream.json();
  let parsed: {
    slides?: { kind?: string; title?: string; text?: string }[];
    title?: string;
    text?: string;
    caption?: string;
    hashtags?: string[];
  };
  try {
    parsed = JSON.parse(data.choices[0].message.content);
  } catch {
    return Response.json({ error: "bad llm output" }, { status: 502 });
  }

  const caption = String(parsed.caption ?? "").slice(0, 800);
  const hashtags = (parsed.hashtags ?? [])
    .map((h) => String(h).replace(/\s/g, "").slice(0, 40))
    .filter(Boolean)
    .slice(0, 12);

  if (mode === "post") {
    const title = String(parsed.title ?? "").slice(0, 90);
    if (!title) {
      return Response.json({ error: "bad llm output" }, { status: 502 });
    }
    return Response.json({
      title,
      text: String(parsed.text ?? "").slice(0, 260),
      caption,
      hashtags,
    });
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

  return Response.json({ slides, caption, hashtags });
}
