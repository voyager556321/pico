import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#1f3f24", color: "#fff", borderRadius: 14, fontSize: 44, fontWeight: 800, fontFamily: "sans-serif" }}>
        P
      </div>
    ),
    size,
  );
}
