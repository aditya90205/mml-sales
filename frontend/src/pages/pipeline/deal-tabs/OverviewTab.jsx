import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  Copy,
  Download,
  History,
  Mic,
  Paperclip,
  Plus,
  RefreshCw,
  Send,
  Star,
  Video,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import ChecklistCheck from "../../../components/common/ChecklistCheck";
import { SortableTh, useTableSort } from "../../../components/common/useTableSort.jsx";
import TabHeaderButton from "../../../components/pipeline/TabHeaderButton";
import Modal from "../../../components/ui/Modal";

const SLA_STATUS_STYLES = {
  "Within SLA":         { color: "#16A34A", bg: "#E7F8EF" },
  "Breached":            { color: "#E8395B", bg: "#FDECEE" },
  "Breached - escalated": { color: "#E8395B", bg: "#FDECEE" },
};

const RM_FLAG_TONES = {
  amber: { color: "#F59E0B", bg: "#FFF3E4" },
  red:   { color: "#E8395B", bg: "#FDECEE" },
  blue:  { color: "#3B82F6", bg: "#E8F2FE" },
};

const TEMPERATURE_TONES = {
  Hot:  { color: "#E8395B", bg: "#FDECEE" },
  Warm: { color: "#F59E0B", bg: "#FFF3E4" },
  Cold: { color: "#3B82F6", bg: "#E8F2FE" },
  Lost: { color: "#7A0A17", bg: "#FCF5F6" },
};

const AI_ACTIONS = [
  { label: "Create",   icon: Plus,      color: "#16A34A" },
  { label: "Refresh",  icon: RefreshCw, color: "#3B82F6" },
  { label: "History",  icon: History,   color: "#F59E0B" },
  { label: "Activity", icon: Activity,  color: "#E8395B" },
];

/** Conversation starter tabs on Overview (chip style — different from Dashboard rows). */
const AI_CONVERSATION_TABS = [
  "Today's Priority",
  "Summary of the month",
  "Tomorrow Meetings",
  "Yesterday Feedbacks",
];

/** Same priority bullets + hyperlinks as the dashboard personal assistant. */
const PRIORITY_ITEMS = [
  {
    parts: [
      { text: "5 high-value leads waiting for " },
      { text: "follow-up", to: "/pipeline" },
    ],
  },
  {
    parts: [
      { text: "₹18,400 in discount approvals pending for " },
      { text: "Vivek Sharma", to: "/pipeline?openLead=p4-1&tab=discounts" },
      { text: ", " },
      { text: "Rohit Sharma", to: "/pipeline?openLead=p5-1&tab=discounts" },
      { text: " and " },
      { text: "Virat Sharma", to: "/pipeline?openLead=p6-1&tab=discounts" },
    ],
  },
  {
    parts: [
      { text: "2 client profiles awaiting completion before their " },
      { text: "meetings", to: "/calendar" },
    ],
  },
  {
    parts: [
      { text: "You're at 74% of this month, and your " },
      { text: "incentive", to: "/hrms?tab=Incentives" },
      { text: " payout this month." },
    ],
  },
  {
    parts: [
      { text: "1 urgent " },
      { text: "complaint", to: "/reviews" },
      { text: " flagged — needs a same-day response" },
    ],
  },
  {
    parts: [
      { text: "AI recommends contacting " },
      { text: "Vivek Sharma", to: "/pipeline?openLead=p4-1" },
      { text: " and " },
      { text: "Priya Raheja", to: "/pipeline?openLead=p4-2" },
      { text: " today — both are close to closing" },
    ],
  },
];

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
      <p className="text-[13px] font-semibold text-[#111] mt-1">{value || "-"}</p>
    </div>
  );
}

function MeetingField({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
      <p className="text-[13px] font-semibold text-[#111] mt-1 flex items-center gap-1.5">
        <Video size={13} className="text-[#3B82F6] shrink-0" />
        {value || "-"}
      </p>
    </div>
  );
}

function WinLossReasonsField({ label, value, tone }) {
  const toneStyle = TEMPERATURE_TONES[tone] || TEMPERATURE_TONES.Cold;
  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
          style={{ color: toneStyle.color, backgroundColor: toneStyle.bg }}
        >
          {tone}
        </span>
      </div>
      <p className="text-[13px] font-semibold text-[#111] mt-1">{value || "-"}</p>
    </div>
  );
}

