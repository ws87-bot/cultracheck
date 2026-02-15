/**
 * 知识库搜索：从 knowledge-base.json 中按关键词、国家、类别检索相关文化规则
 * 启动时加载到内存，搜索时按相关性打分并返回 top N
 */

import path from "path";
import fs from "fs";
import type { KnowledgeChunk } from "../../../types/knowledge";

/** 单条检索结果：知识点 + 相关性分数 */
export type KnowledgeSearchResult = {
  chunk: KnowledgeChunk;
  score: number;
};

/** severity 权重：critical 最重要，用于计算相关性分数 */
const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 3,
  warning: 2,
  info: 1,
};

/** 内存中的知识库，首次访问时从磁盘加载 */
let knowledgeBase: KnowledgeChunk[] | null = null;

/**
 * 获取知识库内容（懒加载，只读一次）
 */
function getKnowledgeBase(): KnowledgeChunk[] {
  if (knowledgeBase) return knowledgeBase;
  const jsonPath = path.join(process.cwd(), "knowledge-base.json");
  const raw = fs.readFileSync(jsonPath, "utf-8");
  knowledgeBase = JSON.parse(raw) as KnowledgeChunk[];
  return knowledgeBase;
}

/** 中文停用词：这些词不参与匹配，过滤掉可减少噪音 */
const STOPWORDS = new Set([
  "的", "了", "在", "是", "和", "与", "对", "等", "也", "都", "就", "会", "到", "从", "把", "被", "让", "给", "向", "为",
  "我们", "你们", "他们", "这个", "那个", "一个", "可以", "需要", "应该", "将在", "各种", "届时",
]);

/**
 * 中文分词：先按标点拆成片段，再对每个片段生成 2–4 字 n-gram，并过滤停用词
 */
function tokenize(text: string): string[] {
  if (!text || typeof text !== "string") return [];
  const normalized = text.replace(/\s+/g, " ").trim();
  const fragments = normalized
    .split(/[\s，。！？、；：""''（）【】\-—,.;:!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2);

  const seen = new Set<string>();
  for (const frag of fragments) {
    for (let len = 2; len <= 4 && len <= frag.length; len++) {
      for (let i = 0; i <= frag.length - len; i++) {
        const ngram = frag.slice(i, i + len);
        if (STOPWORDS.has(ngram)) continue;
        seen.add(ngram);
      }
    }
  }
  return Array.from(seen);
}

/**
 * 在知识库中搜索与 query 相关的知识点
 * @param query 用户输入或待审核内容摘要
 * @param options 可选：按国家、类别过滤，限制条数
 * @returns 按分数排序的 top 条结果
 */
export function searchKnowledge(
  query: string,
  options?: { country?: string; category?: string; limit?: number }
): KnowledgeSearchResult[] {
  const limit = options?.limit ?? 10;
  const country = options?.country;
  const category = options?.category;

  const chunks = getKnowledgeBase();
  const tokens = tokenize(query);
  if (tokens.length === 0) {
    return chunks
      .filter((c) => !country || c.country === country)
      .filter((c) => !category || c.category === category)
      .slice(0, limit)
      .map((c) => ({ chunk: c, score: SEVERITY_WEIGHT[c.severity] ?? 1 }));
  }

  const results: KnowledgeSearchResult[] = [];

  for (const chunk of chunks) {
    if (country && chunk.country !== country) continue;
    if (category && chunk.category !== category) continue;

    const searchableText = [
      chunk.content,
      chunk.category,
      (chunk.tags || []).join(" "),
    ].join(" ");
    const searchableLower = searchableText.toLowerCase();

    let hitCount = 0;
    for (const token of tokens) {
      if (token.length < 2) continue;
      if (searchableLower.includes(token) || searchableText.includes(token)) {
        hitCount += 1;
      }
    }

    if (hitCount === 0) continue;

    const weight = SEVERITY_WEIGHT[chunk.severity] ?? 1;
    const score = hitCount * weight;
    results.push({ chunk, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
