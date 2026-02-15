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
  result: CheckReport & { truncated?: boolean };
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

  const score = result.overallScore;
  const scaleLeft = Math.min(100, Math.max(0, score));

  return (
    <section className="border-b border-[#E8E3DA] bg-[#FAF3E8] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-[720px] space-y-8">
        {result.truncated && (
          <p
            className="text-[12px]"
            style={{
              color: "#C5A054",
              backgroundColor: "rgba(197,160,84,0.08)",
              borderRadius: 8,
              padding: "8px 14px",
            }}
          >
            📄 文件内容较长，已分析前 5000 字。如需完整分析，请分段提交。
          </p>
        )}
        {/* 评分卡 */}
        <div
          className="rounded-[18px] border p-6"
          style={{ backgroundColor: "#FFFBF5", borderColor: "#E8E3DA" }}
        >
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative flex h-32 w-32 flex-shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#E8E3DA" strokeWidth="7" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={getScoreColor(result.overallScore)}
                  strokeWidth="7"
                  strokeDasharray={`${(score / 100) * 314} 314`}
                  strokeLinecap="round"
                  className="transition-all duration-[1200ms] ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-[28px] font-extrabold text-[#1A1D21] sm:text-[36px]"
                  style={{ fontFamily: "Playfair Display" }}
                >
                  {score}
                </span>
                <span className="text-sm text-[#8B919A]">/100</span>
              </div>
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <span
                className="inline-block rounded-full px-3 py-1 text-sm font-medium text-white"
                style={{ backgroundColor: getScoreColor(result.overallScore) }}
              >
                {getScoreLabel(result.overallScore)}
              </span>
              <p className="mt-2 text-[#3D4450]">{result.summary}</p>
            </div>
          </div>
          <div className="mt-6">
            <div
              className="relative h-1.5 w-full rounded-full"
              style={{
                background: "linear-gradient(90deg, #C41E3A, #E6A817, #00A86B, #006B3F)",
              }}
            >
              <span
                className="absolute top-1/2 h-[11px] w-[11px] -translate-y-1/2 rounded-full border-2 border-white bg-[#1A1D21] shadow"
                style={{ left: `${scaleLeft}%`, marginLeft: -5.5 }}
              />
            </div>
            <div className="mt-1 flex justify-between text-xs text-[#8B919A]">
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
            <h3 className="flex items-center gap-2 text-lg font-semibold text-[#1A1D21]">
              发现的问题
              <span
                className="rounded-full px-2 py-0.5 text-sm text-white"
                style={{ backgroundColor: DANGER }}
              >
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
                    className="overflow-hidden rounded-xl border border-[#E8E3DA] bg-[#FFFBF5]"
                  >
                    <button
                      type="button"
                      onClick={() => setIssueOpen((prev) => ({ ...prev, [i]: !prev[i] }))}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left"
                    >
                      <span
                        className="h-full w-1 flex-shrink-0 rounded-full"
                        style={{ backgroundColor: barColor, minHeight: 20, width: 4 }}
                      />
                      <span>
                        {issue.severity === "critical"
                          ? "🔴"
                          : issue.severity === "warning"
                            ? "🟡"
                            : "🟢"}
                      </span>
                      <span className="rounded-full bg-[#E8E3DA] px-2 py-0.5 text-xs text-[#3D4450]">
                        {issue.severity}
                      </span>
                      <span className="rounded-full bg-[#E8E3DA] px-2 py-0.5 text-xs text-[#3D4450]">
                        {issue.category}
                      </span>
                      <span className="flex-1 font-medium text-[#1A1D21] text-[14px]">
                        {issue.issue}
                      </span>
                      <span className="text-[#8B919A]">{isOpen ? "收起" : "展开"}</span>
                    </button>
                    {isOpen && (
                      <div className="border-t border-[#E8E3DA] px-4 py-3 pl-8">
                        <blockquote
                          className="rounded border-l-4 px-3 py-2 text-sm text-[#1A1D21]"
                          style={{ backgroundColor: "#FEF2F2", borderColor: DANGER }}
                        >
                          「{issue.originalText}」
                        </blockquote>
                        <div
                          className="mt-2 rounded border-l-4 px-3 py-2 text-sm text-[#1A1D21]"
                          style={{ backgroundColor: "#F0FDF4", borderColor: SAFE }}
                        >
                          <span className="font-medium">修改建议：</span>
                          {issue.suggestion}
                        </div>
                        {issue.explanation && (
                          <p className="mt-2 text-sm text-[#3D4450]">💡 {issue.explanation}</p>
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
        <div className="overflow-hidden rounded-xl border border-[#E8E3DA] bg-[#FFFBF5]">
          <button
            type="button"
            onClick={() => setRevisedOpen((o) => !o)}
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#1A1D21]"
          >
            <span>📝 修改后版本</span>
            <span className="text-[#8B919A]">{revisedOpen ? "收起" : "展开"}</span>
          </button>
          {revisedOpen && (
            <div className="border-t border-[#E8E3DA] px-4 py-3">
              <div className="flex justify-end">
                <button
                  id="copy-revised-btn"
                  type="button"
                  onClick={copyRevised}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
                  style={{ backgroundColor: "#006B3F" }}
                >
                  复制全文
                </button>
              </div>
              <pre
                className="mt-2 whitespace-pre-wrap rounded-lg p-3 text-[14px] text-[#1A1D21]"
                style={{ backgroundColor: "#F0FDF4" }}
              >
                {result.revisedText}
              </pre>
            </div>
          )}
        </div>

        {/* 文化加分建议 */}
        {(result.cultureTips ?? "").trim() && (
          <div className="overflow-hidden rounded-xl border border-[#E8E3DA] bg-[#FFFBF5]">
            <button
              type="button"
              onClick={() => setTipsOpen((o) => !o)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-[#1A1D21]"
            >
              <span>🌟 文化加分建议</span>
              <span className="text-[#8B919A]">{tipsOpen ? "收起" : "展开"}</span>
            </button>
            {tipsOpen && (
              <div
                className="border-t border-[#E8E3DA] px-4 py-3"
                style={{ backgroundColor: "rgba(197,160,84,0.06)" }}
              >
                <div className="p-3 text-sm text-[#1A1D21]">
                  {result.cultureTips.split(/\n/).map((line, i, arr) => (
                    <span key={i}>
                      <span className="text-[#C5A054]">✦ </span>
                      {line}
                      {i < arr.length - 1 ? <br /> : null}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="border-t border-[#E8E3DA] pt-6">
          <button
            type="button"
            onClick={onContactClick}
            className="text-sm font-medium text-[#006B3F] hover:underline"
          >
            需要更深入的文化咨询？联系悦出海工作室 →
          </button>
        </div>
      </div>
    </section>
  );
}
