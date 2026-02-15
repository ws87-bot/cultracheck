"use client";

import { SCENARIO_CARDS } from "@/types/check";

interface ScenarioSectionProps {
  contentType: string;
  onSelectContentType: (contentTypeValue: string) => void;
}

export default function ScenarioSection({
  contentType,
  onSelectContentType,
}: ScenarioSectionProps) {
  return (
    <section className="border-b border-[#E8E3DA] bg-[#FAF3E8] px-4 py-8 sm:px-6">
      <h2
        className="text-center font-semibold"
        style={{ fontSize: 15, color: "#1A1D21" }}
      >
        你正在准备什么？
      </h2>
      <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-3 sm:flex-row">
        {SCENARIO_CARDS.map((card) => {
          const selected = contentType === card.contentType;
          return (
            <button
              key={card.title}
              type="button"
              onClick={() => onSelectContentType(card.contentType)}
              className={`flex min-h-[44px] w-full flex-1 flex-row items-center gap-3 rounded-[14px] border-[1.5px] bg-white p-4 text-left transition-all sm:items-start ${
                selected ? "-translate-y-0.5 border-2" : "border-[#E8E3DA]"
              }`}
              style={{
                borderColor: selected ? "#006B3F" : undefined,
                boxShadow: selected ? "0 8px 24px rgba(0,107,63,0.12)" : undefined,
              }}
            >
              <span className="flex-shrink-0 text-2xl">{card.icon}</span>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-[#1A1D21]">{card.title}</span>
                <p className="mt-0.5 text-sm text-[#3D4450]">{card.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
