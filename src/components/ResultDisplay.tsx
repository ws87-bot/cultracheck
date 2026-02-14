"use client";

import { useState } from "react";
import type { CheckReport } from "@/types/check";
import {
  DANGER,
  WARNING,
  SAFE,
  EXCELLENT,
  getScoreColor,
  getScoreLabel,
} from "@/types/check";

export default function ResultDisplay({
  result,
  onContactClick,
}: {
  result: CheckReport;
  onContactClick: () => void;
}) {
  const [revisedOpen, setRevisedOpen] = useState(false);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    result.issues?.forEach((_, i) => {
      initial[i] = result.issues[i].severity === "critical";
    });
    return initial;
  });

  function copyRevised() {
    if (!result?.revisedText) return;
    navigator.clipboard.writeText(result.revisedText);
    const btn = document.getElementById("copy-revised-btn");
    if (btn) {
      btn.textContent = "已复制 ✓";
      setTimeout(() => {
        btn.textContent = "复制全文";
      }, 2000);
    }
  }

  return (
    <section className="border-b border-[#E5E7EB] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[720px] space-y-8">
        {/* 评分卡 */}
        <div className="rounded-[18px] bg-white p-6 shadow-lg">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative flex h-32 w-32 flex-shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={getScoreColor(result.overallScore)}
                  strokeWidth="8"
                  strokeDasharray={`${(result.overallScore / 100) * 339.3} 339.3`}
                  strokeLinecap="round"
                  className="transition-all duration-[1200ms] ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[36px] font-bold text-gray-900">{result.overallScore}</span>
                <span className="text-sm text-gray-500">/100</span>
              </div>
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <span
                className="inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
                style={{ backgroundColor: getScoreColor(result.overallScore) }}
              >
                {getScoreLabel(result.overallScore)}
              </span>
              <p className="mt-2 text-[#6B7280]">{result.summary}</p>
            </div>
          </div>
          <div className="mt-6 space-y-1">
            <div
              className="h-1.5 w-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${DANGER} 0%, ${DANGER} 40%, ${WARNING} 40%, ${WARNING} 70%, ${SAFE} 70%, ${SAFE} 90%, ${EXCELLENT} 90%, ${EXCELLENT} 100%)`,
              }}
            />
            <div className="flex justify-between text-xs text-[#6B7280]">
              <span>0-40 ⛔ 严重风险</span>
              <span>41-70 ⚠️ 需修改</span>
              <span>71-90 ✅ 基本安全</span>
              <span>91+ 🌟 文化友好</span>
            </div>
          </div>
        </div>

        {/* 问题列表 */}
        {result.issues && result.issues.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              发现的问题
              <span className="rounded-full bg-[#DC2626] px-2 py-0.5 text-sm text-white">
                {result.issues.length}项
              </span>
            </h3>
            <ul className="mt-4 space-y-3">
              {result.issues.map((issue, i) => {
                const isOpen =
                  issueOpen[i] === true ||
                  (issueOpen[i] === undefined && issue.severity === "critical");
                const barColor =
                  issue.severity === "critical"
                    ? DANGER
                    : issue.severity === "warning"
                      ? WARNING
                      : SAFE;
                return (
                  <li
                    key={i}
                    className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => setIssueOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <span
                        className="h-full w-1 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: barColor, minHeight: 20 }}
                      />
                      <span>
                        {issue.severity === "critical"
                          ? "🔴"
                          : issue.severity === "warning"
                            ? "🟡"
                            : "🟢"}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {issue.severity}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {issue.category}
                      </span>
                      <span className="flex-1 font-medium text-gray-900 text-[14px]">
                        {issue.issue}
                      </span>
                      <span className="text-[#6B7280]">{isOpen ? "收起" : "展开"}</span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-[#E5E7EB] px-4 py-3 pl-8">
                        <blockquote className="rounded border-l-4 border-[#DC2626]/50 bg-red-50/80 px-3 py-2 text-sm text-gray-700">
                          「{issue.originalText}」
                        </blockquote>
                        <div className="mt-2 rounded border-l-4 border-[#16A34A]/50 bg-green-50/80 px-3 py-2 text-sm text-gray-800">
                          <span className="font-medium">修改建议：</span>
                          {issue.suggestion}
                        </div>
                        {issue.explanation && (
                          <p className="mt-2 text-sm text-[#6B7280]">💡 {issue.explanation}</p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* 修改后版本 */}
        <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
          <button
            type="button"
            onClick={() => setRevisedOpen((o) => !o)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-900"
          >
            <span>📝 修改后版本</span>
            <span className="text-[#6B7280]">{revisedOpen ? "收起" : "展开"}</span>
          </button>
          {revisedOpen && (
            <div className="border-t border-[#E5E7EB] px-4 py-3">
              <div className="flex justify-end">
                <button
                  id="copy-revised-btn"
                  type="button"
                  onClick={copyRevised}
                  className="rounded-lg bg-[#C5A55A] px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                >
                  复制全文
                </button>
              </div>
              <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-green-50/80 p-3 text-[14px] text-gray-700">
                {result.revisedText}
              </pre>
            </div>
          )}
        </div>

        {/* 文化加分建议 */}
        {(result.cultureTips ?? "").trim() && (
          <div className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
            <button
              type="button"
              onClick={() => setTipsOpen((o) => !o)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-900"
            >
              <span>🌟 文化加分建议</span>
              <span className="text-[#6B7280]">{tipsOpen ? "收起" : "展开"}</span>
            </button>
            {tipsOpen && (
              <div className="border-t border-[#E5E7EB] px-4 py-3">
                <p className="whitespace-pre-wrap rounded-lg bg-amber-50/80 p-3 text-sm text-gray-700">
                  {result.cultureTips}
                </p>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="border-t border-[#E5E7EB] pt-6">
          <button
            type="button"
            onClick={onContactClick}
            className="text-sm font-medium text-[#1B3A5C] hover:underline"
          >
            需要更深入的文化咨询？联系悦出海工作室 →
          </button>
        </div>
      </div>
    </section>
  );
}
