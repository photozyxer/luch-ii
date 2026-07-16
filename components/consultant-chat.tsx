"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Здравствуйте! Я Ника, консультант ЖК «Притяжение» от застройщика НИКС 🏡 Помогу подобрать квартиру с готовой отделкой, расскажу про цены, акции и ипотеку. Что вас интересует?",
};

const CHIPS = [
  "Какие квартиры есть в продаже?",
  "Какие сейчас акции?",
  "Есть однокомнатные?",
  "Ипотека под 3,5% — правда?",
  "А если дорого?",
  "Когда сдача дома?",
];

const MAX_INPUT = 600;

export default function ConsultantChat() {
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leadSent, setLeadSent] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // автопрокрутка к последней реплике
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
      // системное приветствие в API не отправляем — оно уже в промпте поведения
      const payload = history.slice(1).slice(-24);
      setMessages(history);
      setBusy(true);

      try {
        const res = await fetch("/api/consult", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: payload }),
        });
        if (res.status === 429) {
          throw new Error(
            "Слишком много сообщений подряд — передохните минутку и продолжим.",
          );
        }
        if (!res.ok || !res.body) {
          throw new Error("Не получилось ответить. Попробуйте ещё раз.");
        }
        if (res.headers.get("x-lead-sent")) setLeadSent(true);

        setMessages((m) => [...m, { role: "assistant", content: "" }]);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const delta = decoder.decode(value, { stream: true });
          if (!delta) continue;
          setMessages((m) => {
            const last = m[m.length - 1];
            return [
              ...m.slice(0, -1),
              { ...last, content: last.content + delta },
            ];
          });
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Что-то пошло не так. Попробуйте ещё раз.",
        );
        // пустой ответ ассистента не оставляем
        setMessages((m) =>
          m[m.length - 1]?.role === "assistant" && !m[m.length - 1].content
            ? m.slice(0, -1)
            : m,
        );
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, messages],
  );

  const showChips = messages.length <= 1 && !busy;

  return (
    <div className="glass flex h-[640px] flex-col overflow-hidden rounded-2xl sm:h-[680px]">
      {/* шапка */}
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-semibold text-white"
          style={{
            background:
              "linear-gradient(135deg, var(--c-cyan), var(--c-indigo))",
          }}
        >
          Н
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            Ника · консультант ЖК «Притяжение»
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            онлайн, отвечает за секунды
          </p>
        </div>
        {leadSent && (
          <span className="ml-auto shrink-0 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
            ✓ заявка у менеджера
          </span>
        )}
      </div>

      {/* лента сообщений */}
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5">
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-md bg-beam px-4 py-2.5 text-sm leading-relaxed text-white"
                  : "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-2.5 text-sm leading-relaxed"
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-white/[0.06] px-4 py-3">
              <span className="typing-dots inline-flex gap-1">
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:0ms]" />
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:150ms]" />
                <i className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        {error && (
          <p className="px-1 text-center text-xs text-amber-300/90">{error}</p>
        )}
      </div>

      {/* быстрые вопросы */}
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

      {/* ввод */}
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
          placeholder="Напишите вопрос…"
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
