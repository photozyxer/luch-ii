"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Lot = {
  id: string; zk: string; developer: string | null; district: string | null;
  deadline: string | null; building: string | null; rooms: number | null;
  area: number | null; floor: number | null; floors_total: number | null;
  price: number | null; price_base: number | null; discount: number | null;
  finishing: string | null; plan_url: string | null; source_url: string | null;
};
type Msg = { role: "user" | "assistant"; content: string; lots?: Lot[] };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Здравствуйте! Я подберу вам квартиру в новостройках Екатеринбурга 🏙 Помогу с ценами, планировками, сроками сдачи, акциями и ипотекой. Что ищете — район, бюджет, число комнат?",
};

const CHIPS = [
  "Однокомнатные до 5 млн",
  "Что есть в Академическом?",
  "Новостройки с чистовой отделкой",
  "Какие сейчас акции?",
  "Семейная ипотека — какие условия?",
  "Что сдаётся в 2026?",
];

const MAX_INPUT = 600;
const fmt = (n: number | null) => (n == null ? "" : n.toLocaleString("ru-RU"));
const rooms = (r: number | null) => (r == null ? "" : r === 0 ? "Студия" : `${r}-комн.`);

function LotCard({ l }: { l: Lot }) {
  return (
    <a
      href={l.source_url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="glass flex gap-3 rounded-xl p-3 transition-colors hover:border-white/25"
    >
      {l.plan_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={l.plan_url} alt="Планировка" className="h-20 w-20 shrink-0 rounded-lg bg-white object-contain p-1" loading="lazy" />
      )}
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">
          {rooms(l.rooms)}
          {l.area ? ` · ${l.area} м²` : ""}
          {l.floor ? ` · ${l.floor}${l.floors_total ? `/${l.floors_total}` : ""} эт.` : ""}
        </p>
        <p className="text-muted">
          {l.zk}
          {l.district ? ` · ${l.district}` : ""}
          {l.building ? ` · ${l.building}` : ""}
        </p>
        <p className="text-xs text-muted">
          {l.finishing ?? ""}
          {l.deadline ? ` · сдача ${l.deadline}` : ""}
        </p>
        <p className="mt-1 font-semibold text-white">
          {fmt(l.price)} ₽
          {l.price_base && l.discount ? (
            <span className="ml-2 text-xs font-normal text-muted line-through">{fmt(l.price_base)} ₽</span>
          ) : null}
          {l.discount ? <span className="ml-1 text-xs text-emerald-300">−{fmt(l.discount)} ₽</span> : null}
        </p>
      </div>
    </a>
  );
}

export default function NovostroykiChat() {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadSent, setLeadSent] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy]);

  const send = useCallback(
    async (text: string) => {
      const content = text.trim().slice(0, MAX_INPUT);
      if (!content || busy) return;
      setError(null);
      setInput("");

      const history: Msg[] = [...messages, { role: "user", content }];
      // приветствие в API не шлём (оно в системном промпте); история без lots
      const payload = history.slice(1).slice(-24).map((m) => ({ role: m.role, content: m.content }));
      setMessages(history);
      setBusy(true);

      try {
        const res = await fetch("/api/novostroyki/consult", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: payload }),
        });
        if (res.status === 429) throw new Error("Слишком много сообщений подряд — передохните минутку и продолжим.");
        if (res.status === 503) throw new Error("Сервис сейчас перегружен. Попробуйте, пожалуйста, чуть позже.");
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.reply) throw new Error("Не получилось ответить. Попробуйте ещё раз.");
        if (data.leadSent) setLeadSent(true);
        setMessages((m) => [...m, { role: "assistant", content: data.reply, lots: data.lots ?? [] }]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Что-то пошло не так. Попробуйте ещё раз.");
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, messages],
  );

  const showChips = messages.length <= 1 && !busy;

  return (
    <div className="glass flex h-[640px] flex-col overflow-hidden rounded-2xl sm:h-[700px]">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
          style={{ background: "linear-gradient(135deg, var(--c-cyan), var(--c-indigo))" }}
        >
          🏙
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">Консультант по новостройкам Екатеринбурга</p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            онлайн · подбор из всех ЖК
          </p>
        </div>
        {leadSent && (
          <span className="ml-auto shrink-0 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            ✓ заявка у менеджера
          </span>
        )}
      </div>

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-md bg-beam px-4 py-2.5 text-sm leading-relaxed text-white"
                  : "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-2.5 text-sm leading-relaxed"
              }
            >
              {m.content}
            </div>
            {m.lots && m.lots.length > 0 && (
              <div className="mt-2 grid w-full gap-2 sm:grid-cols-2">
                {m.lots.map((l) => <LotCard key={l.id} l={l} />)}
              </div>
            )}
          </div>
        ))}
        {busy && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-3">
              <span className="inline-flex gap-1">
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:0ms]" />
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:150ms]" />
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        {error && <p className="px-1 text-center text-xs text-amber-300/90">{error}</p>}
      </div>

      {showChips && (
        <div className="flex flex-wrap gap-2 px-4 pb-3 sm:px-5">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => send(c)}
              className="rounded-full border border-white/12 px-3.5 py-1.5 text-xs text-muted transition-colors hover:border-white/25 hover:text-fg"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex items-center gap-2 border-t border-white/10 px-4 py-3 sm:px-5"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={MAX_INPUT}
          placeholder="Например: 2-комнатная в Академическом до 8 млн…"
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted/60 focus:border-white/25"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="glow-beam shrink-0 rounded-xl bg-beam px-4 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        >
          →
        </button>
      </form>
    </div>
  );
}
