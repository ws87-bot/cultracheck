import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "丝路通 SilkPass - 中东商务文化合规扫描",
  description: "帮助中国出海企业在内容发出前发现文化雷区 · 悦出海跨文化工作室",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
