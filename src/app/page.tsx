"use client";

import { useState, useRef } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import ScenarioSection from "@/components/ScenarioSection";
import CheckForm from "@/components/CheckForm";
import ResultDisplay from "@/components/ResultDisplay";
import ContactModal from "@/components/ContactModal";
import type { CheckReport } from "@/types/check";
import { COUNTRIES, CONTENT_TYPES } from "@/types/check";

export default function Home() {
  const [text, setText] = useState("");
  const [targetCountry, setTargetCountry] = useState<string>(COUNTRIES[0]);
  const [contentType, setContentType] = useState<string>(CONTENT_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const inputSectionRef = useRef<HTMLDivElement>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleCheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = text.trim();
    if (!trimmed) {
      setError("请先输入需要扫描的内容");
      return;
    }
    if (trimmed.length > 10000) {
      setError("内容不能超过 10000 字");
      return;
    }
    setLoading(true);
    setLoadingStep(0);
    setResult(null);
    stepTimerRef.current = setInterval(() => {
      setLoadingStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 3000);
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: trimmed,
          targetCountry: targetCountry || undefined,
          contentType: contentType || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "扫描失败");
      const report = data as CheckReport;
      setResult(report);
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

  const setScenarioAndScroll = (contentTypeValue: string) => {
    setContentType(contentTypeValue);
    inputSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1B3A5C]">
      <Nav active="check" />

      <main className="flex-1">
        <HeroSection />
        <ScenarioSection contentType={contentType} onSelectContentType={setScenarioAndScroll} />
        <CheckForm
          text={text}
          onTextChange={setText}
          targetCountry={targetCountry}
          onTargetCountryChange={setTargetCountry}
          contentType={contentType}
          onContentTypeChange={setContentType}
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