function DiscussionField({ label, at, note, urgency, onFollowUp }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
        {urgency && <span className="text-[11px] font-bold text-[#E8395B] shrink-0">{urgency}</span>}
      </div>
      <p className="text-[13px] font-semibold text-[#111] mt-1">{at || "-"}</p>
      {note && <p className="text-[12px] text-[#4B5563] mt-0.5">{note}</p>}
      {onFollowUp && (
        <button
          type="button"
          onClick={onFollowUp}
          className="text-[11.5px] font-semibold text-[#2563EB] hover:underline mt-1"
        >
          Follow up History
        </button>
      )}
    </div>
  );
}

const FIELD =
  "w-full border border-black/12 rounded-xl px-3.5 py-2.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]";

const EDIT_FIELDS = [
  { key: "dealCode", label: "Deal code" },
  { key: "stageLabel", label: "Stage" },
  { key: "packageInterest", label: "Package interest" },
  { key: "premium", label: "Premium client", type: "select", options: ["Yes", "No"] },
  { key: "dealValue", label: "Deal value" },
  { key: "leadSource", label: "Lead source" },
  { key: "leadScore", label: "Lead score" },
  { key: "enquiryBy", label: "Enquiry made by" },
  { key: "lookingFor", label: "Looking for" },
  { key: "areaOfHouse", label: "Area of house" },
  { key: "profession", label: "Profession" },
  { key: "familyIncomeBand", label: "Family income band" },
  { key: "nextMeeting", label: "Next schedule meeting" },
  { key: "winLossReasons", label: "Win / loss analysis - reasons", full: true },
  { key: "winLossTone", label: "Win / loss tone", type: "select", options: ["Hot", "Warm", "Cold", "Lost"] },
  { key: "lastDiscussionAt", label: "Last discussion (date / time)" },
  { key: "lastDiscussionNote", label: "Last discussion note", full: true },
  { key: "nextActionAt", label: "Next action (date / time)" },
  { key: "nextAction", label: "Next action note", full: true },
  { key: "nextActionUrgency", label: "Next action urgency" },
];

function detailsFromDeal(deal) {
  return {
    dealCode: deal.dealCode || "",
    stageLabel: deal.stageLabel || "",
    packageInterest: deal.packageInterest || "",
    premium: deal.premium ? "Yes" : "No",
    dealValue: deal.dealValue || "",
    leadSource: deal.leadSource || "",
    leadScore: deal.leadScore || "",
    enquiryBy: deal.enquiryBy || "",
    lookingFor: deal.lookingFor || "",
    areaOfHouse: deal.areaOfHouse || "",
    profession: deal.profession || "",
    familyIncomeBand: deal.familyIncomeBand || "",
    nextMeeting: deal.nextMeeting || "",
    winLossReasons: deal.winLossReasons || "",
    winLossTone: deal.winLossTone || "Cold",
    lastDiscussionAt: deal.lastDiscussionAt || "",
    lastDiscussionNote: deal.lastDiscussionNote || "",
    nextActionAt: deal.nextActionAt || "",
    nextAction: deal.nextAction || "",
    nextActionUrgency: deal.nextActionUrgency || "",
  };
}

