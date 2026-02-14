export type KnowledgeCountry =
  | "沙特阿拉伯"
  | "阿联酋"
  | "卡塔尔"
  | "科威特"
  | "阿曼"
  | "巴林"
  | "埃及"
  | "阿拉伯世界通用";

export type KnowledgeCategory =
  | "商务礼仪"
  | "宗教禁忌"
  | "饮食文化"
  | "穿着规范"
  | "沟通方式"
  | "节日习俗"
  | "商务谈判"
  | "社交礼仪"
  | "视觉设计"
  | "数字与颜色"
  | "女性商务"
  | "送礼文化";

export type KnowledgeSeverity = "critical" | "warning" | "info";

// 丝路通 中东商务文化知识点
export interface KnowledgeChunk {
  /** 唯一 ID，可以使用文件名+序号或 UUID */
  id: string;
  /** 中文内容（面向产品内部使用，不含第三方品牌标识） */
  content: string;
  /** 适用国家或“阿拉伯世界通用” */
  country: KnowledgeCountry;
  /** 知识点分类 */
  category: KnowledgeCategory;
  /** 风险级别：critical / warning / info */
  severity: KnowledgeSeverity;
  /** 便于检索的标签，如["斋月","宴请","饮食禁忌"] */
  tags: string[];
  /** 信息来源，统一为“石悦华-悦出海跨文化工作室” */
  source: "石悦华-悦出海跨文化工作室";
  /** 适用场景，如“营销文案审核”、“商务会议准备”等 */
  scenario: string;
}

export type KnowledgeBase = KnowledgeChunk[];

