const topics: Record<string, string> = {
  tender: "Приглашение в тендер",
  calls: "Разбор 50 звонков",
  module: "Подключение модуля системы",
  estimate: "Расчёт сметы",
  consult: "Консультация",
};

const TG_API = "https://api.telegram.org";

export async function POST(req: Request) {
  const form = await req.formData();

  const phone = String(form.get("phone") ?? "").trim();
  if (!phone) {
    return Response.json({ error: "phone required" }, { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const task = String(form.get("task") ?? "").trim();
  const topic = String(form.get("topic") ?? "").trim();
  const mod = String(form.get("module") ?? "").trim();
  const files = form
    .getAll("files")
    .filter((f): f is File => f instanceof File && f.size > 0);

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

  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

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
    fd.append("document", f, f.name);
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
