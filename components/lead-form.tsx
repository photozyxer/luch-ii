"use client";

import { useRef, useState } from "react";

/** Лимит тела запроса на Vercel — 4.5 МБ, оставляем запас на поля формы. */
const MAX_FILES_BYTES = 4 * 1024 * 1024;

const field =
  "w-full rounded-xl border border-line bg-surface px-4 py-3 text-base text-fg placeholder:text-muted/70 outline-none transition-colors focus:border-indigo";

export default function LeadForm({
  topic,
  module,
}: {
  topic?: string;
  module?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [fileError, setFileError] = useState("");
  const [fileNames, setFileNames] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  function onFilesChange() {
    const files = Array.from(fileRef.current?.files ?? []);
    const total = files.reduce((s, f) => s + f.size, 0);
    if (total > MAX_FILES_BYTES) {
      setFileError(
        "Файлы больше 4 МБ не пролезут — вставьте ссылку на Яндекс.Диск или облако в поле выше."
      );
      if (fileRef.current) fileRef.current.value = "";
      setFileNames([]);
      return;
    }
    setFileError("");
    setFileNames(files.map((f) => f.name));
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        body: new FormData(form),
      });
      if (!res.ok) throw new Error();
      setStatus("ok");
      form.reset();
      setFileNames([]);
    } catch {
      setStatus("error");
    }
  }

  if (status === "ok") {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="font-display text-xl font-semibold">Заявка ушла</p>
        <p className="mt-2 text-muted">
          Свяжемся в течение рабочего дня по телефону, который вы оставили.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {topic && <input type="hidden" name="topic" value={topic} />}
      {module && <input type="hidden" name="module" value={module} />}

      {/* honeypot: скрыт от людей, боты заполняют — сервер такие заявки молча отбрасывает */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="sr-only"
      />

      <input
        name="phone"
        required
        type="tel"
        maxLength={40}
        placeholder="Телефон*"
        className={field}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <input name="name" maxLength={120} placeholder="Имя" className={field} />
        <input name="email" type="email" maxLength={120} placeholder="Email" className={field} />
      </div>
      <textarea
        name="task"
        rows={4}
        maxLength={1500}
        placeholder="Опишите задачу или проблему — или вставьте ссылку на записи звонков"
        className={field}
      />

      <div>
        <label
          className="hairline block cursor-pointer rounded-xl px-4 py-3 text-sm text-muted transition-colors hover:text-fg"
          htmlFor="lead-files"
        >
          📎 Прикрепить записи звонков{" "}
          <span className="opacity-60">(до 4 МБ; больше — ссылкой)</span>
          <input
            id="lead-files"
            ref={fileRef}
            onChange={onFilesChange}
            name="files"
            type="file"
            multiple
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.zip"
            className="sr-only"
          />
        </label>
        {fileNames.length > 0 && (
          <p className="mt-2 text-xs text-muted">{fileNames.join(" · ")}</p>
        )}
        {fileError && <p className="mt-2 text-xs text-warm">{fileError}</p>}
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="glow-beam w-full rounded-xl bg-beam px-6 py-3.5 font-semibold text-white transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {status === "sending" ? "Отправляем…" : "Отправить"}
      </button>
      {status === "error" && (
        <p className="text-sm text-warm">
          Не отправилось — попробуйте ещё раз через минуту.
        </p>
      )}
      <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-indigo"
        />
        <span>
          Я согласен на обработку моих персональных данных в соответствии с{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg underline decoration-line underline-offset-2 hover:decoration-fg"
          >
            Политикой обработки персональных данных
          </a>
          .
        </span>
      </label>
    </form>
  );
}
