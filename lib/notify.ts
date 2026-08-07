/**
 * Транспорт заявок в Telegram-бота.
 *
 * После переезда на РФ-хостинг (Timeweb App Platform) исходящий SMTP заблокирован
 * платформой (порты 25/465/587/2525 закрыты), поэтому заявки уходят менеджеру в
 * Telegram-бота. Персональных данных мы не собираем: имя в формах убрано, остаётся
 * только номер телефона (сам по себе, без ФИО, не образует ПД конкретного лица).
 *
 * Конфиг через env: TG_BOT_TOKEN, TG_CHAT_ID. Если не заданы — тихо пропускаем.
 */

const TG_API = "https://api.telegram.org";

function creds(): { token: string; chatId: string } | null {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!token || !chatId) return null;
  return { token, chatId };
}

/** Отправить текстовое сообщение в бота. Возвращает true при успехе. Провал не роняет вызывающий роут. */
export async function tgSend(text: string): Promise<boolean> {
  const c = creds();
  if (!c) {
    console.error("tgSend: TG_BOT_TOKEN / TG_CHAT_ID не настроены");
    return false;
  }
  try {
    const res = await fetch(`${TG_API}/bot${c.token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: c.chatId, text }),
    });
    if (!res.ok) {
      console.error("tgSend: telegram failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("tgSend: telegram error", e);
    return false;
  }
}

/** Отправить файл (запись звонка) документом в бота. Провал не роняет вызывающий роут. */
export async function tgSendDocument(
  filename: string,
  content: Buffer,
  caption?: string,
): Promise<boolean> {
  const c = creds();
  if (!c) return false;
  try {
    const fd = new FormData();
    fd.set("chat_id", c.chatId);
    if (caption) fd.set("caption", caption.slice(0, 1024));
    fd.set("document", new Blob([new Uint8Array(content)]), filename);
    const res = await fetch(`${TG_API}/bot${c.token}/sendDocument`, {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      console.error(
        "tgSendDocument: telegram failed",
        res.status,
        await res.text(),
      );
      return false;
    }
    return true;
  } catch (e) {
    console.error("tgSendDocument: telegram error", e);
    return false;
  }
}
