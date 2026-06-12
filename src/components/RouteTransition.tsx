"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { BRAND } from "@/lib/brand";

/* Deep matte oxblood — matches the intro reveal wash */
const RED = BRAND.oxblood;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const; // hole moving on screen
const EASE_OUT = [0.22, 1, 0.36, 1] as const;     // page entering on reveal

type TransitionFn = (href: string) => void;
const Ctx = createContext<TransitionFn>(() => {});
export const useRouteTransition = () => useContext(Ctx);

type Phase = "cover" | "reveal" | null;

export default function RouteTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>(null);
  const pendingRef = useRef<string | null>(null);
  const capRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reveal = useCallback(() => {
    if (capRef.current) { clearTimeout(capRef.current); capRef.current = null; }
    pendingRef.current = null;
    setPhase("reveal");
  }, []);

  const transitionTo = useCallback(
    (href: string) => {
      if (pendingRef.current || phase) return; // already mid-transition
      if (reduced) { router.push(href); return; }
      router.prefetch(href);   // warm the route so the push commits fast
      pendingRef.current = href;
      setPhase("cover");       // red iris closes in
    },
    [phase, reduced, router]
  );

  // Reveal as soon as the destination route mounts (pathname change).
  useEffect(() => {
    if (phase === "cover" && pendingRef.current === "__pushed__") reveal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => () => { if (capRef.current) clearTimeout(capRef.current); }, []);

  return (
    <Ctx.Provider value={transitionTo}>
      {children}
      {phase && (
        <div className="fixed inset-0 z-[600]" style={{ pointerEvents: "auto" }}>
          {/* Rectangular hole in a red field — iris scales from the centre */}
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <mask id="route-hole">
                <rect x="0" y="0" width="100" height="100" fill="white" />
                <motion.rect
                  x="0"
                  y="0"
                  width="100"
                  height="100"
                  fill="black"
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  initial={{ scale: phase === "cover" ? 1 : 0 }}
                  animate={{ scale: phase === "cover" ? 0 : 1 }}
                  transition={
                    phase === "cover"
                      ? { duration: 0.3, ease: EASE_IN_OUT }
                      : { duration: 0.4, ease: EASE_OUT }
                  }
                  onAnimationComplete={() => {
                    if (phase === "cover") {
                      // Red fully covers — swap routes underneath, then reveal as
                      // soon as the new route is live (cap keeps red from hanging).
                      const href = pendingRef.current;
                      pendingRef.current = "__pushed__";
                      if (href && href !== "__pushed__") router.push(href);
                      // The real reveal trigger is the pathname change (route mounted).
                      // This is only a safety net for a genuinely stuck nav — keep it long
                      // so a cold first-load route still commits before the iris opens,
                      // otherwise the reveal fires over the old page and "cuts" on mount.
                      capRef.current = setTimeout(reveal, 1800);
                    } else {
                      setPhase(null); // reveal done
                    }
                  }}
                />
              </mask>
            </defs>
            <rect x="0" y="0" width="100" height="100" fill={RED} mask="url(#route-hole)" />
          </svg>
        </div>
      )}
    </Ctx.Provider>
  );
}
