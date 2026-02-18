git add -A && git commit -m "feat: AI关键词提取优化知识库检索精度" && git pushconst fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const JSZip = require("jszip");
const dotenv = require("dotenv");
const Anthropic = require("@anthropic-ai/sdk");
const { jsonrepair } = require("jsonrepair");

type KnowledgeChunk = import("../types/knowledge").KnowledgeChunk;

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const KNOWLEDGE_BASE_DIR = path.resolve(process.cwd(), "knowledge-base");
const OUTPUT_PATH = path.resolve(process.cwd(), "knowledge-base.json");
const MODEL = "claude-sonnet-4-5-20250929";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

if (!process.env.ANTHROPIC_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn("ANTHROPIC_API_KEY 未在 .env.local 中配置，将无法调用 Claude API。");
}

type FileChunk = {
  id: string;
  filePath: string;
  fileName: string;
  index: number;
  text: string;
};

async function extractTextFromPdf(filePath: string): Promise<string> {
  const fs = require("fs");
  const buffer = fs.readFileSync(filePath);
  const pdfParse = require("pdf-parse");
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractTextFromDocx(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value || "";
}

async function extractTextFromPptx(filePath: string): Promise<string> {
  const data = await fs.promises.readFile(filePath);
  const zip = await JSZip.loadAsync(data);
  const slideFileNames = Object.keys(zip.files).filter((name) =>
    name.match(/^ppt\/slides\/slide\d+\.xml$/),
  );

  const slideTexts: string[] = [];

  for (const name of slideFileNames.sort()) {
    const file = zip.file(name);
    if (!file) continue;
    const xml = await file.async("string");
    // 粗略去除 XML 标签，保留可读文本
    const text = xml
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) {
      slideTexts.push(text);
    }
  }

  return slideTexts.join("\n\n");
}

async function extractTextFromFile(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    return extractTextFromPdf(filePath);
  }
  if (ext === ".docx") {
    return extractTextFromDocx(filePath);
  }
  if (ext === ".pptx") {
    return extractTextFromPptx(filePath);
  }

  // 其他类型按 UTF-8 文本处理
  return fs.promises.readFile(filePath, "utf8");
}

function chunkText(text: string, maxLength = 4000): string[] {
  const chunks: string[] = [];
  let current = text.trim();

  while (current.length > maxLength) {
    let sliceEnd = maxLength;

    // 尽量在句号或换行处分段，减少语义断裂
    const boundary = current.lastIndexOf("。", maxLength);
    const newline = current.lastIndexOf("\n", maxLength);
    sliceEnd = Math.max(boundary, newline, Math.floor(maxLength * 0.8));

    chunks.push(current.slice(0, sliceEnd).trim());
    current = current.slice(sliceEnd).trim();
  }

  if (current.length > 0) {
    chunks.push(current);
  }

  return chunks;
}

async function readKnowledgeBaseFiles(): Promise<FileChunk[]> {
  if (!fs.existsSync(KNOWLEDGE_BASE_DIR)) {
    // eslint-disable-next-line no-console
    console.warn(`目录 ${KNOWLEDGE_BASE_DIR} 不存在，暂时没有可用的知识库原始文件。`);
    return [];
  }

  const entries = await fs.promises.readdir(KNOWLEDGE_BASE_DIR);
  const filePaths = entries
    .map((name: string) => path.join(KNOWLEDGE_BASE_DIR, name))
    .filter((p: string) => fs.statSync(p).isFile());

  const allChunks: FileChunk[] = [];

  for (const filePath of filePaths) {
    const fileName = path.basename(filePath);
    // eslint-disable-next-line no-console
    console.log(`读取并解析文件: ${fileName}`);

    const text = await extractTextFromFile(filePath);
    const textChunks = chunkText(text, 4000);

    textChunks.forEach((chunk, index) => {
      allChunks.push({
        id: `${fileName}#${index}`,
        filePath,
        fileName,
        index,
        text: chunk,
      });
    });
  }

  return allChunks;
}

