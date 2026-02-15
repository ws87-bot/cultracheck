"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import ContactModal from "@/components/ContactModal";

const GOLD = "#C5A054";
const TYPING_SPEED_MS = 35;
const TYPING_CHUNK = 2;

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

const CONTACT_TIPS = [
  "💡 想要更深入的定制化文化培训？联系悦出海工作室 →",
  "📞 需要一对一的中东商务咨询？预约石悦华老师 →",
  "🎓 即将开课：中东商务文化实战训练营，了解详情 →",
] as const;

type Message = { role: "user" | "assistant"; content: string };

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showContact, setShowContact] = useState(false);
  const [displayedChars, setDisplayedChars] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const lastAssistantContent =
    messages.filter((m) => m.role === "assistant").pop()?.content ?? "";
  const isLastAssistantStreaming =
    messages.length > 0 &&
    messages[messages.length - 1].role === "assistant" &&
    (loading || displayedChars < lastAssistantContent.length);

  useEffect(() => {
    if (messages.length === 0) return;
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [messages, displayedChars]);

  useEffect(() => {
    if (!isLastAssistantStreaming || displayedChars >= lastAssistantContent.length) return;
    const target = lastAssistantContent.length;
    const timer = setInterval(() => {
      setDisplayedChars((prev) => {
        const next = Math.min(prev + TYPING_CHUNK, target);
        return next;
      });
    }, TYPING_SPEED_MS);
    return () => clearInterval(timer);
  }, [lastAssistantContent.length, isLastAssistantStreaming, displayedChars]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError(null);
    setDisplayedChars(0);
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
          if (last?.role === "assistant") next[next.length - 1] = { ...last, content: full };
          return next;
        });
        setDisplayedChars(full.length);
      }
      setDisplayedChars(full.length);
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

  function getTipForAssistantIndex(assistantIndex: number): string {
    return CONTACT_TIPS[assistantIndex % CONTACT_TIPS.length];
  }

  let assistantCount = 0;

  const hasMessages = messages.length > 0;

  return (
    <div className="flex min-h-screen flex-col text-[#1A1D21]" style={{ backgroundColor: "#FAF3E8" }}>
      <Nav active="chat" />

      <main className="flex flex-1 flex-col">
        <div
          ref={scrollContainerRef}
          className="overflow-x-hidden px-4 py-6 sm:px-6"
          style={
            hasMessages
              ? { maxHeight: "calc(100vh - 200px)", overflowY: "auto" }
              : undefined
          }
        >
          <div className={`mx-auto max-w-3xl ${hasMessages ? "pb-4" : ""}`}>
            {messages.length === 0 && (
              <div className="hero-with-pattern rounded-2xl px-4 py-8 text-center sm:px-10 sm:py-16">
                <p
                  className="text-xs tracking-widest"
                  style={{ letterSpacing: 4, color: "#C5A054" }}
                >
                  ✦ 丝路通 SILKPASS ✦
                </p>
                <h2 className="mt-4 text-2xl font-bold text-white">
                  你的中东商务文化顾问
                </h2>
                <p className="mt-2 text-white/90">
                  出差前 · 签约前 · 发布前，有问题直接问我
                </p>
                <div className="mt-8 grid grid-cols-2 gap-2 sm:mt-10 sm:gap-4">
                  {SCENARIO_CARDS.map((card) => (
                    <button
                      key={card.title}
                      type="button"
                      onClick={() => handleScenarioCard(card.question)}
                      className="flex min-h-[44px] min-w-0 items-start gap-2 rounded-[14px] border-2 border-transparent bg-[#FFFBF5] p-3 text-left shadow-sm transition-all hover:border-[#C5A054] hover:shadow-md hover:-translate-y-0.5 sm:gap-3 sm:p-4"
                    >
                      <span className="flex-shrink-0 text-xl sm:text-2xl">{card.icon}</span>
                      <div className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-[#1A1D21] sm:text-base">{card.title}</span>
                        <p className="mt-0.5 text-xs text-[#3D4450] sm:text-sm">{card.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => {
              if (m.role === "assistant") assistantCount += 1;
              const isLastAssistant =
                m.role === "assistant" && i === messages.length - 1;
              const useTyping =
                isLastAssistant && (loading || displayedChars < m.content.length);
              const showContent = useTyping
                ? m.content.slice(0, displayedChars)
                : m.content;

              return (
                <div
                  key={i}
                  className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "user" ? (
                    <div
                      className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-white"
                      style={{
                        background: "linear-gradient(135deg, #006B3F, #004D2C)",
                      }}
                    >
                      <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                    </div>
                  ) : (
                    <div className="flex max-w-[85%] flex-col gap-2 sm:gap-3">
                      <div className="flex gap-2 sm:gap-3">
                        <div
                          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium text-white sm:h-9 sm:w-9"
                          style={{ backgroundColor: GOLD }}
                        >
                          🐪
                        </div>
                        <div className="rounded-2xl rounded-bl-md border px-4 py-2.5 shadow-sm" style={{ borderColor: "#E8E3DA", backgroundColor: "#FFFBF5" }}>
                          <p
                            className="mb-1 text-[10px] font-medium"
                            style={{ color: GOLD }}
                          >
                            🐪 丝路通顾问
                          </p>
                          <div
                            className="prose prose-sm max-w-none text-[#1A1D21] prose-p:my-1 prose-ul:my-2 prose-li:my-0 overflow-y-auto"
                            style={{ minHeight: 48, maxHeight: 280 }}
                          >
                            <ReactMarkdown>
                              {showContent || (loading ? "..." : "")}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </div>
                      {m.role === "assistant" &&
                        !loading &&
                        showContent.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowContact(true)}
                            className="self-start rounded-lg border px-3 py-1.5 text-left text-xs text-[#1A1D21] hover:opacity-90"
                            style={{ borderColor: "rgba(197,160,84,0.5)", backgroundColor: "#FFFBF5" }}
                          >
                            {getTipForAssistantIndex(assistantCount - 1)}
                          </button>
                        )}
                    </div>
                  )}
                </div>
              );
            })}

            {loading &&
              messages[messages.length - 1]?.role === "assistant" &&
              messages[messages.length - 1]?.content === "" && (
                <div className="mb-4 flex justify-start">
                  <div
                    className="rounded-2xl rounded-bl-md border px-4 py-2.5"
                    style={{ minHeight: 48, borderColor: "#E8E3DA", backgroundColor: "#FFFBF5" }}
                  >
                    <span className="text-[#8B919A]">丝路通顾问正在想...</span>
                  </div>
                </div>
              )}

            <div ref={bottomRef} />
          </div>
        </div>

        {error && (
          <div className="px-4 py-2 text-center text-sm text-[#C41E3A]" role="alert">
            {error}
          </div>
        )}

        <div
          className="border-t-2 px-3 py-3 sm:px-4"
          style={{
            borderColor: "#E8E3DA",
            backgroundColor: "#FAF3E8",
            boxShadow: "0 -2px 12px rgba(0,0,0,0.04)",
            paddingBottom: "max(16px, env(safe-area-inset-bottom))",
          }}
        >
          <button
            type="button"
            onClick={() => setShowContact(true)}
            className="mx-auto mb-2 flex min-h-[44px] w-full max-w-3xl items-center justify-center gap-2 rounded-lg border py-2 text-sm text-[#1A1D21] hover:opacity-90"
            style={{ borderColor: "rgba(197,160,84,0.4)", backgroundColor: "rgba(255,251,245,0.9)" }}
          >
            需要专家帮助？联系我们
          </button>
          <div className="mx-auto max-w-3xl">
            <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="问我任何中东商务文化问题…"
                rows={3}
                disabled={loading}
                className="min-h-[88px] min-w-0 flex-1 rounded-xl border-2 border-[#E8E3DA] bg-[#FFFBF5] px-4 py-3 text-base text-[#1A1D21] placeholder:text-[#8B919A] focus:border-[#006B3F] focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 disabled:bg-[#E8E3DA]/50"
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
                className="flex min-h-[44px] h-[88px] flex-shrink-0 items-center justify-center self-end rounded-xl px-4 py-3 text-base font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-70 sm:px-6"
                style={{
                  background: loading || !input.trim() ? "#D1CBC0" : "linear-gradient(135deg, #006B3F, #004D2C)",
                  boxShadow: loading || !input.trim() ? "none" : "0 4px 12px rgba(0,107,63,0.35)",
                }}
              >
                发送
              </button>
            </form>
          </div>
        </div>
      </main>

      <ContactModal show={showContact} onClose={() => setShowContact(false)} />
      <Footer />
    </div>
  );
}
