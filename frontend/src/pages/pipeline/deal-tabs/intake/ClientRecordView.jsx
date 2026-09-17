import { useState } from "react";
import { Check, Eye, EyeOff, Pencil, ShieldCheck } from "lucide-react";
import {
  SECTIONS_META,
  SECTION_BLOCKS,
  OVERALL_TOTAL_FIELDS,
  OVERALL_FILLED_FIELDS,
  RECORD_DETAIL_TABLES,
  countSectionFields,
  getFilledRows,
} from "./intakeFormData";

const MASKED_VALUE = "••••••••";

function formatRecordValue(field, values, chipValues) {
  if (field.type === "rows") {
    const rows = getFilledRows(values[field.key]);
    if (!rows.length) return null;
    return `${rows.length} row${rows.length === 1 ? "" : "s"}`;
  }
  if (field.type === "checklist") {
    const list = values[field.key];
    if (!Array.isArray(list) || !list.length) return null;
    if (field.options?.length) return `${list.length} of ${field.options.length} collected`;
    return list.join(", ");
  }
  if (field.chipsKey) {
    const text = values[field.key];
    if (text && String(text).trim()) return String(text);
    const list = chipValues?.[field.chipsKey] || [];
    return list.length ? list.join(", ") : null;
  }
  const value = values[field.key];
  if (!value || !String(value).trim()) return null;
  return String(value);
}

function getSectionRecordEntries(blocks, values, chipValues) {
  if (!blocks?.length) return [];
  const entries = [];
  for (const block of blocks) {
    let anyFilled = false;
    for (const field of block.fields) {
      const display = formatRecordValue(field, values, chipValues);
      if (display) {
        entries.push({
          key: field.key,
          label: field.label,
          value: display,
          sensitive: Boolean(field.sensitive),
        });
        anyFilled = true;
      }
    }
    if (!anyFilled && block.badge) {
      entries.push({ key: block.title, label: block.title, value: block.badge, sensitive: false });
    }
  }
  return entries;
}

const DOCUMENT_CHECKLIST = [
  { label: "Format complete", done: true },
  { label: "Proof of date of birth", done: true },
  { label: "Proof of I.D.", done: true },
  { label: "Photograph", done: true },
  { label: "Visiting cards (2)", done: false },
  { label: "Business profile", done: false },
  { label: "Self made profile", done: false },
  { label: "Divorce decree (if divorced)", done: false },
  { label: "Passport copy (NRI / abroad / non-Indian)", done: false },
  { label: "Report of medical test", done: false },
];

const SERVICE_AVAILED = [
  { label: "Registration agreed", value: "₹53,100" },
  { label: "Roka / success fee", value: "₹1,11,000" },
  { label: "Received", value: "₹31,860" },
  { label: "Balance", value: "₹21,240" },
];

const VOICE_NOTES_FILES = [
  { title: "Section 06 — Match desired", meta: "2:14 · 10 answers saved" },
  { title: "Aadhaar — front and back", meta: "Uploaded by Neha Sharma" },
];

const STILL_NEEDED = [
  { label: "City", section: "Section 03" },
  { label: "Preference given by", section: "Section 06" },
  { label: "Data privacy consent", section: "Section 10" },
];

function ClientRecordSummaryBar({ formPercent, formFilled, formTotal }) {
  const stats = [
    {
      label: "Form filled",
      value: `${formPercent}%`,
      sub: `${formFilled} of ${formTotal} fields`,
      valueClass: "text-[#111]",
    },
    {
      label: "Required still open",
      value: "3",
      sub: "Blocks the handover",
      valueClass: "text-[#D97706]",
    },
    {
      label: "Check list",
      value: "4/10",
      sub: "Documents collected",
      valueClass: "text-[#111]",
    },
    {
      label: "Service validity",
      value: "365 days",
      sub: "From date of activation",
      valueClass: "text-[#111]",
    },
  ];

  return (
    <div className="bg-white border border-black/8 rounded-2xl grid grid-cols-2 lg:grid-cols-4 overflow-hidden">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`px-5 py-4 ${i < stats.length - 1 ? "border-r border-black/6" : ""} ${i < 2 ? "border-b lg:border-b-0 border-black/6" : ""}`}
        >
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">{stat.label}</p>
          <p className={`text-[26px] font-extrabold leading-none mt-1.5 ${stat.valueClass}`}>{stat.value}</p>
          <p className="text-[12.5px] text-[#6B7280] mt-1.5">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}

