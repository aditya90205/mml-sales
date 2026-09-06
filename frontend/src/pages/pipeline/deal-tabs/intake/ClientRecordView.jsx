import { useState } from "react";
import { Check, Download } from "lucide-react";
import { toast } from "react-toastify";
import {
  SECTIONS_META,
  SECTION_BLOCKS,
  OVERALL_TOTAL_FIELDS,
  OVERALL_FILLED_FIELDS,
  countSectionFields,
} from "./intakeFormData";

function formatRecordValue(field, values, chipValues) {
  if (field.chipsKey) {
    const list = chipValues?.[field.chipsKey] || [];
    return list.length ? list.join(", ") : null;
  }
  if (field.type === "rows") {
    const rows = Array.isArray(values[field.key])
      ? values[field.key].filter((r) => Object.values(r || {}).some((v) => v && String(v).trim()))
      : [];
    return rows.length ? `${rows.length} rows` : null;
  }
  if (field.type === "checklist") {
    const list = values[field.key];
    return Array.isArray(list) && list.length ? list.join(", ") : null;
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
        entries.push({ label: field.label, value: display });
        anyFilled = true;
      }
    }
    if (!anyFilled && block.badge) {
      entries.push({ label: block.title, value: block.badge });
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

const AGREEMENT_PAGES = [
  {
    id: 1,
    title: "Parties & scope",
    status: "ok",
    heading: "Parties and scope of service",
    clauses: [
      "1. This agreement is between Make My Lagan Matrimonials and the undersigned client / guardian.",
      "2. Services begin on the activation date and run for the validity period stated on the cover.",
      "3. Profiles shared under this agreement remain confidential to authorised MML staff and the client.",
    ],
  },
  {
    id: 2,
    title: "Fees & renewal",
    status: "ok",
    heading: "Fees, renewals and non-refundable payments",
    clauses: [
      "4. Registration and package fees are payable as listed in the Service Availed schedule.",
      "5. Roka / success fees remain payable if a shared profile leads to a commitment within 365 days.",
      "6. All payments once received are non-refundable except where required by applicable law.",
    ],
  },
  {
    id: 3,
    title: "Obligations",
    status: "flag",
    heading: "Client and MML obligations",
    clauses: [
      "7. The client will provide accurate intake information and notify MML of material changes.",
      "8. MML will make reasonable efforts to present suitable matches within the agreed criteria.",
      "9. Open flags on this page must be cleared before handover to the service team.",
    ],
  },
  {
    id: 4,
    title: "Declaration and Signature",
    status: "active",
    heading: "Declaration and Signature",
    clauseRange: "Clauses 15 to 19",
    clauses: [
      "15. I confirm that the information provided in this booklet is true to the best of my knowledge.",
      "16. I authorise MML to process my data for matchmaking and related service delivery.",
      "17. I understand that profiles shared with me remain confidential and may not be circulated.",
      "18. I accept that disputes arising under this agreement are subject to Delhi courts.",
      "19. I acknowledge that I have read and understood all clauses before signing electronically.",
    ],
    signed: {
      by: "Rajesh Raheja",
      relation: "Father",
      otpTo: "98••• ••771",
      verifiedOn: "02 Aug 2026 · 14:32 IST",
      system: "OTP-8842 · verified from 49.36.***.***",
    },
  },
];

const COMMENT_CHIPS = ["Clarify with client", "Mismatch with document", "Escalate to legal"];

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
          <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">{stat.label}</p>
          <p className={`text-[26px] font-extrabold leading-none mt-1.5 ${stat.valueClass}`}>{stat.value}</p>
          <p className="text-[11.5px] text-[#9CA3AF] mt-1.5">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}

