import { ImageResponse } from "next/og";

export const alt =
  "Task.quo — Hire fast. Get it done. Skill-tested specialists for 1–2 tasks. Tasks from $40, pay only after review.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GREEN = "#1f3f24";
const ACCENT = "#3b7a33";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: GREEN,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            T
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, color: GREEN }}>Task.quo</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontSize: 96, fontWeight: 800, color: "#111", letterSpacing: -3, lineHeight: 1.05 }}>
            <span style={{ color: ACCENT }}>Hire</span>
            <span>&nbsp;fast. Get it done.</span>
          </div>
          <div style={{ fontSize: 36, color: "#4b5563", maxWidth: 980 }}>
            A skill-tested specialist for the 1–2 tasks holding up your project.
          </div>
        </div>
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              padding: "16px 28px",
              borderRadius: 999,
              background: "#eaf2e7",
              color: GREEN,
              fontSize: 30,
              fontWeight: 600,
            }}
          >
            Tasks from $40 · Pay only after review
          </div>
        </div>
      </div>
    ),
    size,
  );
}
