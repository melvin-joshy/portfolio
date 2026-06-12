import type { Metadata } from "next";
import { Bebas_Neue, Caveat, Pixelify_Sans, Spectral } from "next/font/google";
import "./globals.css";
import RouteTransition from "@/components/RouteTransition";
import CustomCursor from "@/components/CustomCursor";

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
  // Resolves relative OG/icon/canonical URLs to absolute — without this,
  // social cards and the opengraph-image resolve against localhost in prod.
  metadataBase: new URL("https://melvinjoshy.com"),
  title: {
    default: "Melvin Joshy — Product Designer",
    template: "%s — Melvin Joshy",
  },
  description:
    "Founding-level product designer. 5+ shipped AI-native products, solo. Zero to one, repeatedly.",
  openGraph: {
    title: "Melvin Joshy — Product Designer",
    description:
      "Founding-level product designer. 5+ shipped AI-native products, solo.",
    url: "https://melvinjoshy.com",
    siteName: "Melvin Joshy",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Melvin Joshy — Product Designer",
    description:
      "Founding-level product designer. 5+ shipped AI-native products, solo.",
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
        <CustomCursor />
        <RouteTransition>{children}</RouteTransition>
      </body>
    </html>
  );
}
