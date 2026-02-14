"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const GOLD = "#C5A55A";
const NAVY = "#1B3A5C";

const SCENARIO_CARDS = [
  {
    icon: "🕌",
    title: "斋月商务",
    desc: "斋月期间怎么安排商务活动？",
    question: "斋月期间如何安排商务活动？",
  },
  {
    icon: "🤝",
    title: "商务礼仪",
    desc: "沙特商务会议有哪些必知礼仪？",
    question: "沙特商务会议有哪些礼仪？",
  },
  {
    icon: "🎁",
    title: "送礼指南",
    desc: "给阿联酋客户送什么礼物？",
    question: "给阿联酋客户送什么礼物合适？",
  },
  {
    icon: "📱",
    title: "社媒营销",
    desc: "中东社媒有哪些文化雷区？",
    question: "中东社交媒体营销要注意什么？",
  },
] as const;

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    const userMessage: Message = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    const history: Message[] = [...messages, userMessage];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: history.slice(-20).map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "请求失败");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("无法读取响应流");

      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === "assistant")
            next[next.length - 1] = { ...last, content: full };
          return next;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "对话失败");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleScenarioCard(question: string) {
    sendMessage(question);
    inputRef.current?.focus();
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1B3A5C]">
      <Nav active="chat" />

      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl">
            {messages.length === 0 && (
              <div className="hero-with-pattern rounded-2xl px-6 py-12 text-center sm:px-10 sm:py-16">
                <p
                  className="text-xs tracking-widest text-[#C5A55A]"
                  style={{ letterSpacing: 4 }}
                >
                  ✦ 丝路通 SILKPASS ✦
                </p>
                <h2 className="mt-4 text-2xl font-bold text-white">
                  你的中东商务文化顾问
                </h2>
                <p className="mt-2 text-white/90">
                  出差前 · 签约前 · 发布前，有问题直接问我
                </p>
                <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {SCENARIO_CARDS.map((card) => (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => handleScenarioCard(card.question)}
                      className="flex items-start gap-3 rounded-2xl border-2 border-transparent bg-white p-4 text-left shadow-sm transition-all hover:border-[#C5A55A] hover:shadow-md hover:-translate-y-0.5"
                    >
                      <span className="text-2xl">{card.icon}</span>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-gray-900">{card.title}</span>
                        <p className="mt-0.5 text-sm text-[#6B7280]">{card.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "user" ? (
                  <div
                    className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-white"
                    style={{
                      background: "linear-gradient(135deg, #1B3A5C, #162F4A)",
                    }}
                  >
                    <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                  </div>
                ) : (
                  <div className="flex max-w-[85%] gap-2 sm:gap-3">
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium text-white sm:h-9 sm:w-9"
                      style={{ backgroundColor: GOLD }}
                    >
                      🐪
                    </div>
                    <div className="rounded-2xl rounded-bl-md border border-[#E5E7EB] bg-white px-4 py-2.5 shadow-sm">
                      <p
                        className="mb-1 text-[11px] font-medium"
                        style={{ color: GOLD }}
                      >
                        🐪 丝路通顾问
                      </p>
                      <div className="prose prose-sm max-w-none text-gray-800 prose-p:my-1 prose-ul:my-2 prose-li:my-0">
                        <ReactMarkdown>{m.content || "..."}</ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading &&
              messages[messages.length - 1]?.role === "assistant" &&
              messages[messages.length - 1]?.content === "" && (
                <div className="mb-4 flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-[#E5E7EB] bg-white px-4 py-2.5">
                    <span className="text-[#6B7280]">正在回复...</span>
                  </div>
                </div>
              )}

            <div ref={bottomRef} />
          </div>
        </div>

        {error && (
          <div className="px-4 py-2 text-center text-sm text-[#DC2626]" role="alert">
            {error}
          </div>
        )}

        <div className="border-t border-[#E5E7EB] bg-white px-4 py-4">
          <div className="mx-auto max-w-3xl">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="问我任何中东商务文化问题..."
                rows={2}
                disabled={loading}
                className="min-w-0 flex-1 rounded-xl border border-[#E5E7EB] px-4 py-3 text-sm placeholder:text-[#6B7280] focus:border-[#C5A55A] focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30 disabled:bg-gray-50"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex-shrink-0 self-end rounded-xl px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: GOLD,
                  boxShadow: "0 2px 8px rgba(197,165,90,0.3)",
                }}
              >
                发送
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
