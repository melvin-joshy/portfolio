import { FONTS } from "./projectStyle";

type Item = { label: string; value: string };

export function MetaStrip({ items }: { items: Item[] }) {
  return (
    <dl
      className="grid grid-cols-2 gap-x-14 gap-y-9 border-y py-8 md:grid-cols-4"
      style={{ borderColor: "rgba(255,255,255,0.08)" }}
    >
      {items.map((item) => (
        <div key={item.label}>
          <dt
            className="text-[10px] tracking-[0.24em] uppercase text-white/40"
            style={{ fontFamily: FONTS.mono, fontWeight: 500 }}
          >
            {item.label}
          </dt>
          <dd className="mt-3 text-[14px] leading-[1.45] text-white/85" style={{ fontFamily: FONTS.text }}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
