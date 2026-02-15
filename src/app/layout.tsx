import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = "https://silkpass.co";

export const metadata: Metadata = {
  title: "丝路通 SilkPass - 中东文化合规扫描",
  description:
    "AI 智能扫描你的文案、邮件、方案书中的中东文化雷区。覆盖沙特、阿联酋、卡塔尔等七国。",
  openGraph: {
    title: "丝路通 SilkPass - 中东文化合规扫描",
    description:
      "AI 智能扫描你的文案、邮件、方案书中的中东文化雷区。覆盖沙特、阿联酋、卡塔尔等七国。",
    url: SITE_URL,
    siteName: "丝路通 SilkPass",
    images: [{ url: `${SITE_URL}/og-image.png` }],
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "丝路通 SilkPass - 中东文化合规扫描",
    description:
      "AI 智能扫描你的文案、邮件、方案书中的中东文化雷区",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=Noto+Sans+SC:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased" style={{ background: "#FAF3E8" }}>
        {children}
      </body>
    </html>
  );
}
