"use client";

export default function Footer() {
  return (
    <footer
      className="mt-auto px-4 py-8 sm:px-6"
      style={{
        background: "linear-gradient(160deg, #00331D, #004D2C)",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div className="mx-auto max-w-4xl space-y-4 text-center">
        <p
          className="text-[15px] font-semibold text-white"
          style={{ fontFamily: "Playfair Display" }}
        >
          🐪 丝路通 SilkPass
        </p>
        <div
          className="mx-auto h-0.5 w-[50px] rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, #C5A054, transparent)",
          }}
        />
        <p className="text-[11px] text-white/70">
          由石悦华老师领衔 · 曾任加拿大安省政府高级政策顾问、港股上市公司北美MD · 北大汇丰商学院（深圳）国际部外聘导师 · 横跨中国、北美、中东三大市场 · 累计服务上百家出海企业
        </p>
        <p className="text-[10px] text-white/50">悦出海跨文化工作室出品</p>
      </div>
    </footer>
  );
}
