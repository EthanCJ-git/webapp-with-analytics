import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name} — ${site.role}`;
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
          justifyContent: "center",
          padding: 80,
          background: "white",
          color: "black",
        }}
      >
        <div style={{ fontSize: 28, textTransform: "uppercase", letterSpacing: 4, color: "#71717a" }}>
          {site.role}
        </div>
        <div style={{ fontSize: 64, fontWeight: 600, marginTop: 24 }}>{site.name}</div>
        <div style={{ fontSize: 28, marginTop: 32, color: "#3f3f46", maxWidth: 900 }}>
          {site.tagline}
        </div>
      </div>
    ),
    { ...size }
  );
}
