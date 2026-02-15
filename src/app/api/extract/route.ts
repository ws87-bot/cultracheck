import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import mammoth from "mammoth";
import JSZip from "jszip";
import Anthropic from "@anthropic-ai/sdk";
import { checkContent } from "@/lib/agent/culturacheck-agent";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_TEXT_LENGTH = 5000; // 发给 AI 前截取，超出部分不分析
const ALLOWED_FILE_EXT = [".txt", ".pdf", ".docx", ".pptx"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

function getExt(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

/** 从 PPTX 缓冲中提取所有 slide 内的 <a:t> 文本 */
async function extractTextFromPptx(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const slides: string[] = [];
  const slideNames = Object.keys(zip.files).filter(
    (n) => n.startsWith("ppt/slides/slide") && n.endsWith(".xml")
  );
  slideNames.sort();
  for (const name of slideNames) {
    const f = zip.files[name];
    if (f.dir) continue;
    const xml = await f.async("string");
    const matches = xml.matchAll(/<a:t>([^<]*)<\/a:t>/g);
    for (const m of matches) slides.push(m[1]);
  }
  return slides.join("\n");
}

/** 从图片用 Claude Vision 提取文字 */
async function extractTextFromImage(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  const base64 = buffer.toString("base64");
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  const mediaType =
    mimeType === "image/jpeg"
      ? "image/jpeg"
      : mimeType === "image/png"
        ? "image/png"
        : "image/webp";
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: mediaType as "image/jpeg" | "image/png" | "image/webp",
              data: base64,
            },
          },
          {
            type: "text" as const,
            text: "请提取这张图片中的所有文字内容，只返回纯文字，不要加任何解释或格式。",
          },
        ],
      },
    ],
  });
  const textBlock = message.content.find((b) => b.type === "text");
  const text =
    textBlock && "text" in textBlock ? (textBlock as { text: string }).text : "";
  return (text || "").trim();
}

/** 运行审核并返回与 /api/check 一致的 JSON；超过 5000 字只取前 5000 字并带 truncated: true */
async function runCheckAndReturn(text: string) {
  const truncated = text.length > MAX_TEXT_LENGTH;
  const textToCheck = truncated ? text.slice(0, MAX_TEXT_LENGTH) : text;
  const report = await checkContent(textToCheck);
  return NextResponse.json({ ...report, ...(truncated ? { truncated: true } : {}) });
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";

    // ---------- URL：JSON body ----------
    if (contentType.includes("application/json")) {
      const body = await request.json();
      const url = typeof body?.url === "string" ? body.url.trim() : "";
      if (!url) {
        return NextResponse.json(
          { error: "请提供有效的网页链接" },
          { status: 400 }
        );
      }
      let res: Response;
      try {
        res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; SilkPass/1.0)" },
        });
      } catch {
        return NextResponse.json(
          { error: "无法访问该网页" },
          { status: 400 }
        );
      }
      if (!res.ok) {
        return NextResponse.json(
          { error: "无法访问该网页" },
          { status: 400 }
        );
      }
      const html = await res.text();
      const $ = cheerio.load(html);
      $("script, style").remove();
      const text = $("body").text().replace(/\s+/g, " ").trim();
      if (!text) {
        return NextResponse.json(
          { error: "未能提取到有效文字内容" },
          { status: 400 }
        );
      }
      return runCheckAndReturn(text);
    }

    // ---------- FormData：file 或 image ----------
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const image = formData.get("image") as File | null;

    if (file != null) {
      // 文件上传
      if (file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: "文件大小不能超过10MB" },
          { status: 400 }
        );
      }
      const ext = getExt(file.name);
      if (!ALLOWED_FILE_EXT.includes(ext)) {
        return NextResponse.json(
          { error: "不支持该文件格式" },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      let text = "";
      if (ext === ".txt") {
        text = await file.text();
      } else if (ext === ".pdf") {
        const pdfParse = (await import("pdf-parse")).default;
        const data = await pdfParse(buffer);
        text = (data?.text || "").trim();
      } else if (ext === ".docx") {
        const result = await mammoth.extractRawText({ buffer });
        text = (result.value || "").trim();
      } else if (ext === ".pptx") {
        text = await extractTextFromPptx(buffer);
      }
      if (!text) {
        return NextResponse.json(
          { error: "未能提取到有效文字内容" },
          { status: 400 }
        );
      }
      return runCheckAndReturn(text);
    }

    if (image != null) {
      // 图片上传
      if (image.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: "图片大小不能超过10MB" },
          { status: 400 }
        );
      }
      const type = (image.type || "").toLowerCase();
      if (!ALLOWED_IMAGE_TYPES.some((t) => type.includes(t))) {
        return NextResponse.json(
          { error: "不支持该文件格式，请使用 .jpg .png .webp" },
          { status: 400 }
        );
      }
      const buffer = Buffer.from(await image.arrayBuffer());
      const text = await extractTextFromImage(buffer, type);
      if (!text) {
        return NextResponse.json(
          { error: "未能从图片中识别到文字" },
          { status: 400 }
        );
      }
      return runCheckAndReturn(text);
    }

    return NextResponse.json(
      { error: "请上传文件、图片或提供网页链接" },
      { status: 400 }
    );
  } catch (err) {
    console.error("[api/extract]", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "提取或审核失败",
      },
      { status: 500 }
    );
  }
}
