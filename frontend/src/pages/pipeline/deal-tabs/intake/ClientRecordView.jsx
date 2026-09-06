import { useState } from "react";
import { Check, Download } from "lucide-react";
import { toast } from "react-toastify";
import {
  SECTIONS_META,
  SECTION_BLOCKS,
  OVERALL_TOTAL_FIELDS,
  OVERALL_FILLED_FIELDS,
  RECORD_DETAIL_TABLES,
  countSectionFields,
  getFilledRows,
} from "./intakeFormData";

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
    status: "ok",
    heading: "Client Service Agreement",
    clauseRange: "Parties and scope",
    body: [
      "This Client Service Agreement (“Agreement”) is entered into between Make My Lagan Matrimonials (“MML”) and the Client / guardian named in the intake booklet.",
      "MML will provide matchmaking and related advisory services for the package selected under Service Availed. Services begin on the activation date once registration is received in full.",
      "The Client agrees to provide accurate information, keep contact details current, and use shared profiles only for private consideration. Confidential information of either party must not be circulated without written consent.",
    ],
    acknowledged: {
      by: "Neha Sharma",
      at: "02 Aug 2026 · 14:26",
    },
    comments: [],
  },
  {
    id: 2,
    status: "ok",
    heading: "Terms and Conditions",
    clauseRange: "Clauses 1 to 7",
    body: [
      "1. The registration fee is payable in full at the time of enrolment and activates the service.",
      "2. Services run 365 days from the date of activation and end on expiry unless renewed in writing.",
      "3. All payments made to MML are non-refundable and non-transferable.",
      "4. The roka / success fee becomes payable on commitment to a match introduced by MML.",
      "5. The roka / success fee stays payable if a profile shared by MML leads to a commitment within 365 days of sharing, whether or not the service has expired.",
      "6. Profiles are shared for the Client's private consideration only and may not be circulated further.",
      "7. The Client confirms that all information given in the intake booklet is true to the best of their knowledge.",
    ],
    acknowledged: {
      by: "Neha Sharma",
      at: "02 Aug 2026 · 14:28",
    },
    comments: [
      {
        by: "Neha Sharma",
        at: "02 Aug 2026 · 14:28",
        text: "Clause 5 read aloud to Mr Raheja. He confirmed he understood that the fee carries for 365 days after a profile is shared.",
      },
    ],
  },
  {
    id: 3,
    status: "flag",
    heading: "Terms and Conditions",
    clauseRange: "Clauses 8 to 14",
    body: [
      "8. MML does not verify information supplied by either side and carries no liability for its accuracy.",
      "9. Matches are introductions only; the decision to proceed rests solely with the Client and the other party.",
      "10. The Client will notify MML promptly of any material change in status, preferences, or contact details.",
      "11. MML may pause introductions while required documents or consents remain outstanding.",
      "12. Photographs and media on file may be shown only as per the visibility settings agreed with the Client.",
      "13. Either party may terminate the engagement in writing; fees already received remain non-refundable.",
      "14. Suspension of the profile at the Client's request does not extend the 365-day validity.",
    ],
    acknowledged: null,
    comments: [
      {
        by: "Neha Sharma",
        at: "02 Aug 2026 · 14:31",
        text: "Clause 14 flagged — Mr Raheja asked whether a temporary pause would extend validity. Need written clarify before handover.",
        tag: "Clarify with client",
      },
    ],
  },
  {
    id: 4,
    status: "pending",
    heading: "Declaration and Signature",
    clauseRange: "Clauses 15 to 19",
    body: [
      "15. MML may decline or discontinue service where information is incomplete, misleading, or consent is withdrawn.",
      "16. Medical disclosures are used only for matching and are shared with the other side solely with consent.",
      "17. Personal data is processed as per the privacy consent recorded in this booklet and applicable law.",
      "18. Any amendment to this agreement is valid only if made in writing and signed by both parties.",
      "19. All disputes are subject to the exclusive jurisdiction of the courts at Delhi.",
    ],
    signed: {
      by: "Rajesh Raheja",
      relation: "Father",
      otpTo: "98••• ••771",
      verifiedOn: "02 Aug 2026 · 14:32 IST",
      system: "OTP-8842 · verified from 49.36.***.***",
    },
    acknowledged: null,
    comments: [],
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

function ClientServiceAgreementCard() {
  const [page, setPage] = useState(1);
  const [acknowledged, setAcknowledged] = useState(() =>
    Object.fromEntries(AGREEMENT_PAGES.map((p) => [p.id, p.acknowledged || null]))
  );
  const [commentsByPage, setCommentsByPage] = useState(() =>
    Object.fromEntries(AGREEMENT_PAGES.map((p) => [p.id, [...(p.comments || [])]]))
  );
  const [comment, setComment] = useState("");
  const [activeChip, setActiveChip] = useState("");

  const current = AGREEMENT_PAGES.find((p) => p.id === page) || AGREEMENT_PAGES[0];
  const pageAck = acknowledged[page];
  const pageComments = commentsByPage[page] || [];
  const ackCount = Object.values(acknowledged).filter(Boolean).length;
  const openFlags = AGREEMENT_PAGES.filter((p) => p.status === "flag").length;

  const pageDot = (p) => {
    if (p.status === "flag") return "bg-[#E8395B]";
    if (acknowledged[p.id]) return "bg-[#16A34A]";
    return "bg-[#D1D5DB]";
  };

  const acknowledgePage = () => {
    setAcknowledged((prev) => ({
      ...prev,
      [page]: {
        by: "Neha Sharma",
        at: new Date().toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    }));
    toast.success(`Page ${page} acknowledged.`);
  };

  const saveComment = () => {
    if (!comment.trim()) {
      toast.info("Add a comment first.");
      return;
    }
    const entry = {
      by: "Neha Sharma",
      at: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: comment.trim(),
      tag: activeChip || undefined,
    };
    setCommentsByPage((prev) => ({
      ...prev,
      [page]: [...(prev[page] || []), entry],
    }));
    setComment("");
    setActiveChip("");
    toast.success("Comment saved on this page.");
  };

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <h2 className="text-[18px] font-bold text-[#111]">Client service agreement</h2>
          <p className="text-[13px] text-[#6B7280] mt-0.5">SE/26/0631 · v3 template · 19 clauses</p>
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
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPage(p.id);
                setComment("");
                setActiveChip("");
              }}
              className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-semibold transition-colors ${
                active
                  ? "bg-[#7A0A17] text-white"
                  : "bg-white border border-black/10 text-[#4B5563] hover:bg-[#FAFAFB]"
              }`}
            >
              {!active && <span className={`size-1.5 rounded-full ${pageDot(p)}`} />}
              Page {p.id}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_260px] gap-4 items-start">
        <div className="border border-black/8 rounded-xl overflow-hidden min-w-0">
          <div className="px-5 py-4 border-b border-black/6">
            <h3 className="text-[15px] font-bold text-[#111]">{current.heading}</h3>
            {current.clauseRange && (
              <p className="text-[13px] text-[#6B7280] mt-0.5">{current.clauseRange}</p>
            )}
          </div>
          <div className="px-5 py-4 flex flex-col gap-3">
            {current.body.map((paragraph) => (
              <p key={paragraph} className="text-[13.5px] text-[#374151] leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          {current.signed && (
            <div className="mx-5 mb-5 rounded-xl bg-[#FCF5F6] border border-[#F0D9DE] px-4 py-3.5">
              <p className="text-[11px] font-bold text-[#7A0A17] uppercase tracking-wide">
                Signed electronically
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 mt-2.5">
                <div>
                  <p className="text-[12.5px] text-[#6B7280]">Signed by</p>
                  <p className="text-[13px] font-semibold text-[#111]">{current.signed.by}</p>
                </div>
                <div>
                  <p className="text-[12.5px] text-[#6B7280]">Relation to candidate</p>
                  <p className="text-[13px] font-semibold text-[#111]">{current.signed.relation}</p>
                </div>
                <div>
                  <p className="text-[12.5px] text-[#6B7280]">OTP sent to</p>
                  <p className="text-[13px] font-semibold text-[#111]">{current.signed.otpTo}</p>
                </div>
                <div>
                  <p className="text-[12.5px] text-[#6B7280]">Verified on</p>
                  <p className="text-[13px] font-semibold text-[#111]">{current.signed.verifiedOn}</p>
                </div>
              </div>
              <p className="text-[12.5px] text-[#6B7280] mt-2.5">{current.signed.system}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {pageAck ? (
            <div className="bg-[#E7F8EF] border border-[#BBF7D0] rounded-xl p-3.5">
              <div className="flex items-start gap-2.5">
                <span className="size-5 rounded-full bg-[#16A34A] grid place-items-center shrink-0 mt-0.5">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </span>
                <div className="min-w-0">
                  <p className="text-[13px] font-bold text-[#166534]">Acknowledged</p>
                  <p className="text-[12.5px] text-[#166534]/90 mt-0.5">
                    {pageAck.by} · {pageAck.at}
                  </p>
                </div>
              </div>
              <p className="text-[12.5px] text-[#6B7280] mt-2.5">
                {ackCount} of 4 pages acknowledged{" "}
                {openFlags > 0 && (
                  <span className="text-[#E8395B] font-semibold">
                    {openFlags} open flag{openFlags === 1 ? "" : "s"}
                  </span>
                )}
              </p>
            </div>
          ) : (
            <div className="bg-[#FAFAFB] border border-black/8 rounded-xl p-3.5">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={acknowledgePage}
                  className="mt-0.5 size-4 rounded border-black/20 accent-[#7A0A17]"
                />
                <span>
                  <span className="block text-[12.5px] font-semibold text-[#111]">
                    Acknowledge this page
                  </span>
                  <span className="block text-[12.5px] text-[#6B7280] mt-0.5">
                    Required on every page before handover.
                  </span>
                </span>
              </label>
              <p className="text-[12.5px] text-[#6B7280] mt-2.5">
                {ackCount} of 4 pages acknowledged{" "}
                {openFlags > 0 && (
                  <span className="text-[#E8395B] font-semibold">
                    {openFlags} open flag{openFlags === 1 ? "" : "s"}
                  </span>
                )}
              </p>
            </div>
          )}

          <div className="bg-white border border-black/8 rounded-xl p-3.5">
            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">
              Add a comment on this page
            </p>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did the client ask about on this page?"
              className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-[12.5px] text-[#111] placeholder:text-[#9CA3AF] outline-none resize-y focus:border-[#7A0A17]/35"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMENT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setActiveChip((prev) => (prev === chip ? "" : chip))}
                  className={`text-[11px] font-medium rounded-full px-2.5 py-1 border transition-colors ${
                    activeChip === chip
                      ? "bg-[#F3E8F0] border-[#7A0A17]/30 text-[#7A0A17]"
                      : "text-[#4B5563] bg-[#F3F4F6] border-transparent hover:bg-[#E9EAEC]"
                  }`}
                >
                  {chip}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={saveComment}
              className="mt-3 w-full h-9 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Save comment
            </button>

            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide mt-3.5">
              RM comments on page {page}
              {pageComments.length > 0 ? ` — ${pageComments.length}` : ""}
            </p>
            {pageComments.length === 0 ? (
              <p className="text-[13px] text-[#6B7280] mt-1">No comments on this page yet.</p>
            ) : (
              <div className="mt-2 flex flex-col gap-2.5">
                {pageComments.map((item, index) => (
                  <div
                    key={`${item.at}-${index}`}
                    className="rounded-xl bg-[#FAFAFB] border border-black/6 px-3 py-2.5"
                  >
                    <p className="text-[12px] text-[#6B7280]">
                      {item.by} · {item.at}
                    </p>
                    <p className="text-[12.5px] text-[#111] mt-1 leading-relaxed">{item.text}</p>
                    {item.tag && (
                      <span className="inline-flex mt-2 text-[11px] font-medium text-[#4B5563] bg-white border border-black/8 rounded-full px-2.5 py-0.5">
                        {item.tag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
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
        <span className="text-[13px] text-[#6B7280]">
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
        <h3 className="text-[14px] font-bold text-[#111] flex items-center gap-2.5 min-w-0">
          <span className="size-7 rounded-full bg-[#F3E8F0] text-[#7A0A17] grid place-items-center shrink-0 text-[11px] font-bold">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="truncate">{label}</span>
        </h3>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[13px] text-[#6B7280]">{captured} captured</span>
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
          {entries.map((entry, i) => (
            <div key={`${entry.label}-${i}`}>
              <p className="text-[12.5px] text-[#6B7280]">{entry.label}</p>
              <p className="text-[13px] font-semibold text-[#111] mt-0.5 break-words">{entry.value}</p>
            </div>
          ))}
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
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-x-5 gap-y-3 px-5 py-4"
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

          <ClientRecordDetailTables values={values} empty={empty} />
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

