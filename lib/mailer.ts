/**
 * Отправка заявок на российский почтовый ящик через РФ-SMTP (Yandex 360 / Mail.ru).
 *
 * Зачем: заявки с сайта содержат персональные данные (телефон, email). По 152-ФЗ
 * первичная запись ПД граждан РФ должна происходить на серверах в РФ, а передача
 * на зарубежные серверы (как раньше — в Telegram) — нежелательна. Российский SMTP
 * и российский ящик держат весь путь ПД внутри РФ-контура.
 *
 * Конфиг через env (значения задаются в панели Timeweb, не в коде):
 *   SMTP_HOST   — напр. smtp.yandex.ru
 *   SMTP_PORT   — напр. 465
 *   SMTP_USER   — почтовый адрес-отправитель
 *   SMTP_PASS   — пароль приложения (не основной пароль!)
 *   LEAD_TO     — куда слать заявки (можно тот же ящик или несколько через запятую)
 *   LEAD_FROM   — опционально; по умолчанию SMTP_USER
 */

import nodemailer from "nodemailer";

export type MailAttachment = { filename: string; content: Buffer };

let transporter: nodemailer.Transporter | null | undefined;

function getTransport(): nodemailer.Transporter | null {
  if (transporter !== undefined) return transporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) {
    console.error("mailer: SMTP_HOST / SMTP_USER / SMTP_PASS не настроены");
    transporter = null;
    return null;
  }
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 → SSL, 587 → STARTTLS
    auth: { user, pass },
  });
  return transporter;
}

/**
 * Отправить заявку письмом. Возвращает true при успехе.
 * Провал логируется, но не роняет вызывающий роут (решение принимает вызывающий).
 */
export async function sendLeadMail(opts: {
  subject: string;
  text: string;
  attachments?: MailAttachment[];
}): Promise<boolean> {
  const tx = getTransport();
  if (!tx) return false;
  const to = process.env.LEAD_TO || process.env.SMTP_USER!;
  const from = process.env.LEAD_FROM || process.env.SMTP_USER!;
  try {
    await tx.sendMail({
      from,
      to,
      subject: opts.subject,
      text: opts.text,
      attachments: opts.attachments,
    });
    return true;
  } catch (e) {
    console.error("mailer: sendMail failed", e);
    return false;
  }
}
