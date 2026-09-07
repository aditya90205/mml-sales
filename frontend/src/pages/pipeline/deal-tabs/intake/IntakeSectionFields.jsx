import { Check, X } from "lucide-react";
import { toast } from "react-toastify";
import { INPUT, isFieldFilled } from "./intakeFormData";

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

export function FormBlock({ block, values, chipValues, onFieldChange, onRemoveChip, locked }) {
  const filled = block.fields.filter((f) => isFieldFilled(f, values, chipValues)).length;
  const total = block.fields.length;
  const colClass = block.columns === 1 ? "" : block.columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";

  return (
    <div className={`bg-white border border-black/8 rounded-2xl p-5 ${locked ? "opacity-70" : ""}`}>
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
      <div
        className={`grid grid-cols-1 ${colClass} gap-x-6 gap-y-4 ${locked ? "pointer-events-none select-none" : ""}`}
        aria-disabled={locked || undefined}
      >
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
