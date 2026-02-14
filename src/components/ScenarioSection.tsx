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
    <section className="border-b border-[#E5E7EB] bg-white px-4 py-8 sm:px-6">
      <h2 className="text-center text-lg font-semibold text-gray-900">你正在准备什么？</h2>
      <div className="mx-auto mt-6 flex max-w-4xl flex-col gap-3 sm:flex-row">
        {SCENARIO_CARDS.map((card) => {
          const selected = contentType === card.contentType;
          return (
            <button
              key={card.title}
              type="button"
              onClick={() => onSelectContentType(card.contentType)}
              className={`flex flex-1 items-start gap-3 rounded-xl border-2 bg-white p-4 text-left transition-all hover:shadow-md ${
                selected
                  ? "border-[#C5A55A] shadow-lg -translate-y-0.5"
                  : "border-[#E5E7EB] hover:border-[#C5A55A]/50"
              }`}
            >
              <span className="text-2xl">{card.icon}</span>
              <div className="min-w-0 flex-1">
                <span className="font-medium text-gray-900">{card.title}</span>
                <p className="mt-0.5 text-sm text-[#6B7280]">{card.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
