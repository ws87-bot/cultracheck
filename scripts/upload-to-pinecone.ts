/**
 * 将 knowledge-base.json 用 Pinecone Inference API 生成向量并上传到 Pinecone 索引
 * 使用 Node.js 内置 https，从 .env.local 读取 PINECONE_API_KEY、PINECONE_INDEX
 */

import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import { config } from "dotenv";

config({ path: path.resolve(process.cwd(), ".env.local") });

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX = process.env.PINECONE_INDEX || "culturacheck";

const EMBED_BATCH = 96;
const UPSERT_BATCH = 100;
const MAX_RETRIES = 3;

type KnowledgeChunk = {
  id: string;
  content: string;
  country: string;
  category: string;
  severity: string;
  tags: string[];
  source: string;
  scenario: string;
};

function httpsRequest(
  url: string,
  options: { method: string; headers: Record<string, string> },
  body?: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: options.method,
        headers: options.headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf-8");
          if (res.statusCode && res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${raw}`));
            return;
          }
          resolve(raw);
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

async function getIndexHost(): Promise<string> {
  const url = `https://api.pinecone.io/indexes/${PINECONE_INDEX}`;
  const raw = await httpsRequest(url, {
    method: "GET",
    headers: {
      "Api-Key": PINECONE_API_KEY!,
      "Content-Type": "application/json",
    },
  });
  const data = JSON.parse(raw);
  const host = data.host;
  if (!host) throw new Error("index host not found in describe response");
  return host;
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const body = JSON.stringify({
    model: "multilingual-e5-large",
    inputs: texts.map((text) => ({ text })),
    parameters: { input_type: "passage", truncate: "END" },
  });
  const url = "https://api.pinecone.io/embed";
  const raw = await httpsRequest(url, {
    method: "POST",
    headers: {
      "Api-Key": PINECONE_API_KEY!,
      "Content-Type": "application/json",
    },
    body,
  });
  const data = JSON.parse(raw);
  const vectors = (data.data as { values: number[] }[]).map((d) => d.values);
  return vectors;
}

async function upsertBatch(host: string, vectors: { id: string; values: number[]; metadata: Record<string, string> }[]): Promise<void> {
  const body = JSON.stringify({ vectors });
  const url = `https://${host}/vectors/upsert`;
  await httpsRequest(url, {
    method: "POST",
    headers: {
      "Api-Key": PINECONE_API_KEY!,
      "Content-Type": "application/json",
    },
    body,
  });
}

async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  let lastErr: Error | null = null;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e instanceof Error ? e : new Error(String(e));
      if (i < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }
  throw lastErr;
}

async function main() {
  if (!PINECONE_API_KEY) {
    console.error("请在 .env.local 中配置 PINECONE_API_KEY");
    process.exit(1);
  }

  const jsonPath = path.join(process.cwd(), "knowledge-base.json");
  if (!fs.existsSync(jsonPath)) {
    console.error("未找到 knowledge-base.json，请先运行构建脚本生成。");
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, "utf-8");
  const chunks: KnowledgeChunk[] = JSON.parse(raw);
  const total = chunks.length;
  console.log(`共 ${total} 条，开始获取索引 host...`);

  const host = await getIndexHost();
  console.log(`索引 host: ${host}`);

  let uploaded = 0;
  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const batch = chunks.slice(i, i + EMBED_BATCH);
    const texts = batch.map((c) => c.content);
    const vectors = await withRetry(
      () => embedBatch(texts),
      `embed ${i}-${i + batch.length}`
    );

    for (let u = 0; u < vectors.length; u += UPSERT_BATCH) {
      const slice = batch.slice(u, u + UPSERT_BATCH);
      const vecSlice = vectors.slice(u, u + UPSERT_BATCH);
      const payload = slice.map((chunk, j) => ({
        id: chunk.id,
        values: vecSlice[j],
        metadata: {
          content: chunk.content,
          country: chunk.country,
          category: chunk.category,
          severity: chunk.severity,
          tags: Array.isArray(chunk.tags) ? chunk.tags.join(",") : "",
          source: chunk.source ?? "",
          scenario: chunk.scenario ?? "",
        },
      }));
      await withRetry(() => upsertBatch(host, payload), `upsert ${uploaded}-${uploaded + payload.length}`);
      uploaded += payload.length;
      console.log(`已上传 ${uploaded} / ${total}`);
    }
  }

  console.log(`完成，共上传 ${uploaded} 条。`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
