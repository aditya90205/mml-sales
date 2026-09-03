/**
 * Horizontal tab bar for deal detail screens (Overview, Intake Form, ...).
 * Tabs can be individually disabled (e.g. Payments / P6 Checklist before
 * the deal reaches those stages).
 */
export default function DealTabs({ tabs, activeKey, onChange }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-none border-b border-black/8">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.key)}
            className={`relative shrink-0 px-4 py-3 text-[13px] font-semibold whitespace-nowrap transition-colors ${
              tab.disabled
                ? "text-[#C2C5CB] cursor-not-allowed"
                : isActive
                ? "text-[#E8395B]"
                : "text-[#4B5563] hover:text-[#111]"
            }`}
          >
            {tab.label}
            {isActive && !tab.disabled && (
              <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#E8395B] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}
