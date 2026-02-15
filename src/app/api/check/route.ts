import { checkContent } from "@/lib/agent/culturacheck-agent";
import { NextRequest, NextResponse } from "next/server";

/** 请求体类型 */
const MAX_TEXT_LENGTH = 10000;

/**
 * POST /api/check — 文案/内容合规审核（极简：仅 text，目标市场由 AI 自动识别）
 * 请求体：{ text: string }
 * 返回：审核报告 JSON
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body as { text?: string };

    if (text == null || typeof text !== "string") {
      return NextResponse.json(
        { error: "缺少 text 或格式错误" },
        { status: 400 }
      );
    }

    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return NextResponse.json(
        { error: "text 不能为空" },
        { status: 400 }
      );
    }

    if (trimmed.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `text 不能超过 ${MAX_TEXT_LENGTH} 字` },
        { status: 400 }
      );
    }

    const result = await checkContent(trimmed);

    return NextResponse.json(result);
  } catch (error) {
    console.error("[api/check]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "审核请求处理失败",
      },
      { status: 500 }
    );
  }
}
