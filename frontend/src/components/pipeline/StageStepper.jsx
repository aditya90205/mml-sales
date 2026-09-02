import React from "react";

const STAGES = [
  { id: "P0", name: "Prospect" },
  { id: "P1", name: "Qualified" },
  { id: "P2", name: "Data Collection" },
  { id: "P3", name: "Visit / Video" },
  { id: "P4", name: "Negotiation" },
  { id: "P5", name: "Payment" },
  { id: "P6", name: "Handover" },
];

export default function StageStepper({ activeStageId = "P0" }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-none">
      {STAGES.map((stage) => {
        const isActive = stage.id === activeStageId;
        return (
          <div
            key={stage.id}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[12px] font-medium transition-all shrink-0 min-w-[120px] ${
              isActive
                ? "bg-[#FFF1F2] border-[#FDA4AF] text-[#7A0A17] border-l-4 border-l-[#7A0A17] font-semibold shadow-sm"
                : "bg-[#F9FAFB] border-black/8 text-[#9CA3AF]"
            }`}
          >
            <span className={`text-[10px] uppercase tracking-wide ${isActive ? "text-[#7A0A17] font-bold" : "text-[#9CA3AF]"}`}>
              {stage.id}
            </span>
            <span className="truncate">{stage.name}</span>
          </div>
        );
      })}
    </div>
  );
}
