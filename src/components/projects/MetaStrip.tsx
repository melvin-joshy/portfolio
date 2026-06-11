type Item = { label: string; value: string };

export function MetaStrip({ items }: { items: Item[] }) {
  return (
    <div
      className="grid grid-cols-[1fr_1.1fr] gap-x-20 gap-y-10 border-y py-9 md:gap-x-32"
      style={{ borderColor: "rgba(255,255,255,0.08)" }}
    >
      {items.map((item) => (
        <div key={item.label}>
          <p
            className="text-[10px] tracking-[0.28em] uppercase text-white/40"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 500 }}
          >
            {item.label}
          </p>
          <p
            className="mt-3 text-[12px] tracking-[0.18em] uppercase text-white/85"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 400 }}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