function VoiceNotesFilesCard() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide mb-3">Voice notes &amp; files</p>
      <div className="flex flex-col gap-3">
        {VOICE_NOTES_FILES.map((item) => (
          <div key={item.title} className="flex items-start gap-2.5">
            <span className="size-8 rounded-full bg-[#F3E8F0] text-[#7A0A17] grid place-items-center shrink-0 text-[11px] font-bold">
              VN
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-[#111]">{item.title}</p>
              <p className="text-[11px] text-[#9CA3AF] mt-0.5">{item.meta}</p>
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
      <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide mb-3">Still needed</p>
      <div className="flex flex-col gap-2.5">
        {STILL_NEEDED.map((item) => (
          <div key={item.label} className="flex items-start gap-2.5">
            <span className="size-2 rounded-full bg-[#E8395B] shrink-0 mt-1.5" />
            <div className="min-w-0">
              <p className="text-[12.5px] font-semibold text-[#111]">{item.label}</p>
              <p className="text-[11px] text-[#9CA3AF]">{item.section}</p>
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
        <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">Check list</p>
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
      <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">Service availed</p>
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
      <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">Terms on file</p>
      <p className="text-[12.5px] text-[#4B5563] leading-relaxed mt-2.5">
        Services run <span className="font-semibold text-[#111]">365 days from activation</span> and end on
        expiry unless renewed. Roka and success fees stay payable if a profile shared by MML leads to a
        commitment within 365 days of sharing, expiry or not. All payments are non-refundable. Disputes go
        to the Delhi courts.
      </p>
    </div>
  );
}

function ClientServiceAgreementCard() {
  const [page, setPage] = useState(4);
  const [acknowledged, setAcknowledged] = useState({ 1: true, 2: true, 3: false, 4: false });
  const [comment, setComment] = useState("");
  const current = AGREEMENT_PAGES.find((p) => p.id === page) || AGREEMENT_PAGES[3];
  const ackCount = Object.values(acknowledged).filter(Boolean).length;

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-[18px] font-bold text-[#111]">Client service agreement</h2>
          <p className="text-[12px] text-[#9CA3AF] mt-0.5">SE/26/0831 · v3 template · 19 clauses</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#E7F8EF] text-[#16A34A] text-[12px] font-semibold">
            <Check size={12} strokeWidth={3} /> Signed by OTP
          </span>
          <button
            type="button"
            onClick={() => toast.success("Downloading signed PDF...")}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white border border-black/10 text-[12px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors"
          >
            <Download size={12} /> Signed — download PDF
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {AGREEMENT_PAGES.map((p) => {
          const active = p.id === page;
          const dot =
            p.status === "flag" ? "bg-[#F59E0B]" : acknowledged[p.id] || p.status === "ok" ? "bg-[#16A34A]" : "bg-[#D1D5DB]";
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPage(p.id)}
              className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold transition-colors ${
                active
                  ? "bg-[#7A0A17] text-white"
                  : "bg-[#F3F4F6] text-[#4B5563] hover:bg-[#E9EAEC]"
              }`}
            >
              {!active && <span className={`size-1.5 rounded-full ${dot}`} />}
              Page {p.id}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_240px] gap-4 items-start">
        <div className="border border-black/8 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-black/6">
            <h3 className="text-[15px] font-bold text-[#111]">{current.heading}</h3>
            {current.clauseRange && (
              <p className="text-[12px] text-[#9CA3AF] mt-0.5">{current.clauseRange}</p>
            )}
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            {current.clauses.map((clause) => (
              <p key={clause} className="text-[13px] text-[#374151] leading-relaxed">
                {clause}
              </p>
            ))}
          </div>
          {current.signed && (
            <div className="mx-5 mb-5 rounded-xl bg-[#FCF5F6] border border-[#F0D9DE] px-4 py-3.5">
              <p className="text-[11px] font-bold text-[#7A0A17] uppercase tracking-wide">Signed electronically</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2.5">
                <div>
                  <p className="text-[11px] text-[#9CA3AF]">Signed by</p>
                  <p className="text-[13px] font-semibold text-[#111]">{current.signed.by}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#9CA3AF]">Relation to candidate</p>
                  <p className="text-[13px] font-semibold text-[#111]">{current.signed.relation}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#9CA3AF]">OTP sent to</p>
                  <p className="text-[13px] font-semibold text-[#111]">{current.signed.otpTo}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#9CA3AF]">Verified on</p>
                  <p className="text-[13px] font-semibold text-[#111]">{current.signed.verifiedOn}</p>
                </div>
              </div>
              <p className="text-[11px] text-[#9CA3AF] mt-2.5">{current.signed.system}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-[#FAFAFB] border border-black/8 rounded-xl p-3.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={!!acknowledged[page]}
                onChange={(e) => setAcknowledged((prev) => ({ ...prev, [page]: e.target.checked }))}
                className="mt-0.5 size-4 rounded border-black/20 accent-[#7A0A17]"
              />
              <span>
                <span className="block text-[12.5px] font-semibold text-[#111]">Acknowledge this page</span>
                <span className="block text-[11px] text-[#9CA3AF] mt-0.5">
                  Required on every page before handover.
                </span>
              </span>
            </label>
            <p className="text-[11.5px] text-[#6B7280] mt-2.5">
              {ackCount} of 4 pages acknowledged{" "}
              <span className="text-[#E8395B] font-semibold">1 open flag</span>
            </p>
          </div>

          <div className="bg-white border border-black/8 rounded-xl p-3.5">
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">Add a comment on this page</p>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a note..."
              className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-[12.5px] text-[#111] placeholder:text-[#9CA3AF] outline-none resize-y focus:border-[#7A0A17]/35"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMENT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setComment((prev) => (prev ? `${prev} ${chip}` : chip))}
                  className="text-[11px] font-medium text-[#4B5563] bg-[#F3F4F6] rounded-full px-2.5 py-1 hover:bg-[#E9EAEC] transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                if (!comment.trim()) {
                  toast.info("Add a comment first.");
                  return;
                }
                toast.success("Comment saved on this page.");
                setComment("");
              }}
              className="mt-3 w-full h-9 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Save comment
            </button>
            <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide mt-3.5">
              RM comments on page {page}
            </p>
            <p className="text-[12px] text-[#9CA3AF] mt-1">No comments on this page yet.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="h-9 px-4 rounded-xl border border-black/10 text-[12.5px] font-semibold text-[#374151] disabled:opacity-40 hover:bg-[#FAFAFB] transition-colors"
        >
          Previous page
        </button>
        <span className="text-[12px] text-[#9CA3AF]">
          Page {page} of {AGREEMENT_PAGES.length}
        </span>
        <button
          type="button"
          disabled={page >= AGREEMENT_PAGES.length}
          onClick={() => setPage((p) => Math.min(AGREEMENT_PAGES.length, p + 1))}
          className="h-9 px-4 rounded-xl border border-black/10 text-[12.5px] font-semibold text-[#374151] disabled:opacity-40 hover:bg-[#FAFAFB] transition-colors"
        >
          Next page
        </button>
      </div>
    </div>
  );
}

function ClientRecordSectionCard({ index, label, entries, captured, blankCount, onOpen }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-black/6">
        <h3 className="text-[14px] font-bold text-[#111]">
          <span className="text-[#9CA3AF] font-semibold mr-1.5">{String(index + 1).padStart(2, "0")}</span>
          {label}
        </h3>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[12px] text-[#9CA3AF]">{captured} captured</span>
          <button
            type="button"
            onClick={onOpen}
            className="h-8 px-3.5 rounded-lg border border-black/10 text-[12px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors"
          >
            Open
          </button>
        </div>
      </div>

      {entries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3.5 px-5 py-4">
          {entries.map((entry) => (
            <div key={`${entry.label}-${entry.value}`}>
              <p className="text-[11px] text-[#9CA3AF]">{entry.label}</p>
              <p className="text-[13px] font-semibold text-[#111] mt-0.5 break-words">{entry.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-5 py-4 text-[13px] text-[#9CA3AF]">No fields captured in this section yet.</p>
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

export default function ClientRecordView({ values, chips, empty, onOpenSection }) {
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

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)] gap-5 items-start">
        <div className="flex flex-col gap-4 min-w-0">
          <ClientServiceAgreementCard />

          {sectionCards.map((section) => (
            <ClientRecordSectionCard
              key={section.key}
              index={section.index}
              label={section.label}
              entries={section.entries}
              captured={section.captured}
              blankCount={section.blankCount}
              onOpen={() => onOpenSection(section.key)}
            />
          ))}
        </div>

        <div className="flex flex-col gap-5 min-w-0">
          <VoiceNotesFilesCard />
          <StillNeededCard />
          <DocumentChecklistCard />
          <ServiceAvailedCard />
          <TermsOnFileCard />
        </div>
      </div>
    </div>
  );
}

