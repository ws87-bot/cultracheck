"use client";

import { useRef } from "react";

export type InputMode = "text" | "file" | "url" | "image";

const TABS: { id: InputMode; icon: string; label: string; shortLabel: string }[] = [
  { id: "text", icon: "✏️", label: "粘贴文字", shortLabel: "文字" },
  { id: "file", icon: "📎", label: "上传文件", shortLabel: "文件" },
  { id: "url", icon: "🔗", label: "粘贴网址", shortLabel: "网址" },
  { id: "image", icon: "📷", label: "拍照/截图", shortLabel: "拍照" },
];

interface CheckFormProps {
  inputMode: InputMode;
  onInputModeChange: (m: InputMode) => void;
  text: string;
  onTextChange: (v: string) => void;
  url: string;
  onUrlChange: (v: string) => void;
  uploadedFile: File | null;
  onUploadedFileChange: (f: File | null) => void;
  uploadedImage: File | null;
  imagePreview: string | null;
  onUploadedImageChange: (f: File | null, preview: string | null) => void;
  loading: boolean;
  error: string | null;
  loadingStep: number;
  formSectionRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: (e: React.FormEvent) => void;
}

export default function CheckForm({
  inputMode,
  onInputModeChange,
  text,
  onTextChange,
  url,
  onUrlChange,
  uploadedFile,
  onUploadedFileChange,
  uploadedImage,
  imagePreview,
  onUploadedImageChange,
  loading,
  error,
  loadingStep,
  formSectionRef,
  onSubmit,
}: CheckFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f) return;
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    if ([".docx", ".pdf", ".pptx", ".txt"].includes(ext) && f.size <= 10 * 1024 * 1024) {
      onUploadedFileChange(f);
    }
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f || !f.type.startsWith("image/")) return;
    if (f.size > 10 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => onUploadedImageChange(f, reader.result as string);
    reader.readAsDataURL(f);
  };

  const step0Labels: Record<InputMode, string> = {
    text: "🔍 正在扫描文本内容...",
    file: "📄 正在解析文件...",
    url: "🔗 正在抓取网页内容...",
    image: "📷 正在识别图片文字...",
  };

  const canSubmit =
    inputMode === "text"
      ? text.trim().length > 0
      : inputMode === "file"
        ? !!uploadedFile
        : inputMode === "url"
          ? url.trim().length > 0
          : !!uploadedImage;

  return (
    <section
      ref={formSectionRef}
      className="border-b border-[#E8E3DA] bg-[#FAF3E8] px-4 py-8 sm:px-6"
    >
      <div className="mx-auto max-w-[720px]">
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Tab 栏 */}
          <div className="flex flex-wrap justify-center gap-1 border-b border-[#E8E3DA] sm:gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onInputModeChange(tab.id)}
                disabled={loading}
                className="min-h-[44px] px-3 py-2 text-[12px] font-medium transition-colors disabled:opacity-60 sm:min-h-0 sm:px-4 sm:text-[13px]"
                style={{
                  color: inputMode === tab.id ? "#006B3F" : "#8B919A",
                  borderBottom:
                    inputMode === tab.id ? "2px solid #006B3F" : "2px solid transparent",
                }}
              >
                <span className="sm:hidden">{tab.icon} {tab.shortLabel}</span>
                <span className="hidden sm:inline">{tab.icon} {tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: 粘贴文字 */}
          {inputMode === "text" && (
            <textarea
              value={text}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="粘贴你的文案到这里，AI 自动识别目标市场并扫描文化风险..."
              rows={6}
              className="w-full rounded-[14px] border border-[#E8E3DA] bg-white px-4 py-3 text-[14px] text-[#1A1D21] placeholder:text-[#8B919A] transition-shadow focus:border-[#006B3F] focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:shadow-[0_0_0_3px_rgba(0,107,63,0.08)]"
              disabled={loading}
            />
          )}

          {/* Tab 2: 上传文件 */}
          {inputMode === "file" && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".docx,.pdf,.pptx,.txt"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onUploadedFileChange(f);
                }}
              />
              {!uploadedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="flex h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-[#E8E3DA] bg-white/50 transition-colors hover:border-[#006B3F]/50 hover:bg-white"
                >
                  <span className="text-4xl">📄</span>
                  <p className="text-sm text-[#3D4450]">拖拽文件到这里，或点击选择</p>
                  <p className="text-xs text-[#8B919A]">支持 .docx .pdf .pptx .txt（最大 10MB）</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-[14px] border border-[#E8E3DA] bg-white px-4 py-3">
                    <span className="text-sm text-[#1A1D21]">
                      {uploadedFile.name}（{(uploadedFile.size / 1024).toFixed(1)} KB）
                    </span>
                    <button
                      type="button"
                      onClick={() => onUploadedFileChange(null)}
                      className="text-[#8B919A] hover:text-[#C41E3A]"
                      aria-label="删除"
                    >
                      ✕
                    </button>
                  </div>
                  {uploadedFile.size > 5 * 1024 * 1024 && (
                    <p className="text-xs" style={{ color: "#E6A817" }}>
                      ⏱ 文件较大，分析可能需要 30 秒左右
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: 粘贴网址 */}
          {inputMode === "url" && (
            <input
              type="url"
              value={url}
              onChange={(e) => onUrlChange(e.target.value)}
              placeholder="粘贴网页链接，如 https://example.com/article"
              className="w-full rounded-[14px] border border-[#E8E3DA] bg-white px-4 py-3 text-[14px] text-[#1A1D21] placeholder:text-[#8B919A] transition-shadow focus:border-[#006B3F] focus:outline-none focus:ring-2 focus:ring-[#006B3F]/20 focus:shadow-[0_0_0_3px_rgba(0,107,63,0.08)]"
              disabled={loading}
            />
          )}

          {/* Tab 4: 拍照/截图 */}
          {inputMode === "image" && (
            <div className="space-y-2">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const reader = new FileReader();
                    reader.onload = () => onUploadedImageChange(f, reader.result as string);
                    reader.readAsDataURL(f);
                  }
                }}
              />
              {!uploadedImage ? (
                <div
                  onClick={() => imageInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleImageDrop}
                  className="flex h-[200px] cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-[#E8E3DA] bg-white/50 transition-colors hover:border-[#006B3F]/50 hover:bg-white"
                >
                  <span className="text-4xl">📷</span>
                  <p className="text-sm text-[#3D4450]">拍照、截图或上传图片</p>
                  <p className="text-xs text-[#8B919A]">支持 .jpg .png .webp（最大 10MB）</p>
                </div>
              ) : (
                <div className="relative rounded-[14px] border border-[#E8E3DA] bg-white p-2">
                  <div className="flex max-h-[180px] justify-center">
                    <img
                      src={imagePreview || undefined}
                      alt="预览"
                      className="max-h-[180px] object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onUploadedImageChange(null, null)}
                    className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                    aria-label="删除"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-[#C41E3A]" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="min-h-[44px] w-full rounded-xl py-3.5 text-base font-medium text-white transition-all disabled:bg-[#D1CBC0] disabled:shadow-none"
            style={{
              background:
                loading || !canSubmit
                  ? "#D1CBC0"
                  : "linear-gradient(135deg, #006B3F, #004D2C)",
              letterSpacing: 2,
              boxShadow:
                loading || !canSubmit ? "none" : "0 4px 16px rgba(0,107,63,0.35)",
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
                {loadingStep === 0 && step0Labels[inputMode]}
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
