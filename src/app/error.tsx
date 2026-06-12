"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error in the console for debugging; no external reporting.
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-[10px] tracking-[0.4em] uppercase text-white/25">
        Something broke
      </p>
      <h1 className="font-bebas text-[clamp(48px,10vw,110px)] leading-none tracking-wider">
        That wasn&apos;t supposed to happen
      </h1>
      <div className="mt-4 flex items-center gap-6">
        <button
          onClick={reset}
          className="text-[10px] tracking-[0.3em] uppercase text-white/35 transition-colors duration-300 hover:text-white"
        >
          Try again
        </button>
        <Link
          href="/"
          className="text-[10px] tracking-[0.3em] uppercase text-white/35 transition-colors duration-300 hover:text-white"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
