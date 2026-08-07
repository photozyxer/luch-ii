import { tgSend, tgSendDocument } from "@/lib/notify";
import { rateLimit } from "@/lib/ratelimit";

const topics: Record<string, string> = {
  tender: "Приглашение в тендер",
  calls: "Разбор 50 звонков",
  module: "Подключение модуля системы",
  estimate: "Расчёт сметы",
  consult: "Консультация",
};

/* ── лимиты полей: держим тело письма в разумных рамках ── */
const LIMITS = {
  phone: 40,
  email: 120,
  org: 160, // компания или ЖК
  task: 1500,
  key: 40, // topic / module
};
const MAX_FILES = 10;
const MAX_FILES_BYTES = 15 * 1024 * 1024; // разумный потолок для вложений письма

/* ── rate-limit по IP: N заявок в окно (см. lib/ratelimit — durable через Redis) ── */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

const cut = (v: FormDataEntryValue | null, max: number) =>
  String(v ?? "")
    .trim()
    .slice(0, max);

export async function POST(req: Request) {
  // x-real-ip выставляет платформа/прокси и клиент его не подделает;
  // x-forwarded-for — запасной, но его левый IP клиент может спуфить в обход лимита
  const ip =
    req.headers.get("x-real-ip")?.trim() ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  // budget не нужен: форма не тратит деньги на LLM, только шлёт письмо
  const limit = await rateLimit({
    ip,
    tag: "lead",
    max: RATE_MAX,
    windowMs: RATE_WINDOW_MS,
  });
  if (!limit.ok) {
    return Response.json({ error: "too many requests" }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "bad request" }, { status: 400 });
  }

  // honeypot: люди это поле не видят и не заполняют — боты заполняют.
  // Отвечаем «ok», чтобы бот считал отправку успешной.
  if (String(form.get("company") ?? "").trim()) {
    return Response.json({ ok: true });
  }

  const phone = cut(form.get("phone"), LIMITS.phone);
  // минимальная санити-проверка: в телефоне должно быть хотя бы 6 цифр
  if ((phone.match(/\d/g) ?? []).length < 6) {
    return Response.json({ error: "phone required" }, { status: 400 });
  }

  // имя не собираем — минимизация ПД (152-ФЗ). Вместо него — компания/ЖК (не ПД).
  const org = cut(form.get("org"), LIMITS.org);
  const email = cut(form.get("email"), LIMITS.email);
  const task = cut(form.get("task"), LIMITS.task);
  const topic = cut(form.get("topic"), LIMITS.key);
  const mod = cut(form.get("module"), LIMITS.key);
  const topicLabel = topics[topic] ?? "Заявка с сайта";

  // файлы валидируем на сервере: клиентский лимит обходится прямым POST
  const files = form
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_FILES);
  const totalBytes = files.reduce((s, f) => s + f.size, 0);
  if (totalBytes > MAX_FILES_BYTES) {
    return Response.json({ error: "files too large" }, { status: 413 });
  }

  const receivedAt = new Date().toLocaleString("ru-RU", {
    timeZone: "Asia/Yekaterinburg",
  });

  // ── заявка уходит в Telegram-бота (SMTP на Timeweb заблокирован) ──
  // Имя не собираем; телефон без ФИО персональных данных не образует.
  const text = [
    "🌈 Новая заявка — сайт ЛУЧ-ИИ",
    `Тема: ${topicLabel}${mod ? ` · модуль ${mod}` : ""}`,
    `Телефон: ${phone}`,
    org ? `Компания/ЖК: ${org}` : null,
    email ? `Email: ${email}` : null,
    task ? `\nЗадача / ссылка на звонки:\n${task}` : null,
    files.length ? `\nЗаписей приложено: ${files.length}` : null,
    `\nПолучено: ${receivedAt}`,
  ]
    .filter(Boolean)
    .join("\n");

  const sent = await tgSend(text);
  if (!sent) {
    return Response.json({ error: "notify failed" }, { status: 500 });
  }

  // записи звонков — отдельными документами в тот же чат (не блокируем ответ)
  await Promise.all(
    files.map(async (f) =>
      tgSendDocument(
        f.name.slice(0, 120) || "запись",
        Buffer.from(await f.arrayBuffer()),
        `Запись к заявке · ${topicLabel}`,
      ),
    ),
  ).catch(() => {});

  return Response.json({ ok: true });
}
