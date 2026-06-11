"use client";

import { useState, useCallback } from "react";
import Intro from "@/components/Intro";
import MainStage from "@/components/MainStage";
import CustomCursor from "@/components/CustomCursor";

export default function Home() {
  const played = () =>
    typeof window !== "undefined" && sessionStorage.getItem("intro_played") === "1";

  const [introDone, setIntroDone] = useState(played);
  // `visible` drives the hero's ENTRANCE motion (side columns, stack fan-out).
  // The hero's background/centre render regardless, so the intro aperture reveals a
  // real hero; the entrance only fires once the intro finishes opening it.
  const [heroLive, setHeroLive] = useState(played);

  const handleRevealStart = useCallback(() => setHeroLive(true), []);
  const handleIntroDone = useCallback(() => {
    sessionStorage.setItem("intro_played", "1");
    setIntroDone(true);
    setHeroLive(true);
  }, []);

  return (
    <>
      <CustomCursor />
      <MainStage visible={heroLive} />
      {!introDone && (
        <Intro onRevealStart={handleRevealStart} onComplete={handleIntroDone} />
      )}
    </>
  );
}
