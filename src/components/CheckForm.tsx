"use client";

import { COUNTRIES, CONTENT_TYPES } from "@/types/check";

interface CheckFormProps {
  text: string;
  onTextChange: (v: string) => void;
  targetCountry: string;
  onTargetCountryChange: (v: string) => void;
  contentType: string;
  onContentTypeChange: (v: string) => void;
  loading: boolean;
  error: string | null;
  loadingStep: number;
  formSectionRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CheckForm({
  text,
  onTextChange,
  targetCountry,
  onTargetCountryChange,
  contentType,
  onContentTypeChange,
  loading,
  error,
  loadingStep,
  formSectionRef,
  onSubmit,
}: CheckFormProps) {
  return (
    <section
      ref={formSectionRef}
      className="border-b border-[#E8E3DA] bg-[#FAF3E8] px-4 py-8 sm:px-6"
    >
      <div className="mx-auto max-w-[720px]">
        <form onSubmit={onSubmit} className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="粘贴你的内容到这里...\n\n示例：尊敬的Mohammed先生，我们诚挚邀请您参加本周五下午的产品发布会..."
            rows={6}
            className="w-full rounded-[14px] border border-[#E8E3DA] bg-white px-4 py-3 text-[14px] text-[#1A1D21] placeholder:text-[#8B919A] transition-shadow focus:border-[#006B3F] focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:shadow-[0_0_0_3px_rgba(0,107,63,0.08)]"
            disabled={loading}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <select
              value={targetCountry}
              onChange={(e) => onTargetCountryChange(e.target.value)}
              className="w-full rounded-xl border border-[#E8E3DA] bg-white px-4 py-2.5 text-sm text-[#1A1D21] focus:border-[#006B3F] focus:outline-none focus:ring-1 focus:ring-[#006B3F]"
              disabled={loading}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={contentType}
              onChange={(e) => onContentTypeChange(e.target.value)}
              className="w-full rounded-xl border border-[#E8E3DA] bg-white px-4 py-2.5 text-sm text-[#1A1D21] focus:border-[#006B3F] focus:outline-none focus:ring-1 focus:ring-[#006B3F]"
              disabled={loading}
            >
              {CONTENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          {error && (
            <p className="text-sm text-[#C41E3A]" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="min-h-[44px] w-full rounded-xl py-3.5 text-base font-medium text-white transition-all disabled:bg-[#D1CBC0] disabled:shadow-none"
            style={{
              background: loading ? undefined : "linear-gradient(135deg, #006B3F, #004D2C)",
              letterSpacing: 2,
              boxShadow: loading ? undefined : "0 4px 16px rgba(0,107,63,0.35)",
            }}
          >
            {loading ? "⏳ 正在分析中..." : "开始扫描 🔍"}
          </button>

          {loading && (
            <div className="mt-4">
              <div
                className="overflow-hidden rounded-full"
                style={{ height: 4, background: "#E8E3DA" }}
              >
                <div
                  className="progress-bar-fill h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #006B3F, #C5A054)",
                  }}
                />
              </div>
              <p className="mt-3 text-center text-sm text-[#3D4450]">
                {loadingStep === 0 && "🔍 正在扫描文本内容..."}
                {loadingStep === 1 && "📚 匹配文化知识库..."}
                {loadingStep === 2 && "🧠 AI正在生成审核报告..."}
                {loadingStep === 3 && "⏳ 即将完成..."}
              </p>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
