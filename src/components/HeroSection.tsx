export default function HeroSection() {
  return (
    <section className="hero-with-pattern relative px-4 py-12 sm:py-16">
      <div
        className="absolute left-0 right-0 top-0 h-0.5"
        style={{ background: "linear-gradient(90deg, transparent, #C5A55A, transparent)" }}
      />
      <div className="mx-auto max-w-4xl">
        <div className="text-center">
          <p className="mb-6 text-xs tracking-[6px]" style={{ color: "#C5A55A" }}>
            ✦ 悦出海跨文化工作室 ✦
          </p>
          <h1
            className="mb-4 font-bold leading-tight"
            style={{ fontSize: "42px", letterSpacing: "6px" }}
          >
            <span style={{ color: "#ffffff" }}>文化合规</span>
            <br />
            <span style={{ color: "#C5A55A" }}>出海无忧</span>
          </h1>
          <p
            className="mb-8"
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: "14px",
              letterSpacing: "2px",
              fontWeight: 300,
            }}
          >
            智能扫描你的文案、邮件、方案书中的中东文化雷区
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <span className="rounded-full border border-[#C5A55A]/40 bg-white/15 px-4 py-1.5 text-xs text-white">
            📚 2400+条文化规则
          </span>
          <span className="rounded-full border border-[#C5A55A]/40 bg-white/15 px-4 py-1.5 text-xs text-white">
            🌍 覆盖海湾七国
          </span>
          <span className="rounded-full border border-[#C5A55A]/40 bg-white/15 px-4 py-1.5 text-xs text-white">
            🐪 丝路商务实战经验
          </span>
        </div>
      </div>
    </section>
  );
}
