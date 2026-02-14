"use client";

import { COUNTRIES, CONTENT_TYPES, GOLD } from "@/types/check";

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
      className="border-b border-[#E5E7EB] bg-gray-50/60 px-4 py-8 sm:px-6"
    >
      <div className="mx-auto max-w-[720px]">
        <form onSubmit={onSubmit} className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            placeholder="粘贴你的内容到这里...\n\n示例：尊敬的Mohammed先生，我们诚挚邀请您参加本周五下午的产品发布会..."
            rows={6}
            className="w-full rounded-[14px] border border-[#E5E7EB] bg-white px-4 py-3 text-[14px] placeholder:text-gray-400 focus:border-[#C5A55A] focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30"
            disabled={loading}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <select
              value={targetCountry}
              onChange={(e) => onTargetCountryChange(e.target.value)}
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm focus:border-[#C5A55A] focus:outline-none focus:ring-1 focus:ring-[#C5A55A]"
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
              className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm focus:border-[#C5A55A] focus:outline-none focus:ring-1 focus:ring-[#C5A55A]"
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
            <p className="text-sm text-[#DC2626]" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3.5 text-base font-medium text-white shadow-md transition-all disabled:opacity-60 disabled:shadow-none"
            style={{
              background: `linear-gradient(135deg, ${GOLD}, #A8893A)`,
              letterSpacing: 2,
              boxShadow: loading ? undefined : "0 4px 14px rgba(197,165,90,0.4)",
            }}
          >
            {loading ? "⏳ 正在分析中..." : "开始扫描 🔍"}
          </button>

          {loading && (
            <div className="mt-4">
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: "#E5E7EB",
                  overflow: "hidden",
                }}
              >
                <div
                  className="progress-bar-fill"
                  style={{
                    height: "100%",
                    borderRadius: 2,
                    background: "linear-gradient(90deg, #C5A55A, #A8893A)",
                  }}
                />
              </div>
              <p className="mt-3 text-center" style={{ color: "#C5A55A", fontSize: 12 }}>
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