function VoiceNotesFilesCard() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide mb-3">Voice notes &amp; files</p>
      <div className="flex flex-col gap-3">
        {VOICE_NOTES_FILES.map((item) => (
          <div key={item.title} className="flex items-start gap-2.5">
            <span className="size-8 rounded-full bg-[#F3E8F0] text-[#7A0A17] grid place-items-center shrink-0 text-[11px] font-bold">
              VN
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-[#111]">{item.title}</p>
              <p className="text-[12.5px] text-[#6B7280] mt-0.5">{item.meta}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StillNeededCard() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide mb-3">Still needed</p>
      <div className="flex flex-col gap-2.5">
        {STILL_NEEDED.map((item) => (
          <div key={item.label} className="flex items-start gap-2.5">
            <span className="size-2 rounded-full bg-[#E8395B] shrink-0 mt-1.5" />
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-[#111]">{item.label}</p>
              <p className="text-[12.5px] text-[#6B7280]">{item.section}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentChecklistCard() {
  const doneCount = DOCUMENT_CHECKLIST.filter((d) => d.done).length;
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">Check list</p>
        <span className="text-[11px] font-semibold text-[#6B7280]">
          {doneCount} of {DOCUMENT_CHECKLIST.length}
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {DOCUMENT_CHECKLIST.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            <span
              className={`size-5 rounded-full grid place-items-center shrink-0 border ${
                item.done ? "bg-[#16A34A] border-[#16A34A]" : "bg-white border-[#E3D4D7]"
              }`}
            >
              {item.done && <Check size={11} className="text-white" strokeWidth={3} />}
            </span>
            <span className={`text-[12.5px] ${item.done ? "text-[#111] font-medium" : "text-[#6B7280]"}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServiceAvailedCard() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">Service availed</p>
      <span className="inline-flex mt-2.5 text-[12px] font-semibold text-[#92400E] bg-[#FFF3E4] rounded-full px-3 py-1">
        Exclusive Package
      </span>
      <div className="mt-3.5 flex flex-col gap-2">
        {SERVICE_AVAILED.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-3 text-[12.5px]">
            <span className="text-[#6B7280]">{row.label}</span>
            <span className="font-semibold text-[#111]">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TermsOnFileCard() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">Terms on file</p>
      <p className="text-[12.5px] text-[#4B5563] leading-relaxed mt-2.5">
        Services run <span className="font-semibold text-[#111]">365 days from activation</span> and end on
        expiry unless renewed. Roka and success fees stay payable if a profile shared by MML leads to a
        commitment within 365 days of sharing, expiry or not. All payments are non-refundable. Disputes go
        to the Delhi courts.
      </p>
    </div>
  );
}

function ChangeSummaryCard({ changeLog = [] }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-2 mb-4">
        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">Change summary</p>
        {changeLog.length > 0 && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-[#F3E8F0] text-[#7A0A17] text-[11px] font-bold">
            {changeLog.length}
          </span>
        )}
      </div>

      {changeLog.length === 0 ? (
        <p className="text-[12.5px] text-[#6B7280] leading-relaxed">
          No verified changes yet. Edit a section, send OTP, and each update appears here.
        </p>
      ) : (
        <div className="relative flex flex-col">
          {changeLog.map((item, index) => {
            const isLast = index === changeLog.length - 1;
            return (
              <div key={item.id} className="relative flex gap-3">
                <div className="flex flex-col items-center shrink-0 w-4 pt-1">
                  <span className="size-2.5 rounded-full bg-[#7A0A17] ring-4 ring-[#F3E8F0] shrink-0" />
                  {!isLast && <span className="w-px flex-1 min-h-4 bg-[#E8D5DA] mt-1.5" />}
                </div>

                <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-4"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[13px] font-semibold text-[#111] leading-snug">{item.label}</p>
                    <span className="inline-flex items-center gap-1 shrink-0 h-5 px-1.5 rounded-md bg-[#E7F8EF] text-[#166534] text-[10px] font-semibold">
                      <ShieldCheck size={10} strokeWidth={2.5} />
                      OTP
                    </span>
                  </div>

                  <div className="mt-2 rounded-lg border border-black/6 bg-[#FAFAFB] px-2.5 py-2 space-y-1.5">
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">From</p>
                      <p className="text-[12px] text-[#6B7280] line-through break-all leading-snug mt-0.5">
                        {item.from}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#9CA3AF]">To</p>
                      <p className="text-[12.5px] font-semibold text-[#111] break-all leading-snug mt-0.5">
                        {item.to}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#6B7280] mt-2 leading-snug">
                    <span className="font-medium text-[#4B5563]">{item.at}</span>
                    <span className="text-[#D1D5DB]"> · </span>
                    {item.by}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ClientRecordSectionCard({ index, label, entries, captured, blankCount, onEdit }) {
  const [revealed, setRevealed] = useState({});
  const hasSensitive = entries.some((entry) => entry.sensitive);

  const toggleReveal = (key) => {
    setRevealed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const revealAll = () => {
    const next = {};
    entries.forEach((entry) => {
      if (entry.sensitive) next[entry.key] = true;
    });
    setRevealed(next);
  };

  const hideAll = () => {
    setRevealed({});
  };

  const allRevealed =
    hasSensitive &&
    entries.filter((e) => e.sensitive).every((e) => revealed[e.key]);

  return (
    <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-black/6">
        <h3 className="text-[14px] font-bold text-[#111] flex items-center gap-2.5 min-w-0">
          <span className="size-7 rounded-full bg-[#F3E8F0] text-[#7A0A17] grid place-items-center shrink-0 text-[11px] font-bold">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="truncate">{label}</span>
        </h3>
        <div className="flex items-center gap-3 shrink-0">
          {hasSensitive && (
            <button
              type="button"
              onClick={allRevealed ? hideAll : revealAll}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-black/10 text-[12px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors"
              aria-label={allRevealed ? "Hide sensitive fields" : "Show sensitive fields"}
            >
              {allRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
              {allRevealed ? "Hide" : "Show"}
            </button>
          )}
          <span className="text-[13px] text-[#6B7280]">{captured} captured</span>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl border border-[#7A0A17]/30 bg-white text-[12px] font-semibold text-[#7A0A17] hover:bg-[#FCF5F6] transition-colors"
            aria-label={`Edit ${label}`}
          >
            <Pencil size={13} />
            Edit
          </button>
        </div>
      </div>

      {entries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3.5 px-5 py-4">
          {entries.map((entry, i) => {
            const isHidden = entry.sensitive && !revealed[entry.key];
            return (
              <div key={`${entry.key || entry.label}-${i}`}>
                <p className="text-[12.5px] text-[#6B7280] flex items-center gap-1.5">
                  {entry.label}
                  {entry.sensitive && (
                    <button
                      type="button"
                      onClick={() => toggleReveal(entry.key)}
                      className="text-[#9CA3AF] hover:text-[#7A0A17] transition-colors"
                      aria-label={isHidden ? `Show ${entry.label}` : `Hide ${entry.label}`}
                      title={isHidden ? "Show" : "Hide"}
                    >
                      {isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                    </button>
                  )}
                </p>
                <p
                  className={`text-[13px] font-semibold mt-0.5 break-words ${
                    isHidden ? "text-[#9CA3AF] tracking-wider" : "text-[#111]"
                  }`}
                >
                  {isHidden ? MASKED_VALUE : entry.value}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="px-5 py-4 text-[13.5px] text-[#6B7280]">No fields captured in this section yet.</p>
      )}

      {blankCount > 0 && (
        <div className="bg-[#FFFBEB] border-t border-[#FDE68A] px-5 py-2.5">
          <p className="text-[12.5px] text-[#92400E]">
            {blankCount} field{blankCount === 1 ? "" : "s"} still blank in this section
          </p>
        </div>
      )}
    </div>
  );
}

function RecordDetailCard({ title, columns, rows, asTable }) {
  const filled = getFilledRows(rows);

  return (
    <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-black/6">
        <h3 className="text-[14px] font-bold text-[#111]">{title}</h3>
      </div>

      {filled.length === 0 ? (
        <p className="px-5 py-4 text-[13.5px] text-[#6B7280] italic">Nothing recorded yet.</p>
      ) : asTable ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-black/6">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-5 py-2.5 text-[12.5px] font-medium text-[#6B7280] whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filled.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b border-black/5 last:border-b-0">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-5 py-3 text-[13px] font-semibold text-[#111] align-top"
                    >
                      {row[col.key] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-black/5">
          {filled.map((row, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-x-5 gap-y-3 px-5 py-4"
              style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}
            >
              {columns.map((col) => (
                <div key={col.key} className="min-w-0">
                  <p className="text-[12.5px] text-[#6B7280]">{col.label}</p>
                  <p className="text-[13px] font-semibold text-[#111] mt-0.5 break-words">
                    {row[col.key] || "—"}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ClientRecordDetailTables({ values, empty }) {
  if (empty) {
    return RECORD_DETAIL_TABLES.map((table) => (
      <RecordDetailCard
        key={table.key}
        title={table.title}
        columns={table.columns}
        rows={[]}
        asTable={table.asTable}
      />
    ));
  }

  return RECORD_DETAIL_TABLES.map((table) => (
    <RecordDetailCard
      key={table.key}
      title={table.title}
      columns={table.columns}
      rows={values[table.key]}
      asTable={table.asTable}
    />
  ));
}

export default function ClientRecordView({ values, chips, empty, changeLog = [], onEditSection }) {
  const sectionCards = SECTIONS_META.map((section, index) => {
    const blocks = SECTION_BLOCKS[section.key];
    if (!blocks) return null;
    const entries = empty ? [] : getSectionRecordEntries(blocks, values, chips);
    const counts = empty
      ? { filled: 0, total: blocks.reduce((sum, b) => sum + b.fields.length, 0) }
      : countSectionFields(blocks, values, chips);
    return {
      ...section,
      index,
      entries,
      captured: counts.filled,
      blankCount: Math.max(counts.total - counts.filled, 0),
    };
  }).filter(Boolean);

  const formFilled = empty ? 0 : OVERALL_FILLED_FIELDS;
  const formPercent = empty ? 0 : Math.round((OVERALL_FILLED_FIELDS / OVERALL_TOTAL_FIELDS) * 100);

  return (
    <div className="flex flex-col gap-5">
      <ClientRecordSummaryBar
        formPercent={formPercent}
        formFilled={formFilled}
        formTotal={OVERALL_TOTAL_FIELDS}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,80fr)_minmax(0,20fr)] gap-5 items-start">
        <div className="flex flex-col gap-4 min-w-0">
          {sectionCards.map((section) => (
            <ClientRecordSectionCard
              key={section.key}
              index={section.index}
              label={section.label}
              entries={section.entries}
              captured={section.captured}
              blankCount={section.blankCount}
              onEdit={() => onEditSection?.(section.key)}
            />
          ))}

          <ClientRecordDetailTables values={values} empty={empty} />
        </div>

        <div className="flex flex-col gap-5 min-w-0">
          <VoiceNotesFilesCard />
          <StillNeededCard />
          <DocumentChecklistCard />
          <ServiceAvailedCard />
          <TermsOnFileCard />
          <ChangeSummaryCard changeLog={changeLog} />
        </div>
      </div>
    </div>
  );
}

