"use client";

import Link from "next/link";

const GOLD = "#C5A054";

type NavProps = {
  active: "check" | "chat";
};

export default function Nav({ active }: NavProps) {
  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 sm:px-6"
      style={{
        background: "linear-gradient(135deg, #004D2C, #006B3F)",
        boxShadow: "0 2px 24px rgba(0,77,44,0.3)",
        borderBottom: "1px solid rgba(197,160,84,0.2)",
      }}
    >
      <Link href="/" className="flex min-h-[44px] min-w-[44px] items-baseline gap-2 transition-opacity hover:opacity-90 sm:min-h-0 sm:min-w-0">
        <span
          className="text-base text-white sm:text-[20px]"
          style={{ fontFamily: "Playfair Display", fontWeight: 700, letterSpacing: 2 }}
        >
          🐪 丝路通
        </span>
        <span className="hidden text-[11px] sm:inline" style={{ color: GOLD }}>SilkPass</span>
      </Link>
      <nav className="flex items-center gap-2 sm:gap-5">
        <Link
          href="/"
          className={`min-h-[44px] min-w-[44px] px-2 py-1.5 text-xs font-medium transition-opacity hover:opacity-90 sm:min-h-0 sm:min-w-0 sm:px-4 sm:py-1.5 sm:text-sm ${
            active === "check" ? "" : "text-white/80"
          }`}
          style={{
            color: active === "check" ? GOLD : undefined,
            borderBottom: active === "check" ? "2px solid #C5A054" : "2px solid transparent",
          }}
        >
          ✏️ 文案扫描
        </Link>
        <Link
          href="/chat"
          className={`min-h-[44px] min-w-[44px] px-2 py-1.5 text-xs font-medium transition-opacity hover:opacity-90 sm:min-h-0 sm:min-w-0 sm:px-4 sm:py-1.5 sm:text-sm ${
            active === "chat" ? "" : "text-white/80"
          }`}
          style={{
            color: active === "chat" ? GOLD : undefined,
            borderBottom: active === "chat" ? "2px solid #C5A054" : "2px solid transparent",
          }}
        >
          💬 文化顾问
        </Link>
      </nav>
    </header>
  );
}
