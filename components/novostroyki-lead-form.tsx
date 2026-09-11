"use client";

import { useState } from "react";

/**
 * Лид-форма новостроек: только телефон (без имени → не ПД). context — что смотрел
 * клиент (напр. «Район Академический»), передаётся страницей для менеджера.
 */
export default function NovostroykiLeadForm({ context, title = "Оставьте номер — подберём и перезвоним" }: { context?: string; title?: string }) {
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state === "busy") return;
    if ((phone.match(/\d/g) ?? []).length < 6) {
      setError("Укажите корректный номер телефона.");
      return;
    }
    setError(null);
    setState("busy");
    try {
      const res = await fetch("/api/novostroyki/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, context, company }),
      });
      if (res.status === 429) throw new Error("Слишком много заявок подряд — попробуйте чуть позже.");
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) throw new Error("Не удалось отправить. Попробуйте ещё раз.");
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так.");
      setState("idle");
    }
  }

  if (state === "done") {
    return (
      <div className="glass rounded-2xl p-6 text-sm">
        <p className="font-semibold text-emerald-300">✓ Заявка принята</p>
        <p className="mt-1 text-muted">Менеджер перезвонит и подберёт варианты. Спасибо!</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass rounded-2xl p-6">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted">Только телефон — имя и лишние данные не спрашиваем.</p>
      {/* honeypot */}
      <input type="text" name="company" value={company} onChange={(e) => setCompany(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="mt-4 flex gap-2">
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+7 ___ ___-__-__"
          maxLength={40}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-white/25"
          disabled={state === "busy"}
        />
        <button
          type="submit"
          disabled={state === "busy"}
          className="glow-beam shrink-0 rounded-xl bg-beam px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          {state === "busy" ? "…" : "Отправить"}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-amber-300/90">{error}</p>}
      <p className="mt-2 text-[11px] leading-relaxed text-muted/60">
        Нажимая «Отправить», вы соглашаетесь на обработку номера для обратной связи.
      </p>
    </form>
  );
}
