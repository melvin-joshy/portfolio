"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type LightboxItem = { src: string; type?: "video"; caption?: string };

type LightboxCtx = {
  open: (item: LightboxItem) => void;
};

const Ctx = createContext<LightboxCtx | null>(null);

const EASE = [0.22, 1, 0.36, 1] as const;

export function useLightbox() {
  return useContext(Ctx);
}

export function LightboxProvider({ children }: { children: React.ReactNode }) {
  const [item, setItem] = useState<LightboxItem | null>(null);

  const open = (next: LightboxItem) => setItem(next);
  const close = () => setItem(null);

  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [item]);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <AnimatePresence>
        {item && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            onClick={close}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center p-6 md:p-12"
            style={{ background: "rgba(6,6,8,0.92)", backdropFilter: "blur(10px)", cursor: "zoom-out" }}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-white/70 transition-colors duration-200 hover:bg-white/10 hover:text-white"
              style={{ border: "1px solid rgba(255,255,255,0.14)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.32, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-full max-w-full flex-col items-center"
              style={{ cursor: "default" }}
            >
              {item.type === "video" ? (
                <video
                  src={encodeURI(item.src)}
                  autoPlay
                  loop
                  controls
                  playsInline
                  className="block rounded-md"
                  style={{ maxHeight: "82vh", maxWidth: "90vw", objectFit: "contain" }}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={encodeURI(item.src)}
                  alt={item.caption ?? ""}
                  className="block rounded-md"
                  style={{ maxHeight: "82vh", maxWidth: "90vw", objectFit: "contain" }}
                />
              )}
              {item.caption && (
                <p
                  className="mt-4 text-center text-[12px] text-white/55"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {item.caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
