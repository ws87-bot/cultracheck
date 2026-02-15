export default function HeroSection() {
  return (
    <section className="hero-with-pattern relative px-5 pt-12 pb-16 sm:px-4 sm:py-16">
      <div
        className="absolute left-[10%] right-[10%] top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, #C5A054, transparent)" }}
      />
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p
            className="mb-6 text-[11px]"
            style={{ color: "#C5A054", letterSpacing: 5 }}
          >
            ✦ 悦出海跨文化工作室 ✦
          </p>
          <h1
            className="mb-4 text-[28px] leading-tight text-white sm:text-[36px]"
            style={{
              fontFamily: "Noto Sans SC",
              fontWeight: 900,
              letterSpacing: 3,
            }}
          >
            文化合规
          </h1>
          <p
            className="mb-2 text-[30px] text-[#D4B76A] sm:text-[38px]"
            style={{
              fontFamily: "Playfair Display",
              fontWeight: 800,
            }}
          >
            出海无忧
          </p>
          <p
            className="mb-8 text-sm text-white/60 sm:text-[14px]"
            style={{ letterSpacing: "0.05em" }}
          >
            智能扫描你的文案、邮件、方案书中的中东文化雷区
          </p>
        </div>
        <p
          className="text-center"
          style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: 1 }}
        >
          覆盖沙特 · 阿联酋 · 卡塔尔 · 科威特 · 阿曼 · 巴林 · 埃及 ｜ 中英文内容均可扫描
        </p>
      </div>
      <div
        className="absolute bottom-0 left-0 right-0 h-[30px]"
        style={{
          background: "#FFFBF5",
          borderRadius: "50% 50% 0 0",
          marginBottom: -1,
        }}
      />
    </section>
  );
}
