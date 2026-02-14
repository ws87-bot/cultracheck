"use client";

import Link from "next/link";

type NavProps = {
  active: "check" | "chat";
};

export default function Nav({ active }: NavProps) {
  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 sm:px-6"
      style={{
        background: "linear-gradient(90deg, #1B3A5C, #162F4A)",
        borderBottom: "1px solid rgba(197,165,90,0.2)",
      }}
    >
      <Link href="/" className="flex items-baseline gap-2 transition-opacity hover:opacity-90">
        <span
          className="text-xl font-bold text-white"
          style={{ letterSpacing: 2 }}
        >
          🐪 丝路通
        </span>
        <span className="text-[11px] text-[#C5A55A]">SilkPass</span>
      </Link>
      <nav className="flex items-center gap-4 sm:gap-5">
        <Link
          href="/"
          className={`text-sm font-medium transition-opacity hover:opacity-90 ${
            active === "check" ? "text-[#C5A55A]" : "text-white/80"
          }`}
          style={active === "check" ? { borderBottom: "2px solid #C5A55A" } : undefined}
        >
          ✏️ 文案扫描
        </Link>
        <Link
          href="/chat"
          className="nav-chat-btn flex items-center gap-2 rounded-[20px] px-4 py-1.5 text-sm font-medium transition-colors"
          style={{
            background: active === "chat" ? "rgba(197,165,90,0.25)" : "rgba(197,165,90,0.15)",
            border: "1px solid rgba(197,165,90,0.3)",
            color: "#C5A55A",
          }}
        >
          <span
            className="nav-online-dot h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#16A34A]"
            title="在线"
          />
          💬 文化顾问
        </Link>
      </nav>
    </header>
  );
}
