/**
 * Транспорт заявок в мессенджер.
 *
 * Telegram заблокирован из ДЦ Timeweb (сетевой блок контейнера — TCP:443 к
 * api.telegram.org даёт TIMEOUT и по IPv4, и по IPv6; DeepSeek с того же хоста
 * жив). Поэтому заявки уходят во входящие webhook Пачки (РФ-инфраструктура,
 * достижима с Timeweb). Два канала — заявки не смешиваются:
 *   - PACHCA_WEBHOOK_NOVOSTROYKI — чат заявок новостроек ЕКБ
 *   - PACHCA_WEBHOOK_AGENCY      — чат заявок агентства (сайт ЛУЧ + консультант)
 *
 * Входящий webhook принимает {"message": "..."} и публикует текст как есть
 * (markdown поддерживается, лимит ~40 000 байт). Персональных данных не
 * собираем: только телефон (без ФИО не образует ПД конкретного лица).
 *
 * Если webhook канала не задан в env — тихо пропускаем и логируем (не роняем
 * вызывающий роут).
 *
 * ВНИМАНИЕ: входящий webhook умеет только текст. Файлы (записи звонков в
 * app/api/lead) через него не отправить — для транзита файлов нужен REST API
 * Пачки (токен + chat_id). Пока файлы не пересылаются, в тексте лида остаётся
 * счётчик приложенных записей.
 */

export type LeadChannel = "novostroyki" | "agency";

function webhookUrl(channel: LeadChannel): string | null {
  const raw =
    channel === "novostroyki"
      ? process.env.PACHCA_WEBHOOK_NOVOSTROYKI
      : process.env.PACHCA_WEBHOOK_AGENCY;
  const url = raw?.trim();
  return url ? url : null;
}

/**
 * Отправить текст заявки во входящий webhook Пачки нужного канала.
 * Возвращает true при успехе. Провал не роняет вызывающий роут.
 */
export async function pachcaSend(
  channel: LeadChannel,
  text: string,
): Promise<boolean> {
  const url = webhookUrl(channel);
  if (!url) {
    console.error(`pachcaSend: PACHCA webhook для «${channel}» не настроен`);
    return false;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    if (!res.ok) {
      console.error("pachcaSend: pachca failed", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("pachcaSend: pachca error", e);
    return false;
  }
}
