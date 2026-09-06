import { Check, X } from "lucide-react";
import { toast } from "react-toastify";
import {
  SECTIONS_META,
  SECTION_BLOCKS,
  SECTION_TIPS,
  OVERALL_TOTAL_FIELDS,
  OVERALL_FILLED_FIELDS,
  INPUT,
  isFieldFilled,
  computeSectionPercent,
  countSectionFields,
} from "./intakeFormData";

function SectionHeader({
  index,
  totalSections,
  label,
  filled,
  total,
  tip,
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wide">
          Section {String(index + 1).padStart(2, "0")} of {String(totalSections).padStart(2, "0")}
        </p>
        <div className="flex items-end justify-between gap-3 flex-wrap mt-1">
          <h2 className="text-[26px] font-bold text-[#111] tracking-tight leading-tight">{label}</h2>
          <p className="text-[12.5px] text-[#9CA3AF] shrink-0 pb-1">
            {filled} of {total} filled in this section
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={() => toast.info("Voice note recording coming soon.")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#374151] hover:bg-[#FAFAFB] transition-colors"
        >
          <span className="size-2.5 rounded-full bg-[#E8395B] shrink-0" />
          Record voice note for this section
        </button>
        <button
          type="button"
          onClick={() => toast.info("Attach photo or document coming soon.")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#374151] hover:bg-[#FAFAFB] transition-colors"
        >
          Attach photo or document
        </button>
      </div>

      {tip && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-4 py-3">
          <p className="text-[12.5px] text-[#92400E] italic leading-relaxed">{tip}</p>
        </div>
      )}
    </div>
  );
}

function FieldLabel({ label, required }) {
  return (
    <label className="block text-[13px] text-[#374151] mb-1.5">
      {label}
      {required && <span className="text-[#E8395B]"> *</span>}
    </label>
  );
}

function Pill({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 px-3.5 rounded-xl text-[12.5px] font-semibold transition-colors whitespace-nowrap ${
        selected ? "bg-[#7A0A17] text-white" : "bg-white border border-black/12 text-[#374151] hover:bg-[#FAFAFB]"
      }`}
    >
      {children}
    </button>
  );
}

function RowsField({ def, value, onChange }) {
  const rows = value && value.length ? value : Array.from({ length: def.rowCount }, () => ({}));
  const rowLabel = def.rowLabel || "Row";

  const updateRow = (i, rowKey, val) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [rowKey]: val } : r));
    onChange(next);
  };

  return (
    <div>
      <FieldLabel label={def.label} />
      <div className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <div key={i} className="border border-black/8 rounded-xl p-3.5">
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide mb-2.5">
              {rowLabel} {i + 1}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {def.rowFields.map((rf) => (
                <div key={rf.key}>
                  <label className="block text-[11px] text-[#9CA3AF] mb-1">{rf.label}</label>
                  <input
                    value={row[rf.key] || ""}
                    onChange={(e) => updateRow(i, rf.key, e.target.value)}
                    className="w-full h-9 border border-black/12 rounded-lg px-2.5 text-[12.5px] text-[#111] outline-none focus:border-[#7A0A17] bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChecklistField({ def, value, onChange }) {
  const checked = value || [];
  const toggle = (opt) => {
    const next = checked.includes(opt) ? checked.filter((c) => c !== opt) : [...checked, opt];
    onChange(next);
  };

  return (
    <div>
      <FieldLabel label={def.label} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {def.options.map((opt) => {
          const isChecked = checked.includes(opt);
          return (
            <button
              type="button"
              key={opt}
              onClick={() => toggle(opt)}
              className={`flex items-center gap-2 h-11 px-3 rounded-lg border text-[12.5px] font-medium text-left transition-colors ${
                isChecked ? "bg-[#ECFDF3] border-[#16A34A]/30 text-[#111]" : "bg-white border-black/12 text-[#374151] hover:bg-[#FAFAFB]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                  isChecked ? "bg-[#16A34A]" : "border border-black/20"
                }`}
              >
                {isChecked && <Check size={11} className="text-white" strokeWidth={3} />}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function IntakeField({ def, value, chips, onChange, onRemoveChip }) {
  if (def.type === "pill") {
    return (
      <div>
        <FieldLabel label={def.label} required={def.required} />
        <div className="flex flex-wrap gap-2">
          {def.options.map((opt) => (
            <Pill key={opt} selected={value === opt} onClick={() => onChange(opt === value ? "" : opt)}>
              {opt}
            </Pill>
          ))}
        </div>
      </div>
    );
  }

  if (def.type === "textarea") {
    return (
      <div>
        <FieldLabel label={def.label} required={def.required} />
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write here"
          rows={4}
          className={`${INPUT} h-auto py-2.5 resize-none`}
        />
      </div>
    );
  }

  if (def.type === "rows") {
    return <RowsField def={def} value={value} onChange={onChange} />;
  }

  if (def.type === "checklist") {
    return <ChecklistField def={def} value={value} onChange={onChange} />;
  }

  if (def.type === "upload") {
    return (
      <div>
        <FieldLabel label={def.label} required={def.required} />
        <div className="flex items-center gap-2">
          <input value={value || ""} onChange={(e) => onChange(e.target.value)} className={INPUT} />
          <button
            type="button"
            onClick={() => toast.info("Upload coming soon.")}
            className="h-11 px-4 rounded-xl border border-black/12 text-[12.5px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors shrink-0 whitespace-nowrap"
          >
            Upload
          </button>
        </div>
        {def.note && <p className="text-[11px] text-[#9CA3AF] mt-1.5">{def.note}</p>}
        {def.chipsKey && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(chips || []).map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4B5563] bg-[#F3F4F6] rounded-md px-2 py-1"
              >
                {chip}
                <button type="button" onClick={() => onRemoveChip(chip)} className="hover:text-[#111]">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <FieldLabel label={def.label} required={def.required} />
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} className={INPUT} />
    </div>
  );
}

function FormBlock({ block, values, chipValues, onFieldChange, onRemoveChip }) {
  const filled = block.fields.filter((f) => isFieldFilled(f, values, chipValues)).length;
  const total = block.fields.length;
  const colClass = block.columns === 1 ? "" : block.columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <h3 className="text-[11px] font-bold text-[#7A0A17] uppercase tracking-wide shrink-0">{block.title}</h3>
          {block.badge && (
            <span className="text-[10px] font-semibold text-[#6B7280] bg-[#F3F4F6] rounded-full px-2.5 py-1 truncate">
              {block.badge}
            </span>
          )}
        </div>
        <span className="text-[11px] text-[#9CA3AF] shrink-0">
          {filled} of {total} filled
        </span>
      </div>
      <div className={`grid grid-cols-1 ${colClass} gap-x-6 gap-y-4`}>
        {block.fields.map((f) => (
          <div
            key={f.key}
            className={f.type === "textarea" || f.type === "rows" || f.type === "checklist" || f.fullWidth ? "sm:col-span-full" : ""}
          >
            <IntakeField
              def={f}
              value={values[f.key]}
              chips={f.chipsKey ? chipValues[f.chipsKey] : undefined}
              onChange={(v) => onFieldChange(f.key, v)}
              onRemoveChip={f.chipsKey ? (chip) => onRemoveChip(f.chipsKey, chip) : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function FormFilledCard({ percent, filled, total }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">Form filled</p>
      <div className="flex items-end gap-2.5 mt-1 flex-wrap">
        <p className="text-[32px] font-extrabold text-[#7A0A17] leading-none">{percent}%</p>
        <p className="text-[11.5px] text-[#9CA3AF] pb-1">
          {filled} of {total} fields
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-[#F1F2F4] overflow-hidden mt-3">
        <div className="h-full rounded-full bg-[#E8395B]/70" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function SectionsSidebar({ sections, activeKey, onSelect }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
      <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide px-5 pt-4 pb-3">Booklet sections</p>
      <div className="flex flex-col">
        {sections.map((s, i) => {
          const active = s.key === activeKey;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onSelect(s.key)}
              className={`flex items-center justify-between gap-3 px-5 py-3 text-left border-l-[3px] transition-colors ${
                active ? "border-[#7A0A17] bg-[#FCF5F6]" : "border-transparent hover:bg-[#FAFAFB]"
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className={`text-[11px] font-bold shrink-0 ${active ? "text-[#7A0A17]" : "text-[#9CA3AF]"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`text-[12.5px] leading-snug ${active ? "font-bold text-[#7A0A17]" : "text-[#374151]"}`}>
                  {s.label}
                </span>
              </span>
              <span className="text-[11px] text-[#9CA3AF] shrink-0">{s.percent}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


/**
 * "Fill the form" view — section header, field blocks, progress rail.
 */
export default function IntakeFillFormView({
  empty,
  activeKey,
  setActiveKey,
  values,
  setField,
  chips,
  removeChip,
}) {
  const activeIndex = SECTIONS_META.findIndex((s) => s.key === activeKey);
  const activeBlocks = SECTION_BLOCKS[activeKey];
  const activeCounts = empty
    ? { filled: 0, total: activeBlocks?.reduce((sum, b) => sum + b.fields.length, 0) || 0 }
    : countSectionFields(activeBlocks, values, chips);

  const sections = SECTIONS_META.map((s) => ({
    ...s,
    percent: empty ? 0 : computeSectionPercent(SECTION_BLOCKS[s.key], values, chips),
  }));

  const overallPercent = empty ? 0 : Math.round((OVERALL_FILLED_FIELDS / OVERALL_TOTAL_FIELDS) * 100);

  const handleNext = () => {
    const next = SECTIONS_META[activeIndex + 1];
    if (next) {
      toast.success(`Saved. Continuing to ${next.label}.`);
      setActiveKey(next.key);
    } else {
      toast.success("Intake form saved.");
    }
  };
  const handlePrev = () => {
    const prev = SECTIONS_META[activeIndex - 1];
    if (prev) setActiveKey(prev.key);
  };

  const nextLabel =
    activeIndex < SECTIONS_META.length - 1
      ? `Save and continue to ${SECTIONS_META[activeIndex + 1].label}`
      : "Finish and open the client record";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)] gap-5 items-start">
      <div className="flex flex-col gap-5 min-w-0">
        <SectionHeader
          index={activeIndex}
          totalSections={SECTIONS_META.length}
          label={SECTIONS_META[activeIndex].label}
          filled={activeCounts.filled}
          total={activeCounts.total}
          tip={SECTION_TIPS[activeKey]}
        />

        {activeBlocks ? (
          activeBlocks.map((block) => (
            <FormBlock
              key={block.title}
              block={block}
              values={values}
              chipValues={chips}
              onFieldChange={setField}
              onRemoveChip={removeChip}
            />
          ))
        ) : (
          <div className="bg-white border border-black/8 rounded-2xl p-8 text-center">
            <p className="text-[14px] font-bold text-[#111]">{SECTIONS_META[activeIndex].label}</p>
            <p className="text-[12.5px] text-[#9CA3AF] mt-1.5">This section&apos;s fields haven&apos;t been added yet.</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 bg-white border border-black/8 rounded-2xl px-5 py-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="h-10 px-4 rounded-xl border border-black/12 text-[13px] font-semibold text-[#374151] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FAFAFB] transition-colors"
          >
            Previous section
          </button>
          <span className="text-[12.5px] text-[#9CA3AF]">
            Section {activeIndex + 1} of {SECTIONS_META.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            {nextLabel}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <FormFilledCard percent={overallPercent} filled={empty ? 0 : OVERALL_FILLED_FIELDS} total={OVERALL_TOTAL_FIELDS} />
        <SectionsSidebar sections={sections} activeKey={activeKey} onSelect={setActiveKey} />
      </div>
    </div>
  );
}