function DealDetailsCard({ deal, onPremiumChange }) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(() => detailsFromDeal(deal));
  const [draft, setDraft] = useState(() => detailsFromDeal(deal));

  useEffect(() => {
    const next = detailsFromDeal(deal);
    setDetails(next);
    if (!open) setDraft(next);
  }, [deal]); // eslint-disable-line react-hooks/exhaustive-deps

  const openModal = () => {
    setDraft(details);
    setOpen(true);
  };

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setDetails(draft);
    onPremiumChange?.(draft.premium === "Yes");
    toast.success("Deal details updated.");
    setOpen(false);
  };

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0 flex-1 flex-wrap">
          <h3 className="text-[14px] font-bold text-[#111] shrink-0">Deal details</h3>
          <p className="text-[11.5px] text-[#9CA3AF] bg-[#FAFAFB] border border-black/6 rounded-xl px-3 py-1.5 leading-snug max-w-full">
            {deal.fieldsFilledNote ||
              "0 of 14 mandatory fields filled. please fill/edit all the details to move to P1"}
          </p>
        </div>
        <TabHeaderButton onClick={openModal}>Edit details</TabHeaderButton>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Edit details"
        subtitle="Update deal fields for this client"
        width="max-w-3xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-deal-form"
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Save
            </button>
          </>
        }
      >
        <form id="edit-deal-form" onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {EDIT_FIELDS.map((field) => (
            <div key={field.key} className={field.full ? "sm:col-span-2" : ""}>
              <label className="block text-[13px] font-bold text-[#111] mb-1.5">{field.label}</label>
              {field.type === "select" ? (
                <select
                  value={draft[field.key]}
                  onChange={(e) => setField(field.key, e.target.value)}
                  className={FIELD}
                >
                  {field.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.full ? (
                <textarea
                  value={draft[field.key]}
                  onChange={(e) => setField(field.key, e.target.value)}
                  rows={2}
                  className={`${FIELD} resize-none`}
                />
              ) : (
                <input
                  value={draft[field.key]}
                  onChange={(e) => setField(field.key, e.target.value)}
                  className={FIELD}
                />
              )}
            </div>
          ))}
        </form>
      </Modal>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
        <DetailField label="Deal code" value={details.dealCode} />
        <DetailField label="Stage" value={details.stageLabel} />
        <DetailField label="Package interest" value={details.packageInterest} />
        <div>
          <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">Premium client</p>
          <div className="mt-1 flex items-center gap-1.5 min-h-[20px]">
            {details.premium === "Yes" ? (
              <Star size={14} className="text-[#F59E0B]" fill="#F59E0B" strokeWidth={0} />
            ) : (
              <p className="text-[13px] font-semibold text-[#111]">-</p>
            )}
          </div>
        </div>
        <DetailField label="Deal value" value={details.dealValue} />
        <DetailField label="Lead source" value={details.leadSource} />
        <DetailField label="Lead score" value={details.leadScore} />
        <DetailField label="Enquiry made by" value={details.enquiryBy} />
        <DetailField label="Looking for" value={details.lookingFor} />
        <DetailField label="Area of house" value={details.areaOfHouse} />
        <DetailField label="Profession" value={details.profession} />
        <DetailField label="Family income band" value={details.familyIncomeBand} />
        <MeetingField label="Next schedule meeting" value={details.nextMeeting} />
        <WinLossReasonsField label="Win / loss analysis - reasons" value={details.winLossReasons} tone={details.winLossTone} />
        <DiscussionField
          label="Last discussion"
          at={details.lastDiscussionAt}
          note={details.lastDiscussionNote}
          onFollowUp={() => toast.info("Follow-up history coming soon.")}
        />
        <DiscussionField
          label="Next action"
          at={details.nextActionAt}
          note={details.nextAction}
          urgency={details.nextActionUrgency}
        />
      </div>
    </div>
  );
}

