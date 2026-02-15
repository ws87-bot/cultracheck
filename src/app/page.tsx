"use client";

import { useState, useRef } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import CheckForm, { type InputMode } from "@/components/CheckForm";
import ResultDisplay from "@/components/ResultDisplay";
import ContactModal from "@/components/ContactModal";
import type { CheckReport } from "@/types/check";

export default function Home() {
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const inputSectionRef = useRef<HTMLDivElement>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleUploadedImageChange = (f: File | null, preview: string | null) => {
    setUploadedImage(f);
    setImagePreview(preview);
  };

  const handleCheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);
    setLoadingStep(0);
    const intervalMs = (inputMode === "file" || inputMode === "url") ? 5000 : 3000;
    stepTimerRef.current = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, intervalMs);

    try {
      if (inputMode === "text") {
        const trimmed = text.trim();
        if (!trimmed) {
          setError("请先输入需要扫描的内容");
          setLoading(false);
          if (stepTimerRef.current) {
            clearInterval(stepTimerRef.current);
            stepTimerRef.current = null;
          }
          return;
        }
        if (trimmed.length > 10000) {
          setError("内容不能超过 10000 字");
          setLoading(false);
          if (stepTimerRef.current) {
            clearInterval(stepTimerRef.current);
            stepTimerRef.current = null;
          }
          return;
        }
        const res = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "扫描失败");
        setResult(data as CheckReport);
      } else if (inputMode === "file" && uploadedFile) {
        const form = new FormData();
        form.append("file", uploadedFile);
        const res = await fetch("/api/extract", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "扫描失败");
        setResult(data as CheckReport);
      } else if (inputMode === "url") {
        const trimmedUrl = url.trim();
        if (!trimmedUrl) {
          setError("请先输入网页链接");
          setLoading(false);
          if (stepTimerRef.current) {
            clearInterval(stepTimerRef.current);
            stepTimerRef.current = null;
          }
          return;
        }
        const res = await fetch("/api/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmedUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "扫描失败");
        setResult(data as CheckReport);
      } else if (inputMode === "image" && uploadedImage) {
        const form = new FormData();
        form.append("image", uploadedImage);
        const res = await fetch("/api/extract", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "扫描失败");
        setResult(data as CheckReport);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "扫描请求失败");
    } finally {
      if (stepTimerRef.current) {
        clearInterval(stepTimerRef.current);
        stepTimerRef.current = null;
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col text-[#1A1D21]" style={{ backgroundColor: "#FAF3E8" }}>
      <Nav active="check" />

      <main className="flex-1">
        <HeroSection />
        <CheckForm
          inputMode={inputMode}
          onInputModeChange={setInputMode}
          text={text}
          onTextChange={setText}
          url={url}
          onUrlChange={setUrl}
          uploadedFile={uploadedFile}
          onUploadedFileChange={setUploadedFile}
          uploadedImage={uploadedImage}
          imagePreview={imagePreview}
          onUploadedImageChange={handleUploadedImageChange}
          loading={loading}
          error={error}
          loadingStep={loadingStep}
          formSectionRef={inputSectionRef}
          onSubmit={handleCheckSubmit}
        />
        {result && !loading && (
          <ResultDisplay result={result} onContactClick={() => setShowContact(true)} />
        )}
      </main>

      <ContactModal show={showContact} onClose={() => setShowContact(false)} />
      <Footer />
    </div>
  );
}
