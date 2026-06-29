"use client";

import { useState, useCallback, useEffect } from "react";
import Intro from "@/components/Intro";
import MainStage from "@/components/MainStage";

export default function Home() {
  // IMPORTANT: initial state must match the server-prerendered HTML (intro present),
  // otherwise reading sessionStorage here causes a hydration mismatch that, on refresh,
  // leaves the page stuck on the black prerendered shell. We read sessionStorage in an
  // effect instead and skip the intro after mount if it already played this session.
  const [introDone, setIntroDone] = useState(false);
  // `visible` drives the hero's ENTRANCE motion (side columns, stack fan-out).
  // The hero's background/centre render regardless, so the intro aperture reveals a
  // real hero; the entrance only fires once the intro finishes opening it.
  const [heroLive, setHeroLive] = useState(false);

  // Skip the intro on refreshes within the same tab session. Runs post-hydration, so
  // server and first client render agree — no mismatch, no blank screen.
  useEffect(() => {
    if (sessionStorage.getItem("intro_played") === "1") {
      setIntroDone(true);
      setHeroLive(true);
    }
  }, []);

  // Tell the Melvin AI launcher (mounted up in layout.tsx) whether the intro is
  // currently on screen, so it can stay hidden until the intro finishes.
  useEffect(() => {
    const active = !introDone;
    (window as Window & { __mjIntroActive?: boolean }).__mjIntroActive = active;
    window.dispatchEvent(new CustomEvent("mj:intro", { detail: { active } }));
  }, [introDone]);

  const handleRevealStart = useCallback(() => setHeroLive(true), []);
  const handleIntroDone = useCallback(() => {
    sessionStorage.setItem("intro_played", "1");
    setIntroDone(true);
    setHeroLive(true);
  }, []);

  return (
    <>
      <MainStage visible={heroLive} />
      {!introDone && (
        <Intro onRevealStart={handleRevealStart} onComplete={handleIntroDone} />
      )}
    </>
  );
}