function buildPrompt(chunk: FileChunk): string {
  return `
你是“丝路通 中东商务文化合规审核”的知识库构建专家，品牌归属为“石悦华-悦出海跨文化工作室”。

现在给你一段来自知识库原始资料的文本（可能来自 PDF / DOCX / PPTX）：

【原始文本片段（文件：${chunk.fileName}，片段序号：${chunk.index}）】
${chunk.text}

请严格按照以下要求处理：

1. **提取知识点**
   - 从上述文本中提取所有与“中东地区商务文化、宗教禁忌、礼仪规范、营销沟通、合规风险”相关的知识点。
   - 每条知识点用**中文**表述，简明但足够具体，可以直接用于产品中的合规模板与风险提示。

2. **品牌与来源规范**
   - 完全删除和忽略所有第三方品牌、公司、咨询机构、培训机构的名称与标识（例如 Sirva 等）。
   - 只保留中立的、可泛用的商务文化知识。
   - 输出字段 \`source\` 统一写为："石悦华-悦出海跨文化工作室"。

3. **知识体系扩展（非常重要）**
   - 在忠实于原文精神的基础上，**主动扩展**和补充更多高质量知识点，可以不局限于当前片段，只要符合中东商务文化常识即可。
   - 特别需要补充和细化以下主题（可以跨国家给出“阿拉伯世界通用”的内容）：
     - 斋月商务注意事项（详细的时间安排、饮食、工作节奏变化）
     - 各国送礼禁忌和推荐
     - 数字、颜色、动物、手势的文化含义
     - 女性商务人员特别注意事项
     - 商务宴请和饮食禁忌细节
     - 社交媒体营销的文化雷区
     - 合同谈判中的文化差异
     - 阿拉伯人的时间观念和会议文化
     - 着装要求（男女分别、各国差异）
     - 宗教节日和公共假期对商务的影响

4. **字段要求（KnowledgeChunk 结构）**
   请输出为 JSON 数组，每个元素对应一个知识点，字段如下：
   - id: string，使用 \`${chunk.fileName}-${chunk.index}-\${序号}\` 这样的格式，保证在整个知识库中唯一即可。
   - content: string，用**中文**描述知识点本身，适合作为 丝路通 内部知识库记录，不要出现机密信息和第三方品牌。
   - country: string，必须是以下值之一：
     - "沙特阿拉伯" | "阿联酋" | "卡塔尔" | "科威特" | "阿曼" | "巴林" | "埃及" | "阿拉伯世界通用"
   - category: string，必须是以下值之一：
     - "商务礼仪" | "宗教禁忌" | "饮食文化" | "穿着规范" | "沟通方式" | "节日习俗" | "商务谈判" | "社交礼仪" | "视觉设计" | "数字与颜色" | "女性商务" | "送礼文化"
   - severity: "critical" | "warning" | "info"
     - critical：一旦触犯，极易导致严重冒犯、合作破裂或重大合规风险
     - warning：不致命但可能造成明显不适、留下不专业印象
     - info：属于加分项或背景知识，有助于更好地理解和适应当地文化
   - tags: string[]，自由标签，用于检索，例如 ["斋月","时间观念","沙特","商务会谈"]。
   - source: 必须严格写为："石悦华-悦出海跨文化工作室"。
   - scenario: string，说明主要适用场景，例如：
     - "营销文案审核"、"品牌视觉设计审核"、"商务会议准备"、"合同谈判准备"、"高管出访礼仪培训"、"社交媒体内容审核" 等。

5. **输出格式要求（非常重要）**
   - 只输出 **一个 JSON 数组**，不要包含任何解释性文字。
   - 不要添加 Markdown 代码块标记（例如「\`\`\`json」）。
   - 确保整个结果可以被直接 JSON.parse 正确解析。
6. **严格 JSON 规范（务必遵守）**
   - 不要输出任何注释、尾随逗号或多余的字段。
   - 字符串中的双引号必须使用反斜杠进行转义（例如 \\"），避免出现未转义的 "。
   - 如果某个字段内容中需要引用词语，请优先使用中文引号「」或全角引号“”来避免 JSON 解析错误。

重要：你的回复必须是纯粹的JSON数组，格式为 [{...}, {...}]。不要包含任何markdown代码块标记（不要用\`\`\`）。字符串值中的双引号必须用反斜杠转义为\\"。不要在JSON中使用换行符，content字段中如需换行请用\\n表示。
`;
}

function parseClaudeResponse(text: string): any[] {
  // 去掉 markdown 代码块
  let cleaned = text.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

  // 提取 [ ] 之间的内容
  const match = cleaned.match(/\[[\s\S]*\]/);
  if (match) {
    cleaned = match[0];
  }

  try {
    // 用 jsonrepair 自动修复JSON格式问题
    const repaired = jsonrepair(cleaned);
    const result = JSON.parse(repaired);
    return Array.isArray(result) ? result : [result];
  } catch (e) {
    console.log("JSON修复失败，跳过此片段。前200字：", cleaned.substring(0, 200));
    return [];
  }
}

async function callClaude(chunk: FileChunk): Promise<KnowledgeChunk[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("缺少 ANTHROPIC_API_KEY，无法调用 Claude。");
  }

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    temperature: 0.2,
    system:
      "你是“丝路通 中东商务文化合规审核”的跨文化顾问，负责为产品构建高质量、可执行的中东商务文化知识库。",
    messages: [
      {
        role: "user",
        content: buildPrompt(chunk),
      },
    ],
  });

  const textContent = message.content
    .filter((part) => part.type === "text")
    .map((part: any) => part.text)
    .join("\n");

  const parsed = parseClaudeResponse(textContent);
  return parsed as KnowledgeChunk[];
}

async function buildKnowledgeBase() {
  const fileChunks = await readKnowledgeBaseFiles();
  if (fileChunks.length === 0) {
    // eslint-disable-next-line no-console
    console.log("没有找到任何知识库原始文件，构建流程结束。");
    return;
  }

  const allKnowledge: KnowledgeChunk[] = [];

  for (const chunk of fileChunks) {
    // eslint-disable-next-line no-console
    console.log(
      `调用 Claude 处理：${chunk.fileName}（片段 ${chunk.index}），字数：${chunk.text.length}`,
    );

    try {
      const knowledge = await callClaude(chunk);
      allKnowledge.push(...knowledge);
      // 简单节流，避免过快打满 API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        `处理片段失败：${chunk.fileName}（片段 ${chunk.index}）`,
        (error as Error).message,
      );
    }
  }

  await fs.promises.writeFile(OUTPUT_PATH, JSON.stringify(allKnowledge, null, 2), "utf8");

  // eslint-disable-next-line no-console
  console.log(`知识库构建完成，共生成 ${allKnowledge.length} 条知识点，已写入：${OUTPUT_PATH}`);
}

// 允许直接通过 `ts-node scripts/build-knowledge-base.ts` 运行
if (require.main === module) {
  // eslint-disable-next-line no-console
  buildKnowledgeBase().catch((error) => {
    console.error("构建知识库时出错：", error);
    process.exit(1);
  });
}

