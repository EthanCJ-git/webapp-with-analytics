import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "black",
          color: "white",
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        {initials(site.name)}
      </div>
    ),
    { ...size }
  );
}
