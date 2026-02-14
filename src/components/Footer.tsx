"use client";

export default function Footer() {
  return (
    <footer
      className="mt-auto border-t px-4 py-8 sm:px-6"
      style={{ borderColor: "rgba(255,255,255,0.15)", backgroundColor: "#0F2440" }}
    >
      <div className="mx-auto max-w-4xl space-y-4 text-center text-sm text-white/90">
        <p className="font-medium text-white">
          🐪 丝路通 SilkPass · 悦出海跨文化工作室出品
        </p>
        <div
          className="mx-auto h-0.5 w-[60px] rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, #C5A55A, transparent)" }}
        />
        <p className="text-white/80">
          由石悦华老师领衔 · 曾任加拿大安省政府高级政策顾问、港股上市公司北美MD · 北大汇丰商学院（深圳）国际部外聘导师 · 横跨中国、北美、中东三大市场 · 累计服务上百家出海企业
        </p>
      </div>
    </footer>
  );
}