function PersonalAssistantCard() {
  const [message, setMessage] = useState("");
  const [tabs, setTabs] = useState(AI_CONVERSATION_TABS);
  const [activeTab, setActiveTab] = useState("Today's Priority");

  const contentHeading = tabs.includes(activeTab) ? activeTab : tabs[0] || "Today's Priority";

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 flex flex-col gap-3.5">
      <h2 className="text-[17px] font-bold text-[#111] px-1">
        Your personal assistant - Ask anything
      </h2>

      <div className="bg-[#FAFAFB] border border-black/6 rounded-xl p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[13px] font-bold text-[#111]">Start a conversation</p>
          <div className="flex items-center gap-3 flex-wrap">
            {AI_ACTIONS.map(({ label, icon: Icon, color }) => (
              <button
                key={label}
                type="button"
                className="inline-flex items-center gap-1 text-[11px] text-[#4B5563] hover:text-[#111] transition-colors"
              >
                <Icon size={13} style={{ color }} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const isActive = tab === activeTab;
            return (
              <span
                key={tab}
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab(tab)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveTab(tab);
                  }
                }}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-2 text-[11px] rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors border ${
                  isActive
                    ? "bg-[#FDF2F3] border-[#7A0A17]/40 text-[#7A0A17] font-semibold shadow-[inset_0_-2px_0_0_#7A0A17]"
                    : "text-[#4B5563] bg-[#F1F2F4] border-transparent hover:bg-[#E9EAEC]"
                }`}
              >
                {tab}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTabs((prev) => {
                      const next = prev.filter((x) => x !== tab);
                      if (tab === activeTab && next.length) setActiveTab(next[0]);
                      return next;
                    });
                  }}
                  className={`hover:opacity-80 ${isActive ? "text-[#7A0A17]" : "text-[#6B7280] hover:text-[#111]"}`}
                  aria-label={`Remove ${tab}`}
                >
                  <X size={11} />
                </button>
              </span>
            );
          })}
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[11px] text-[#4B5563] bg-[#F1F2F4] rounded-lg px-2.5 py-1.5 hover:bg-[#E9EAEC] transition-colors"
          >
            See All <ArrowRight size={11} />
          </button>
        </div>
      </div>

      <div className="border border-black/8 rounded-xl p-4 flex flex-col gap-3">
        <h3 className="text-[15px] font-bold text-[#111]">{contentHeading}</h3>

        <ul className="flex flex-col gap-2">
          {PRIORITY_ITEMS.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#374151]">
              <span className="size-[5px] rounded-full bg-[#C9CDD4] shrink-0 mt-[7px]" />
              <span className="leading-relaxed">
                {item.parts.map((part, j) =>
                  part.to ? (
                    <Link
                      key={j}
                      to={part.to}
                      className="text-[#2563EB] underline underline-offset-2 decoration-current hover:text-[#1D4ED8]"
                    >
                      {part.text}
                    </Link>
                  ) : (
                    <span key={j}>{part.text}</span>
                  )
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="border border-black/10 rounded-xl p-3 mt-1">
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask MML anything..."
            className="w-full resize-none bg-transparent text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none"
          />
          <div className="flex items-center justify-end gap-1">
            {[Paperclip, Copy, Download, Mic].map((Icon, i) => (
              <button
                key={i}
                type="button"
                className="p-2 text-[#6B7280] hover:text-[#111] rounded-lg hover:bg-black/4 transition-colors"
              >
                <Icon size={15} strokeWidth={1.6} />
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                if (!message.trim()) {
                  toast.info("Type a question for MML first.");
                  return;
                }
                toast.success("Asked MML — response coming soon.");
                setMessage("");
              }}
              className="inline-flex items-center gap-2 ml-1.5 px-4 h-9 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Ask anything <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StageStatusHover({ row }) {
  const ref = useRef(null);
  const hideTimer = useRef(null);
  const [pos, setPos] = useState(null);
  const style = SLA_STATUS_STYLES[row.status];

  const open = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const width = 220;
    let left = r.left;
    left = Math.max(12, Math.min(left, window.innerWidth - width - 12));
    const below = r.bottom + 8;
    const placeAbove = below + 120 > window.innerHeight;
    setPos({ anchorTop: r.top, top: below, left, placeAbove, width });
  };

  const scheduleClose = () => {
    hideTimer.current = setTimeout(() => setPos(null), 120);
  };

  return (
    <span
      ref={ref}
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
      className="inline-flex cursor-default"
    >
      {style ? (
        <span
          className="inline-block text-[10.5px] font-semibold px-2 py-0.5 rounded-md"
          style={{ color: style.color, backgroundColor: style.bg }}
        >
          {row.status}
        </span>
      ) : (
        <span className="text-[12px] text-[#4B5563]">{row.status || "-"}</span>
      )}

      {pos &&
        createPortal(
          <div
            className="fixed z-[80] bg-white border border-black/10 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.14)] p-3.5"
            style={{
              width: pos.width,
              top: pos.placeAbove ? undefined : pos.top,
              bottom: pos.placeAbove ? window.innerHeight - pos.anchorTop + 8 : undefined,
              left: pos.left,
            }}
            onMouseEnter={open}
            onMouseLeave={scheduleClose}
          >
            <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-2.5">
              {row.stage}
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {[
                { label: "Entered", value: row.entered },
                { label: "Exited", value: row.exited },
                { label: "Duration", value: row.duration },
                { label: "SLA", value: row.sla },
              ].map((item) => (
                <div key={item.label} className="min-w-0">
                  <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{item.label}</p>
                  <p className="text-[12.5px] font-semibold text-[#111] mt-0.5">{item.value || "-"}</p>
                </div>
              ))}
            </div>
          </div>,
          document.body
        )}
    </span>
  );
}

function StageHistoryCard({ rows }) {
  const { sorted, sort, toggle } = useTableSort(rows, { defaultKey: "stage" });

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <h3 className="text-[14px] font-bold text-[#111]">Stage History &amp; SLA</h3>
      <p className="text-[12px] text-[#9CA3AF] mt-0.5 mb-4">Every transition is timestamped and SLA-checked</p>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-black/8">
              {[
                { label: "Stage", key: "stage" },
                { label: "Entered", key: "entered" },
                { label: "Exited", key: "exited" },
                { label: "Status", key: "status" },
              ].map((h) => (
                <SortableTh
                  key={h.key}
                  label={h.label}
                  sortKey={h.key}
                  sort={sort}
                  onSort={toggle}
                  className="px-2.5 py-2 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide"
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.stage} className="border-b border-black/5 last:border-0">
                <td className="px-2.5 py-2.5 text-[12.5px] font-semibold text-[#111] whitespace-nowrap">{row.stage}</td>
                <td className="px-2.5 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.entered}</td>
                <td className="px-2.5 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.exited}</td>
                <td className="px-2.5 py-2.5 whitespace-nowrap">
                  <StageStatusHover row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StageGateCard({ items: initialItems }) {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const toggleItem = (label) => {
    setItems((prev) => prev.map((item) => (item.label === label ? { ...item, done: !item.done } : item)));
  };

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <h3 className="text-[14px] font-bold text-[#111] mb-3.5">Stage gate</h3>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => toggleItem(item.label)}
            className="flex items-center gap-2.5 text-left cursor-pointer"
          >
            <ChecklistCheck done={item.done} />
            <span className={`text-[12.5px] ${item.done ? "text-[#111] font-medium" : "text-[#9CA3AF]"}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function WeightedValueCard({ label, value, note }) {
  return (
    <div className="bg-[#7A0A17] rounded-2xl p-5 text-white">
      <p className="text-[12px] text-white/75">{label}</p>
      <p className="text-[26px] font-bold mt-1">{value}</p>
      <p className="text-[12px] text-white/80 leading-relaxed mt-2.5">{note}</p>
    </div>
  );
}

function RmFlagsCard({ flags }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <h3 className="text-[14px] font-bold text-[#111]">RM flags</h3>
      <p className="text-[11.5px] text-[#9CA3AF] mt-0.5 mb-3.5">Visible to the service team at handover (BRD S3.10)</p>
      <div className="grid grid-cols-2 gap-2">
        {flags.map((flag, i) => {
          const empty = !flag.label || flag.label === "-";
          const tone = empty ? { color: "#9CA3AF", bg: "#F3F4F6" } : RM_FLAG_TONES[flag.tone] || RM_FLAG_TONES.amber;
          return (
            <span
              key={`${flag.label}-${i}`}
              className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg text-center"
              style={{ color: tone.color, backgroundColor: tone.bg }}
            >
              {flag.label || "-"}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Overview: deal details + dashboard AI form on the left;
 * stage gate, weighted value, RM flags, and Stage History & SLA on the right.
 */
export default function OverviewTab({ deal, onPremiumChange }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)] gap-5 items-start">
      <div className="flex flex-col gap-5 min-w-0">
        <DealDetailsCard deal={deal} onPremiumChange={onPremiumChange} />
        <PersonalAssistantCard />
      </div>

      <div className="flex flex-col gap-5 min-w-0">
        <StageGateCard items={deal.stageGate} />
        <WeightedValueCard
          label={deal.weightedValueLabel}
          value={deal.weightedValue}
          note={deal.weightedValueNote}
        />
        <RmFlagsCard flags={deal.rmFlags} />
        <StageHistoryCard rows={deal.stageHistory} />
      </div>
    </div>
  );
}
