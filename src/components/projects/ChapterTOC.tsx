"use client";

import { useEffect, useState } from "react";

export type TOCItem = { id: string; label: string };

export function ChapterTOC({ title, items }: { title: string; items: TOCItem[] }) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    if (items.length === 0) return;
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      aria-label="Table of contents"
      className="group fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 items-center gap-3 md:flex"
    >
      {/* Expanded card — fades + slides in on hover */}
      <nav
        className="pointer-events-none translate-x-2 rounded-[10px] p-4 opacity-0 transition-all duration-200 ease-out group-hover:pointer-events-auto group-hover:translate-x-0 group-hover:opacity-100"
        style={{
          width: 240,
          background: "rgba(14,14,14,0.92)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03), 0 10px 30px rgba(0,0,0,0.4)",
          backdropFilter: "blur(8px)",
        }}
      >
        <p
          className="mb-3 px-2 text-[12px] leading-[1.35] text-white"
          style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
        >
          {title}
        </p>
        <ul className="space-y-0.5">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleClick(e, item.id)}
                  className={`block truncate rounded-[4px] px-2 py-1.5 text-[12px] transition-colors duration-200 ${
                    isActive ? "text-white" : "text-white/55 hover:bg-white/[0.04] hover:text-white/85"
                  }`}
                  style={{
                    fontFamily: "var(--font-inter)",
                    background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                  }}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Dash markers — always visible. Each row matches the card item below. */}
      <ul className="flex flex-col items-end gap-[14px] pr-1">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => handleClick(e, item.id)}
                aria-label={item.label}
                className="block transition-all duration-200"
                style={{
                  width: isActive ? 18 : 12,
                  height: 2,
                  background: isActive ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.55)",
                }}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
