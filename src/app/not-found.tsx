import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#080808] text-white flex flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="text-[10px] tracking-[0.4em] uppercase text-white/25">
        404
      </p>
      <h1 className="font-bebas text-[clamp(48px,10vw,110px)] leading-none tracking-wider">
        Page not found
      </h1>
      <Link
        href="/"
        className="mt-4 text-[10px] tracking-[0.3em] uppercase text-white/35 transition-colors duration-300 hover:text-white"
      >
        Back home
      </Link>
    </main>
  );
}
