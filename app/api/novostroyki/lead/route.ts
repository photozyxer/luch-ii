/**
 * Лид-форма новостроек: принимает ТОЛЬКО телефон (без имени → не ПД по решению
 * владельца) + необязательный контекст (что смотрел клиент), шлёт менеджеру в
 * Telegram. Не тратит LLM → без дневного бюджета, только per-IP лимит.
 */
import { pachcaSend } from "@/lib/notify";
import { rateLimit } from "@/lib/ratelimit";

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5; // заявок с одного IP в окно

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-real-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const limit = await rateLimit({ ip, tag: "novostroyki-lead", max: RATE_MAX, windowMs: RATE_WINDOW_MS });
  if (!limit.ok) return Response.json({ error: "Слишком много заявок, попробуйте позже." }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  const b = (body ?? {}) as { phone?: unknown; context?: unknown; company?: unknown };

  // honeypot: поле company люди не видят; заполнено → бот, отвечаем «ok»
  if (typeof b.company === "string" && b.company.trim()) return Response.json({ ok: true });

  const phone = String(b.phone ?? "").trim().slice(0, 40);
  if ((phone.match(/\d/g) ?? []).length < 6) {
    return Response.json({ error: "Укажите корректный номер телефона." }, { status: 400 });
  }
  const context = String(b.context ?? "").trim().slice(0, 200);

  const sent = await pachcaSend(
    "novostroyki",
    ["🏙 Заявка — новостройки Екатеринбурга", `Телефон: ${phone}`, context ? `Контекст: ${context}` : ""]
      .filter(Boolean)
      .join("\n"),
  );
  if (!sent) return Response.json({ error: "Не удалось отправить заявку. Попробуйте ещё раз." }, { status: 502 });
  return Response.json({ ok: true });
}
