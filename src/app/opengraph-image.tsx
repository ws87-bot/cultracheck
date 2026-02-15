import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "丝路通 SilkPass - 中东文化合规扫描";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(160deg, #00331D 0%, #004D2C 40%, #006B3F 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Gold top line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "15%",
            right: "15%",
            height: 3,
            background:
              "linear-gradient(90deg, transparent, #C5A054, transparent)",
          }}
        />
        {/* Gold inner border */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            bottom: 12,
            border: "1px solid rgba(197,160,84,0.15)",
            borderRadius: 4,
          }}
        />

        <div style={{ fontSize: 48, marginBottom: 16 }}>🐪</div>
        <div
          style={{
            fontSize: 22,
            color: "#C5A054",
            letterSpacing: 8,
            marginBottom: 12,
            fontWeight: 700,
            display: "flex",
          }}
        >
          S I L K P A S S
        </div>
        <div
          style={{
            fontSize: 64,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: 8,
            marginBottom: 4,
            display: "flex",
          }}
        >
          文化合规
        </div>
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            color: "#D4B76A",
            letterSpacing: 6,
            marginBottom: 24,
            display: "flex",
          }}
        >
          出海无忧
        </div>
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: 2,
            marginBottom: 24,
            display: "flex",
          }}
        >
          AI 智能扫描中东文化雷区
        </div>
        {/* Gold divider */}
        <div
          style={{
            width: 60,
            height: 1,
            marginBottom: 20,
            background:
              "linear-gradient(90deg, transparent, #C5A054, transparent)",
          }}
        />
        <div
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.35)",
            letterSpacing: 2,
            display: "flex",
          }}
        >
          覆盖沙特 · 阿联酋 · 卡塔尔 · 科威特 · 阿曼 · 巴林 · 埃及
        </div>
        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            fontSize: 13,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: 1,
            display: "flex",
          }}
        >
          悦出海跨文化工作室出品 · silkpass.co
        </div>
      </div>
    ),
    { ...size }
  );
}
