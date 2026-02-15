/**
 * 丝路通 主 Agent：文案审核、对话、文档审核
 * 依赖：@anthropic-ai/sdk、jsonrepair、同目录 prompts / knowledge-search、dotenv
 */

import path from "path";
import { config } from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import { jsonrepair } from "jsonrepair";
import { SYSTEM_PROMPT, CHECK_PROMPT, CHAT_PROMPT } from "./prompts";
import { searchKnowledge } from "./knowledge-search";

// 从项目根目录 .env.local 读取 ANTHROPIC_API_KEY（Next 自带加载，此处保证单独运行脚本时也能读到）
config({ path: path.resolve(process.cwd(), ".env.local") });

const MODEL = "claude-sonnet-4-5-20250929";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** 审核报告中的单条问题 */
export interface CheckIssue {
  originalText: string;
  issue: string;
  severity: "critical" | "warning" | "info";
  country: string;
  category: string;
  suggestion: string;
  explanation: string;
}

/** checkContent 返回的审核报告结构 */
export interface CheckReport {
  overallScore: number;
  riskLevel: "safe" | "caution" | "danger";
  summary: string;
  issues: CheckIssue[];
  revisedText: string;
  cultureTips: string;
}

/**
 * 从 Claude 返回的文本中解析 JSON 报告（用 jsonrepair 容错）
 */
function parseCheckResponse(raw: string): CheckReport {
  const cleaned = raw
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  const jsonStr = match ? match[0] : cleaned;
  const repaired = jsonrepair(jsonStr);
  return JSON.parse(repaired) as CheckReport;
}

/** 未指定目标市场时：要求 AI 先分析文案中的国家/城市/人名，再按对应规则审核，并在 summary 中说明判断的目标市场 */
const AUTO_MARKET_SYSTEM_APPEND = `

【重要】请先分析用户文案中是否提及了具体的中东国家、城市或人名。如果提到了（如迪拜、利雅得、多哈等），则按该国的文化规则进行审核。如果未提及具体国家，则按海湾六国中最严格的通用标准进行审核（宁可多提醒，不漏掉）。在审核结果的 summary 中说明你判断的目标市场是哪里。`;

/**
 * 1. 文案/内容审核：搜索知识库 → 发给 Claude → 返回结构化 JSON 审核报告
 * 不传 targetCountry/contentType 时，由 AI 根据文案自动识别目标市场并在 summary 中说明。
 */
export async function checkContent(
  text: string,
  targetCountry?: string,
  contentType?: string
): Promise<CheckReport> {
  const searchResults = searchKnowledge(text, {
    country: targetCountry,
    limit: 15,
  });

  const rulesSection =
    searchResults.length > 0
      ? `\n\n【以下为与本次内容相关的文化规则，审核时请参考】\n${searchResults
          .map(
            (r) =>
              `- [${r.chunk.country}] ${r.chunk.category}（${r.chunk.severity}）：${r.chunk.content}`
          )
          .join("\n")}`
      : "";

  const userPrompt = targetCountry || contentType
    ? `待审核内容${targetCountry ? `（目标市场：${targetCountry}）` : ""}${contentType ? `（类型：${contentType}）` : ""}：\n\n${text}${rulesSection}`
    : `待审核内容：\n\n${text}${rulesSection}`;

  const systemAppend = !targetCountry ? AUTO_MARKET_SYSTEM_APPEND : "";
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    temperature: 0,
    system: `${SYSTEM_PROMPT}\n\n${CHECK_PROMPT}${systemAppend}`,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textContent = message.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("\n");

  return parseCheckResponse(textContent);
}

/**
 * 2. 对话模式：结合知识库，以流式响应返回自然语言回复
 */
export async function chat(
  message: string,
  history: { role: string; content: string }[]
): Promise<ReadableStream<Uint8Array>> {
  const searchResults = searchKnowledge(message, { limit: 10 });
  const rulesSection =
    searchResults.length > 0
      ? `\n\n【参考知识库】\n${searchResults.map((r) => `- ${r.chunk.content}`).join("\n")}`
      : "";

  const systemContent = `${SYSTEM_PROMPT}\n\n${CHAT_PROMPT}${rulesSection}`;

  const apiMessages: { role: "user" | "assistant"; content: string }[] = history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  apiMessages.push({ role: "user", content: message });

  const stream = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    stream: true,
    system: systemContent,
    messages: apiMessages,
  });

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta &&
            (event.delta as { type?: string; text?: string }).type === "text_delta"
          ) {
            const text = (event.delta as { text?: string }).text;
            if (text) controller.enqueue(new TextEncoder().encode(text));
          }
        }
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * 3. 文档审核：对文档内容调用 checkContent（fileType 可传入 prompt 作类型说明）
 */
export async function reviewDocument(
  fileContent: string,
  fileType: string
): Promise<CheckReport> {
  return checkContent(fileContent, undefined, fileType);
}
