const topics: Record<string, string> = {
  tender: "Приглашение в тендер",
  calls: "Разбор 50 звонков",
  module: "Подключение модуля системы",
  estimate: "Расчёт сметы",
  consult: "Консультация",
};

const TG_API = "https://api.telegram.org";

/* ── лимиты полей: Telegram sendMessage ≤ 4096 символов, держим запас ── */
const LIMITS = {
  phone: 40,
  name: 120,
  email: 120,
  task: 1500,
  key: 40, // topic / module
};
const MAX_FILES = 10;
const MAX_FILES_BYTES = 4.5 * 1024 * 1024; // лимит тела Vercel

/* ── примитивный rate-limit по IP: N заявок в окно на тёплый инстанс ── */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
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
  // не даём Map расти бесконечно
  if (hits.size > 5000) hits.clear();
  return false;
}

const cut = (v: FormDataEntryValue | null, max: number) =>
  String(v ?? "")
    .trim()
    .slice(0, max);

export async function POST(req: Request) {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!token || !chatId) {
    console.error("lead: TG_BOT_TOKEN / TG_CHAT_ID are not configured");
    return Response.json({ error: "not configured" }, { status: 500 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
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

  const name = cut(form.get("name"), LIMITS.name);
  const email = cut(form.get("email"), LIMITS.email);
  const task = cut(form.get("task"), LIMITS.task);
  const topic = cut(form.get("topic"), LIMITS.key);
  const mod = cut(form.get("module"), LIMITS.key);

  // файлы валидируем на сервере: клиентский лимит обходится прямым POST
  const files = form
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_FILES);
  const totalBytes = files.reduce((s, f) => s + f.size, 0);
  if (totalBytes > MAX_FILES_BYTES) {
    return Response.json({ error: "files too large" }, { status: 413 });
  }

  const text = [
    "🌈 Новая заявка — сайт ЛУЧ-ИИ",
    `Тема: ${topics[topic] ?? "Заявка с сайта"}${mod ? ` · модуль ${mod}` : ""}`,
    `Телефон: ${phone}`,
    name ? `Имя: ${name}` : null,
    email ? `Email: ${email}` : null,
    task ? `\nЗадача / ссылка на звонки:\n${task}` : null,
    files.length ? `\nЗаписей приложено: ${files.length} (следом)` : null,
    `\nПолучено: ${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Yekaterinburg" })}`,
  ]
    .filter(Boolean)
    .join("\n");

  const msgRes = await fetch(`${TG_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!msgRes.ok) {
    console.error("telegram sendMessage failed", msgRes.status, await msgRes.text());
    return Response.json({ error: "telegram notify failed" }, { status: 500 });
  }

  // записи звонков — отдельными документами; их провал заявку не роняет
  for (const f of files) {
    const fd = new FormData();
    fd.append("chat_id", String(chatId));
    fd.append("document", f, f.name.slice(0, 120));
    fd.append("caption", `Запись от ${name || phone}`);
    const docRes = await fetch(`${TG_API}/bot${token}/sendDocument`, {
      method: "POST",
      body: fd,
    });
    if (!docRes.ok) {
      console.error("telegram sendDocument failed", docRes.status, await docRes.text());
    }
  }

  return Response.json({ ok: true });
}
