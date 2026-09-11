/**
 * Маскировка ПД перед отправкой в LLM (зарубежный сервер модели).
 * Телефон/email в репликах клиента заменяются на плейсхолдеры; исходный текст
 * используется только сервером для извлечения телефона в лид (в промпт не идёт).
 * Портирован из luch/app/api/consult/route.ts.
 */

/** Телефон в свободном тексте: ≥10 цифр подряд с учётом разделителей. */
export const PHONE_RE =
  /(?:\+7|8|7)?[\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/;
const EMAIL_RE = /[^\s@]+@[^\s@]+\.[^\s@]+/g;

/** Извлечь телефон из сырого текста (для лида, не для LLM). */
export function findPhone(text: string): string | null {
  const m = text.match(PHONE_RE);
  if (!m) return null;
  const digits = m[0].replace(/\D/g, "");
  return digits.length >= 10 ? m[0].trim() : null;
}

/** Замаскировать телефоны/email в тексте перед отправкой в LLM. */
export function redactPII(text: string): string {
  return text
    .replace(new RegExp(PHONE_RE, "g"), "[телефон]")
    .replace(EMAIL_RE, "[email]");
}
