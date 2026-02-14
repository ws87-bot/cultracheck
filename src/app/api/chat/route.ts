import { chat } from "@/lib/agent/culturacheck-agent";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/chat — 对话（流式）
 * 请求体：{ message: string, history?: { role: string, content: string }[] }
 * 返回：流式文本响应
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body as {
      message?: string;
      history?: { role: string; content: string }[];
    };

    const msg = typeof message === "string" ? message.trim() : "";
    const historyList = Array.isArray(history) ? history : [];

    const stream = await chat(msg, historyList);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("[api/chat]", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "对话请求处理失败",
      },
      { status: 500 }
    );
  }
}
