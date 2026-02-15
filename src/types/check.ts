export interface CheckReport {
  overallScore: number;
  riskLevel: "safe" | "caution" | "danger";
  summary: string;
  issues: Array<{
    originalText: string;
    issue: string;
    severity: "critical" | "warning" | "info";
    country: string;
    category: string;
    suggestion: string;
    explanation: string;
  }>;
  revisedText: string;
  cultureTips: string;
}

export const DANGER = "#C41E3A";
export const WARNING = "#E6A817";
export const SAFE = "#00A86B";
export const EXCELLENT = "#006B3F";
export const GOLD = "#C5A054";

export const COUNTRIES = [
  "阿拉伯世界通用",
  "沙特阿拉伯",
  "阿联酋",
  "卡塔尔",
  "科威特",
  "阿曼",
  "巴林",
  "埃及",
] as const;

export const CONTENT_TYPES = [
  "营销文案",
  "商务邮件",
  "方案书/标书",
  "活动方案",
  "品牌命名",
  "社媒内容",
  "视频脚本",
  "其他",
] as const;

export const SCENARIO_CARDS = [
  { icon: "📧", title: "商务沟通", desc: "邮件、报价单、合作意向书", contentType: "商务邮件" },
  { icon: "📝", title: "营销推广", desc: "社媒帖子、广告、产品描述", contentType: "营销文案" },
  { icon: "📋", title: "方案文档", desc: "标书、方案书、展会物料", contentType: "方案书/标书" },
] as const;

export function getScoreColor(score: number): string {
  if (score <= 40) return DANGER;
  if (score <= 70) return WARNING;
  if (score <= 90) return SAFE;
  return EXCELLENT;
}

export function getScoreLabel(score: number): string {
  if (score <= 40) return "严重风险";
  if (score <= 70) return "需修改";
  if (score <= 90) return "基本安全";
  return "文化友好";
}
