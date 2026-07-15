/** Бесконечная бегущая строка из тегов. Чистый CSS, пауза по hover. */
export default function Marquee({ items }: { items: string[] }) {
  const row = (
    <>
      {items.map((t) => (
        <span
          key={t}
          className="mx-3 inline-flex items-center gap-3 whitespace-nowrap text-sm text-muted"
        >
          <span
            className="h-1 w-1 rounded-full"
            style={{ background: "var(--c-indigo)" }}
            aria-hidden
          />
          {t}
        </span>
      ))}
    </>
  );

  return (
    <div
      className="marquee overflow-hidden py-6"
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent)",
      }}
    >
      <div className="marquee-track">
        <div className="flex shrink-0">{row}</div>
        <div className="flex shrink-0" aria-hidden>
          {row}
        </div>
      </div>
    </div>
  );
}
