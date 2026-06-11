"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScribbleUnderline } from "@/components/ScribbleUnderline";
import { useRouteTransition } from "@/components/RouteTransition";

function Clock() {
  const [t, setT] = useState("");
  useEffect(() => {
    const tick = () =>
      setT(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <>{t}</>;
}

export function ProjectChrome({ children }: { children: React.ReactNode }) {
  const go = useRouteTransition();
  return (
    <div className="min-h-screen bg-[#080808] text-white">
      <nav
        className="min-h-11 shrink-0 grid grid-cols-[auto_1fr] md:grid-cols-3 items-center gap-3 px-4 py-2 md:px-8 md:py-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.14)" }}
      >
        <div
          className="hidden md:flex items-center gap-3 text-[10px] tracking-[0.25em] uppercase"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          <span>India</span>
          {/* eslint-disable-next-line react/jsx-no-comment-textnodes */}
          <span style={{ color: "rgba(255,255,255,0.28)" }}>//</span>
          <Clock />
        </div>
        <div className="flex justify-start md:justify-center">
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              src="/logo%20mj.svg"
              alt="MJ"
              style={{ height: 22, width: "auto", opacity: 0.65 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          </Link>
        </div>
        <div className="flex flex-wrap justify-end gap-x-5 gap-y-2 text-[10px] tracking-[0.25em] uppercase">
          {[
            { label: "About", onClick: () => go("/about"), href: undefined as string | undefined },
            {
              label: "Resume",
              onClick: undefined,
              href: "https://drive.google.com/file/d/1YRxY_9YcVx3SqbN-la49XKdes4CCp1xh/view?usp=sharing",
            },
            { label: "Contact", onClick: undefined, href: "mailto:melvinjoshy5@gmail.com" },
          ].map(({ label, onClick, href }) => {
            const Tag = onClick ? "button" : "a";
            return (
              <Tag
                key={label}
                {...(onClick
                  ? { onClick }
                  : {
                      href,
                      target: label === "Resume" ? "_blank" : undefined,
                      rel: label === "Resume" ? "noopener noreferrer" : undefined,
                    })}
                className="transition-colors duration-300 uppercase tracking-[0.25em] text-[10px]"
                style={{ color: "rgba(255,255,255,0.72)" }}
              >
                <ScribbleUnderline color="#c0392b" strokeWidth={1.6} offsetY={2}>
                  {label}
                </ScribbleUnderline>
              </Tag>
            );
          })}
        </div>
      </nav>

      {children}

      <footer
        className="mt-32 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-6 md:justify-between md:px-12"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <p className="text-[8px] tracking-[0.2em] uppercase text-white/55">© 2025 Melvin Joshy</p>
        <p className="text-[8px] tracking-[0.2em] uppercase text-white/40">Crafted with love</p>
        <a
          href="mailto:melvinjoshy5@gmail.com"
          className="text-[8px] tracking-[0.2em] uppercase text-white/55 transition-colors duration-300 hover:text-white"
        >
          melvinjoshy5@gmail.com
        </a>
      </footer>
    </div>
  );
}
