import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "From B.Arch to product design: Melvin Joshy on building digital experiences with intention. Two years in, 5+ products shipped.",
  alternates: { canonical: "https://melvinjoshy.com/about" },
  openGraph: {
    title: "About · Melvin Joshy",
    description:
      "From B.Arch to product design: building digital experiences with intention.",
    url: "https://melvinjoshy.com/about",
    type: "profile",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`html, body { overflow: auto !important; }`}</style>
      {children}
    </>
  );
}
