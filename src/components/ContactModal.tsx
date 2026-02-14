"use client";

import { useState, useEffect } from "react";

const FORMSPREE_URL = "https://formspree.io/f/xnjbdjew";

const initialFormData = {
  name: "",
  company: "",
  contact: "",
  type: "文化培训",
  message: "",
};

function resetFormData() {
  return { ...initialFormData };
}

export default function ContactModal({
  show,
  onClose,
}: {
  show: boolean;
  onClose: () => void;
}) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState(resetFormData());

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        setFormSubmitted(false);
        setFormData(resetFormData());
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          姓名: formData.name,
          公司: formData.company,
          联系方式: formData.contact,
          需求类型: formData.type,
          补充说明: formData.message,
          _subject: "丝路通SilkPass - 新咨询来了！",
        }),
      });
      setFormSubmitted(true);
    } catch {
      setFormSubmitted(true);
    }
  };

  const handleClose = () => {
    onClose();
    setFormSubmitted(false);
    setFormData(resetFormData());
  };

  if (!show) return null;

  return (
    <div
      className="contact-modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="contact-modal-card w-full max-w-[420px] overflow-hidden rounded-[20px] bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hero-with-pattern relative rounded-t-[20px] px-6 py-6">
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-4 top-4 text-2xl leading-none text-white/90 hover:text-white"
            aria-label="关闭"
          >
            ×
          </button>
          <h3 className="text-lg font-bold text-white" style={{ fontSize: 18 }}>
            获取更深入的中东文化咨询
          </h3>
          <p className="mt-1 text-xs text-white/80">工作日24小时内回复</p>
        </div>

        {formSubmitted ? (
          <div className="flex flex-col items-center px-6 py-10">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#16A34A]/20 text-3xl text-[#16A34A]">
              ✓
            </div>
            <p className="text-lg font-bold text-gray-900">已收到您的咨询</p>
            <p className="mt-1 text-sm text-gray-500">我们会尽快联系您</p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-6 rounded-xl px-6 py-2.5 text-sm font-medium text-white"
              style={{ background: "linear-gradient(135deg, #C5A55A, #A8893A)" }}
            >
              关闭
            </button>
          </div>
        ) : (
          <form className="px-6 py-6" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="您的姓名"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mb-3 w-full rounded-[10px] border border-[#E5E7EB] px-3 py-2.5 text-sm focus:border-[#C5A55A] focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30"
            />
            <input
              type="text"
              placeholder="公司名称"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="mb-3 w-full rounded-[10px] border border-[#E5E7EB] px-3 py-2.5 text-sm focus:border-[#C5A55A] focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30"
            />
            <input
              type="text"
              placeholder="手机号或邮箱"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="mb-3 w-full rounded-[10px] border border-[#E5E7EB] px-3 py-2.5 text-sm focus:border-[#C5A55A] focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30"
            />
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mb-3 w-full rounded-[10px] border border-[#E5E7EB] px-3 py-2.5 text-sm focus:border-[#C5A55A] focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30"
            >
              <option value="文化培训">文化培训</option>
              <option value="出海咨询">出海咨询</option>
              <option value="定制审核">定制审核</option>
              <option value="其他">其他</option>
            </select>
            <textarea
              placeholder="简单描述您的需求..."
              rows={3}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="mb-4 w-full rounded-[10px] border border-[#E5E7EB] px-3 py-2.5 text-sm focus:border-[#C5A55A] focus:outline-none focus:ring-2 focus:ring-[#C5A55A]/30"
            />
            <button
              type="submit"
              className="w-full rounded-xl py-3 text-sm font-medium text-white"
              style={{ background: "linear-gradient(135deg, #C5A55A, #A8893A)" }}
            >
              提交咨询
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
