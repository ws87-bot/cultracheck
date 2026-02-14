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

/**
 * 简单中文分词：按标点、空格拆分为关键词列表（用于匹配）
 */
function tokenize(text: string): string[] {
  if (!text || typeof text !== "string") return [];
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized
    .split(/[\s，。！？、；：""''（）【】\-—,.;:!?]+/)
    .filter((s) => s.length > 0);
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
