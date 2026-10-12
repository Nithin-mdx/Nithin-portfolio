import { ImageResponse } from "next/og";
import { profile } from "@/data/portfolio";

export const alt = profile.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, background: "#EDEBE6", color: "#0E0E0E" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 3, textTransform: "uppercase" }}>
          <span>Portfolio</span>
          <span>{profile.locations}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 150, fontWeight: 900, lineHeight: 0.85, letterSpacing: -6 }}>
          <span>NITHIN</span>
          <span>NANDAKUMAR</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: "#C6FF3D", border: "2px solid #0E0E0E" }} />
          {profile.role}
        </div>
      </div>
    ),
    size
  );
}
