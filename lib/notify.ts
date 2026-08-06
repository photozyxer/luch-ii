/**
 * Пинг в Telegram БЕЗ персональных данных.
 *
 * Полная заявка (телефон, email, диалог) уходит письмом на РФ-ящик (см. lib/mailer),
 * а в Telegram шлём только факт «пришла заявка, проверь почту» + неперсональный
 * контекст (тема, компания/ЖК). Персональные данные на зарубежные серверы Telegram
 * не попадают (152-ФЗ, локализация ПД).
 *
 * Конфиг через env: TG_BOT_TOKEN, TG_CHAT_ID. Если не заданы — тихо пропускаем.
 */

const TG_API = "https://api.telegram.org";

/** Отправить короткий пинг без ПД. Провал не роняет вызывающий роут. */
export async function tgPing(text: string): Promise<void> {
  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;
  if (!token || !chatId) return; // TG-пинг опционален
  try {
    const res = await fetch(`${TG_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    if (!res.ok)
      console.error("tgPing: telegram failed", res.status, await res.text());
  } catch (e) {
    console.error("tgPing: telegram error", e);
  }
}
