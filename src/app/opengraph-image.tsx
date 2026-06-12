import { ImageResponse } from "next/og";

// Static social card (1200×630). Code-generated so there's no binary asset to
// maintain — Next auto-wires this as the default og:image / twitter:image.
export const alt = "Melvin Joshy — Product Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(237,231,216,0.6)",
          }}
        >
          <span>India</span>
          <span style={{ color: "rgba(237,231,216,0.28)" }}>{"//"}</span>
          <span>Product Designer</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 104,
              lineHeight: 1,
              color: "#ede7d8",
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            Melvin Joshy
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 34,
              lineHeight: 1.3,
              color: "rgba(237,231,216,0.7)",
              maxWidth: 880,
              display: "flex",
            }}
          >
            Product designer who builds. 5+ shipped AI-native products, solo.
            Zero to one, repeatedly.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(237,231,216,0.45)",
          }}
        >
          <span>Currently at Tempo · YC S23</span>
          <span style={{ color: "#EF2626" }}>melvinjoshy.com</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
