import type { Metadata } from "next";
import { Bebas_Neue, Caveat, Pixelify_Sans, Spectral } from "next/font/google";
import "./globals.css";
import RouteTransition from "@/components/RouteTransition";

// Self-hosted via next/font — no render-blocking @import, no extra round-trips,
// no layout shift. Variables match the names used across globals.css/components.
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat", display: "swap" });
const pixelify = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixelify", display: "swap" });
const spectral = Spectral({
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const fontVars = `${bebas.variable} ${caveat.variable} ${pixelify.variable} ${spectral.variable}`;

export const metadata: Metadata = {
  title: "Melvin Joshy — Product Designer",
  description:
    "Founding-level product designer. 5 shipped AI-native products, solo. Zero to one, repeatedly.",
  openGraph: {
    title: "Melvin Joshy — Product Designer",
    description:
      "Founding-level product designer. 5 shipped AI-native products, solo.",
    url: "https://melvinjoshy.com",
    siteName: "Melvin Joshy",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={fontVars}>
      <body className="antialiased">
        <RouteTransition>{children}</RouteTransition>
      </body>
    </html>
  );
}
