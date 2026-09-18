import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Ban,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  FileText,
  Globe,
  Handshake,
  Hash,
  Heart,
  IndianRupee,
  Layers,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Send,
  Star,
  User,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import { toast } from "react-toastify";
import ChecklistCheck from "../../../components/common/ChecklistCheck";
import { SortableTh, useTableSort } from "../../../components/common/useTableSort.jsx";
import TabHeaderButton from "../../../components/pipeline/TabHeaderButton";
import Modal from "../../../components/ui/Modal";
import LeadActivityHistory from "./LeadActivityHistory";
import { recordLeadActivity } from "../../../utils/leadActivityStore.js";
import {
  coerceCreateLeadValue,
  formatLookingForLabel,
  formatYesNoLabel,
  isLookingToggleValue,
  LEAD_INCOME_BANDS,
  LEAD_OCCUPATIONS,
  LEAD_RELATIONS,
  splitName,
} from "../../../utils/leadFields.js";

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

function toIsoDate(value) {
  const raw = String(value || "").trim();
  if (!raw || raw === "-") return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const slash = raw.match(/^(\d{1,2})[/. -](\d{1,2})[/. -](\d{4})$/);
  if (slash) {
    return `${slash[3]}-${slash[2].padStart(2, "0")}-${slash[1].padStart(2, "0")}`;
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return "";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDob(value) {
  const iso = toIsoDate(value);
  if (!iso) return value && value !== "-" ? value : "";
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  if (Number.isNaN(dt.getTime())) return value;
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function viewInitials(name = "") {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ViewField({ icon: Icon, label, value, children, full }) {
  return (
    <div className={`flex items-start gap-2.5 min-w-0 ${full ? "sm:col-span-2" : ""}`}>
      {Icon ? (
        <span className="size-8 rounded-xl bg-[#FCF5F6] text-[#7A0A17] grid place-items-center shrink-0 mt-0.5">
          <Icon size={14} />
        </span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
        {children || (
          <p className="text-[13px] font-semibold text-[#111] mt-1 break-words leading-snug">{value || "-"}</p>
        )}
      </div>
    </div>
  );
}

function ViewPill({ children, color = "#7A0A17", bg = "#FCF5F6" }) {
  if (!children) return <p className="text-[13px] font-semibold text-[#111] mt-1">-</p>;
  return (
    <span
      className="inline-flex mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
      style={{ color, backgroundColor: bg }}
    >
      {children}
    </span>
  );
}

function AssignedView({ label, name }) {
  const text = String(name || "").trim();
  return (
    <ViewField icon={User} label={label}>
      {text ? (
        <div className="flex items-center gap-2 mt-1 min-w-0">
          <span className="size-7 rounded-full bg-[#7A0A17] text-white text-[10px] font-bold grid place-items-center shrink-0">
            {viewInitials(text) || "—"}
          </span>
          <p className="text-[13px] font-semibold text-[#111] truncate">{text}</p>
        </div>
      ) : (
        <p className="text-[13px] font-semibold text-[#111] mt-1">-</p>
      )}
    </ViewField>
  );
}

const FIELD =
  "w-full border border-black/12 rounded-xl px-3.5 py-2.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]";

const RELATIONS = LEAD_RELATIONS;
const SOURCES = [
  "Website Inquiry",
  "Referral",
  "Walk-in",
  "Campaign",
  "Instagram",
  "Google Ads",
  "Newspaper",
  "Cold Call",
  "Biodata Upload",
];
const INCOME = LEAD_INCOME_BANDS;
const OCCUPATIONS = LEAD_OCCUPATIONS;
const COUNTRIES = ["India", "USA", "UK", "Canada", "UAE", "Australia", "Singapore", "Other"];
const MEETINGS = [
  { id: "Meeting Agreed", label: "Meeting Agreed", icon: Calendar },
  { id: "Call Agreed", label: "Call Agreed", icon: Phone },
  { id: "Callback Later", label: "Callback Later", icon: Clock },
  { id: "Not Yet", label: "Not Yet", icon: Ban },
];

const DEAL_EDIT_FIELDS = [
  { key: "dealCode", label: "Deal code", readOnly: true },
  { key: "stageLabel", label: "Stage", readOnly: true },
  { key: "packageInterest", label: "Package interest" },
  { key: "premium", label: "Premium client", type: "select", options: ["Yes", "No"] },
  { key: "dealValue", label: "Deal value" },
  { key: "leadScore", label: "Lead score" },
  { key: "nextMeeting", label: "Next schedule meeting" },
  { key: "winLossReasons", label: "Win / loss analysis - reasons", full: true },
  { key: "winLossTone", label: "Win / loss tone", type: "select", options: ["Hot", "Warm", "Cold", "Lost"] },
  { key: "lastDiscussionAt", label: "Last discussion (date / time)" },
  { key: "lastDiscussionNote", label: "Last discussion note", full: true },
  { key: "nextActionAt", label: "Next action (date / time)" },
  { key: "nextAction", label: "Next action note", full: true },
  { key: "assignedTo", label: "Assigned to" },
  { key: "assignedBy", label: "Assigned by" },
];

function LookingForToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {[
        { id: "yes", label: "Groom" },
        { id: "no", label: "Bride" },
      ].map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`inline-flex items-center h-10 px-4 rounded-xl text-[13px] font-semibold border transition-colors ${
              active
                ? "bg-[#7A0A17] text-white border-[#7A0A17]"
                : "bg-white text-[#374151] border-black/12 hover:bg-[#FAFAFB]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function YesNoToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {[
        { id: "yes", label: "Yes" },
        { id: "no", label: "No" },
      ].map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`inline-flex items-center h-10 px-4 rounded-xl text-[13px] font-semibold border transition-colors ${
              active
                ? "bg-[#7A0A17] text-white border-[#7A0A17]"
                : "bg-white text-[#374151] border-black/12 hover:bg-[#FAFAFB]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function EditInput({ field, value, onChange }) {
  if (field.type === "select") {
    return (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={FIELD}>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    );
  }
  if (field.type === "date") {
    return (
      <div className="relative">
        <input
          type="date"
          value={toIsoDate(value)}
          onChange={(e) => onChange(e.target.value)}
          className={`${FIELD} pr-10 relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
        />
        <Calendar size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
      </div>
    );
  }
  if (field.full) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className={`${FIELD} resize-none`}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      readOnly={field.readOnly}
      className={`${FIELD} ${field.readOnly ? "bg-[#FAFAFB] text-[#6B7280]" : ""}`}
    />
  );
}

function namesFromDeal(deal) {
  const first = dashToEmpty(deal.firstName);
  const last = dashToEmpty(deal.lastName);
  if (first || last) return { firstName: first, lastName: last };
  return splitName(deal.name);
}

function detailsFromDeal(deal) {
  const lookingRaw = deal.lookingFor || "";
  const lookingToggle = isLookingToggleValue(lookingRaw);
  const names = namesFromDeal(deal);
  return {
    dealCode: deal.dealCode || "",
    stageLabel: deal.stageLabel || "",
    packageInterest: deal.packageInterest || "",
    premium: deal.premium === true || deal.premium === "Yes" ? "Yes" : "No",
    dealValue: dashToEmpty(deal.dealValue),
    leadSource: dashToEmpty(deal.leadSource || deal.source),
    leadScore: dashToEmpty(deal.leadScore),
    enquiryBy: dashToEmpty(deal.enquiryBy),
    firstName: names.firstName,
    lastName: names.lastName,
    lookingFor: lookingToggle ? coerceCreateLeadValue("lookingFor", lookingRaw) || "yes" : lookingRaw,
    lookingCustom: lookingToggle ? "" : lookingRaw,
    nri: (() => {
      const raw = String(deal.nri ?? "").trim().toLowerCase();
      if (!raw || raw === "-") return "";
      if (raw === "yes") return "yes";
      if (raw === "no") return "no";
      return raw;
    })(),
    country: dashToEmpty(deal.country),
    city: dashToEmpty(deal.city),
    area: dashToEmpty(deal.area || deal.areaOfHouse),
    mobile: dashToEmpty(deal.mobile || deal.phone),
    email: dashToEmpty(deal.email),
    notes: deal.notes || "",
    dob: toIsoDate(deal.dob) || "",
    areaOfHouse: dashToEmpty(deal.areaOfHouse || deal.area),
    profession: dashToEmpty(deal.profession || deal.occupation),
    familyIncomeBand: dashToEmpty(deal.familyIncomeBand),
    meeting: dashToEmpty(deal.meeting),
    nextMeeting: dashToEmpty(deal.nextMeeting),
    winLossReasons: dashToEmpty(deal.winLossReasons),
    winLossTone: deal.winLossTone || "Cold",
    lastDiscussionAt: dashToEmpty(deal.lastDiscussionAt),
    lastDiscussionNote: dashToEmpty(deal.lastDiscussionNote),
    nextActionAt: dashToEmpty(deal.nextActionAt),
    nextAction: dashToEmpty(deal.nextAction),
    nextActionUrgency: deal.nextActionUrgency || "",
    assignedTo: dashToEmpty(deal.assignedTo),
    assignedBy: dashToEmpty(deal.assignedBy),
  };
}

function dashToEmpty(value) {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "-" || raw === "—") return "";
  return String(value);
}

function SendFormModal({ open, onClose, deal, currentStage }) {
  const [channel, setChannel] = useState("email");
  const email = String(deal.email || "").trim();
  const mobile = String(deal.mobile || deal.phone || "").trim();
  const to = channel === "email" ? email : mobile;
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setChannel(email && email !== "—" ? "email" : "whatsapp");
    setMessage(
      `Hi ${deal.name || "there"}, please fill your MML profile form so we can complete your record.`
    );
  }, [open, deal.name, email]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!to || to === "—") {
      toast.error(channel === "email" ? "This client has no email yet." : "This client has no mobile yet.");
      return;
    }
    recordLeadActivity(deal, currentStage, {
      type: "details",
      title: "Profile form sent to client",
      detail: channel === "email" ? `Email · ${to}` : `WhatsApp · ${to}`,
    });
    toast.success(
      channel === "email"
        ? `Profile form sent to ${deal.name || "client"} by email.`
        : `Profile form sent to ${deal.name || "client"} on WhatsApp.`
    );
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send form"
      subtitle="Share the Profile Create form with this client"
      icon={<Send size={18} />}
      iconBg="#FDF2F3"
      iconColor="#7A0A17"
      width="max-w-lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="send-profile-form"
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            <Send size={14} />
            Send form
          </button>
        </>
      }
    >
      <form id="send-profile-form" onSubmit={handleSend} className="flex flex-col gap-4">
        <div>
          <p className="text-[13px] font-bold text-[#111] mb-1.5">Channel</p>
          <div className="flex items-center gap-2">
            {[
              { id: "email", label: "Email", icon: Mail },
              { id: "whatsapp", label: "WhatsApp", icon: Send },
            ].map((opt) => {
              const active = channel === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setChannel(opt.id)}
                  className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-[13px] font-semibold border transition-colors ${
                    active
                      ? "bg-[#7A0A17] text-white border-[#7A0A17]"
                      : "bg-white text-[#374151] border-black/12 hover:bg-[#FAFAFB]"
                  }`}
                >
                  <Icon size={14} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">
            {channel === "email" ? "Email" : "Mobile"}
          </label>
          <input value={to && to !== "—" ? to : ""} readOnly className={`${FIELD} bg-[#FAFAFB]`} />
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className={`${FIELD} resize-none`}
          />
        </div>
      </form>
    </Modal>
  );
}

function DealDetailsCard({ deal, currentStage, onPremiumChange, onDetailsSaved }) {
  const [open, setOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
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

  const lookingToggle = isLookingToggleValue(details.lookingCustom || details.lookingFor);
  const lookingLabel = formatLookingForLabel(details.lookingCustom || details.lookingFor) || details.lookingFor;

  const handleSave = (e) => {
    e.preventDefault();
    const lookingFor = lookingToggle
      ? draft.lookingFor
      : (draft.lookingCustom || draft.lookingFor);
    const firstName = String(draft.firstName || "").trim();
    const lastName = String(draft.lastName || "").trim();
    const next = {
      ...draft,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.replace(/\s+/g, " ").trim(),
      lookingFor,
      areaOfHouse: draft.area || draft.areaOfHouse,
      area: draft.area || draft.areaOfHouse,
      country: draft.nri === "no" ? "India" : draft.country,
      stageLabel: currentStage === "P0" ? "P0 Contacted" : draft.stageLabel,
    };
    setDetails(next);
    onPremiumChange?.(next.premium === "Yes");
    onDetailsSaved?.(next);
    if (currentStage !== "P0") {
      toast.success("Deal details updated.");
    }
    setOpen(false);
  };

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0 flex-1 flex-wrap">
          <h3 className="text-[14px] font-bold text-[#111] shrink-0">Deal details</h3>
          <p className="text-[11.5px] text-[#9CA3AF] bg-[#FAFAFB] border border-black/6 rounded-xl px-3 py-1.5 leading-snug max-w-full">
            {deal.fieldsFilledNote ||
              "0 of 17 mandatory fields filled. please fill/edit all the details to move to Contacted"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <TabHeaderButton onClick={() => setSendOpen(true)}>Send form</TabHeaderButton>
          <TabHeaderButton onClick={openModal}>Edit details</TabHeaderButton>
        </div>
      </div>
      <SendFormModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        deal={deal}
        currentStage={currentStage}
      />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Deal Details"
        subtitle="View and manage complete deal information"
        icon={<Handshake size={18} />}
        iconBg="#FDF2F3"
        iconColor="#7A0A17"
        width="max-w-5xl"
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
              Save changes
            </button>
          </>
        }
      >
        <form id="edit-deal-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="rounded-2xl border border-black/8 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#FCF5F6] border-b border-[#7A0A17]/10">
              <User size={15} className="text-[#7A0A17]" />
              <h3 className="text-[13px] font-bold text-[#7A0A17]">Personal Details</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">
                  Looking for a bride or groom <span className="text-[#E8395B]">*</span>
                </label>
                {isLookingToggleValue(draft.lookingCustom || draft.lookingFor) ? (
                  <LookingForToggle value={draft.lookingFor === "no" ? "no" : "yes"} onChange={(value) => setField("lookingFor", value)} />
                ) : (
                  <input
                    value={draft.lookingCustom || draft.lookingFor}
                    onChange={(e) => setField("lookingCustom", e.target.value)}
                    className={FIELD}
                  />
                )}
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">
                  NRI <span className="text-[#E8395B]">*</span>
                </label>
                <YesNoToggle
                  value={draft.nri === "yes" ? "yes" : "no"}
                  onChange={(value) => {
                    setDraft((prev) => ({
                      ...prev,
                      nri: value,
                      country: value === "no" ? "India" : prev.country,
                    }));
                  }}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">
                  Enquiry made by <span className="text-[#E8395B]">*</span>
                </label>
                <select value={draft.enquiryBy || "Self"} onChange={(e) => setField("enquiryBy", e.target.value)} className={FIELD}>
                  {(RELATIONS.includes(draft.enquiryBy) || !draft.enquiryBy ? RELATIONS : [draft.enquiryBy, ...RELATIONS]).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">
                  First name <span className="text-[#E8395B]">*</span>
                </label>
                <input
                  value={draft.firstName || ""}
                  onChange={(e) => setField("firstName", e.target.value)}
                  placeholder="Kabir"
                  className={FIELD}
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">
                  Last name <span className="text-[#E8395B]">*</span>
                </label>
                <input
                  value={draft.lastName || ""}
                  onChange={(e) => setField("lastName", e.target.value)}
                  placeholder="Vaidya"
                  className={FIELD}
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">Date of birth</label>
                <EditInput field={{ type: "date" }} value={draft.dob} onChange={(value) => setField("dob", value)} />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">Profession</label>
                <select
                  value={draft.profession || ""}
                  onChange={(e) => setField("profession", e.target.value)}
                  className={FIELD}
                >
                  <option value="">Select profession</option>
                  {(OCCUPATIONS.includes(draft.profession) || !draft.profession ? OCCUPATIONS : [draft.profession, ...OCCUPATIONS]).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">Mobile number</label>
                <input value={draft.mobile} onChange={(e) => setField("mobile", e.target.value)} className={FIELD} />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">Email</label>
                <input type="email" value={draft.email} onChange={(e) => setField("email", e.target.value)} className={FIELD} />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">
                  Country <span className="text-[#E8395B]">*</span>
                </label>
                <select
                  value={draft.nri === "no" ? "India" : draft.country || "India"}
                  onChange={(e) => setField("country", e.target.value)}
                  disabled={draft.nri === "no"}
                  className={`${FIELD} ${draft.nri === "no" ? "bg-[#FAFAFB] text-[#6B7280]" : ""}`}
                >
                  {(draft.nri === "yes" ? COUNTRIES : ["India"]).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">
                  City <span className="text-[#E8395B]">*</span>
                </label>
                <input value={draft.city} onChange={(e) => setField("city", e.target.value)} placeholder="Mumbai, Maharashtra" className={FIELD} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">Area / Locality</label>
                <input value={draft.area} onChange={(e) => setField("area", e.target.value)} placeholder="Andheri West" className={FIELD} />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">Family income bracket</label>
                <select
                  value={draft.familyIncomeBand || ""}
                  onChange={(e) => setField("familyIncomeBand", e.target.value)}
                  className={FIELD}
                >
                  <option value="">Select income</option>
                  {(INCOME.includes(draft.familyIncomeBand) || !draft.familyIncomeBand ? INCOME : [draft.familyIncomeBand, ...INCOME]).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">
                  Source <span className="text-[#E8395B]">*</span>
                </label>
                <select
                  value={draft.leadSource || ""}
                  onChange={(e) => setField("leadSource", e.target.value)}
                  className={FIELD}
                >
                  <option value="">Select source</option>
                  {(SOURCES.includes(draft.leadSource) || !draft.leadSource ? SOURCES : [draft.leadSource, ...SOURCES]).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">
                  Agree to a meeting or call <span className="text-[#E8395B]">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {MEETINGS.map(({ id, label, icon: Icon }) => {
                    const active = draft.meeting === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setField("meeting", id)}
                        className={`inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-[12.5px] font-semibold border transition-colors ${
                          active
                            ? "bg-[#7A0A17] text-white border-[#7A0A17]"
                            : "bg-white text-[#4B5563] border-black/12 hover:bg-[#FAFAFB]"
                        }`}
                      >
                        <Icon size={14} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[13px] font-bold text-[#111] mb-1.5">Additional notes</label>
                <textarea
                  value={draft.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  rows={3}
                  className={`${FIELD} resize-none`}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-black/8 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#FCF5F6] border-b border-[#7A0A17]/10">
              <Handshake size={15} className="text-[#7A0A17]" />
              <h3 className="text-[13px] font-bold text-[#7A0A17]">Deal Information</h3>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEAL_EDIT_FIELDS.map((field) => (
                <div key={field.key} className={field.full ? "sm:col-span-2" : ""}>
                  <label className="block text-[13px] font-bold text-[#111] mb-1.5">{field.label}</label>
                  <EditInput field={field} value={draft[field.key] || ""} onChange={(value) => setField(field.key, value)} />
                </div>
              ))}
            </div>
          </section>
        </form>
      </Modal>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-black/8 overflow-hidden bg-white shadow-[0_8px_24px_rgba(122,10,23,0.04)]">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#FCF5F6] border-b border-[#7A0A17]/10">
            <User size={15} className="text-[#7A0A17]" />
            <h3 className="text-[13px] font-bold text-[#7A0A17]">Personal Details</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <ViewField icon={Heart} label="Looking for a bride or groom">
              {lookingLabel ? (
                <ViewPill color="#7A0A17" bg="#FCF5F6">{lookingLabel}</ViewPill>
              ) : (
                <p className="text-[13px] font-semibold text-[#111] mt-1">-</p>
              )}
            </ViewField>
            <ViewField icon={Globe} label="NRI">
              {formatYesNoLabel(details.nri) ? (
                <ViewPill
                  color={details.nri === "yes" ? "#16A34A" : "#4B5563"}
                  bg={details.nri === "yes" ? "#E7F8EF" : "#F3F4F6"}
                >
                  {formatYesNoLabel(details.nri)}
                </ViewPill>
              ) : (
                <p className="text-[13px] font-semibold text-[#111] mt-1">-</p>
              )}
            </ViewField>
            <ViewField icon={Users} label="Enquiry made by" value={details.enquiryBy} />
            <ViewField icon={User} label="First name" value={details.firstName} />
            <ViewField icon={User} label="Last name" value={details.lastName} />
            <ViewField icon={Calendar} label="Date of birth" value={formatDob(details.dob)} />
            <ViewField icon={Briefcase} label="Profession" value={details.profession} />
            <ViewField icon={Phone} label="Mobile number" value={details.mobile} />
            <ViewField icon={Mail} label="Email" value={details.email} />
            <ViewField icon={Globe} label="Country" value={details.nri === "no" ? "India" : details.country} />
            <ViewField icon={Building2} label="City" value={details.city} />
            <ViewField icon={MapPin} label="Area / Locality" value={details.area || details.areaOfHouse} />
            <ViewField icon={Wallet} label="Family income bracket" value={details.familyIncomeBand} />
            <ViewField icon={Layers} label="Source" value={details.leadSource} />
            <ViewField icon={Calendar} label="Agree to a meeting or call">
              {details.meeting ? (
                <ViewPill>{details.meeting}</ViewPill>
              ) : (
                <p className="text-[13px] font-semibold text-[#111] mt-1">-</p>
              )}
            </ViewField>
            <ViewField icon={FileText} label="Additional notes" value={details.notes} full />
          </div>
        </section>

        <section className="rounded-2xl border border-black/8 overflow-hidden bg-white shadow-[0_8px_24px_rgba(122,10,23,0.04)]">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#FCF5F6] border-b border-[#7A0A17]/10">
            <Handshake size={15} className="text-[#7A0A17]" />
            <h3 className="text-[13px] font-bold text-[#7A0A17]">Deal Information</h3>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            <ViewField icon={Hash} label="Deal code" value={details.dealCode} />
            <ViewField icon={Layers} label="Stage">
              <ViewPill>{details.stageLabel}</ViewPill>
            </ViewField>
            <ViewField icon={Star} label="Package interest" value={details.packageInterest} />
            <ViewField icon={Star} label="Premium client">
              {details.premium === "Yes" ? (
                <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full text-[#16A34A] bg-[#E7F8EF]">
                  <Star size={11} fill="#16A34A" strokeWidth={0} />
                  Yes
                </span>
              ) : (
                <p className="text-[13px] font-semibold text-[#111] mt-1">-</p>
              )}
            </ViewField>
            <ViewField icon={IndianRupee} label="Deal value" value={details.dealValue} />
            <ViewField icon={Star} label="Lead score">
              {details.leadScore ? (
                <ViewPill color="#16A34A" bg="#E7F8EF">{details.leadScore}</ViewPill>
              ) : (
                <p className="text-[13px] font-semibold text-[#111] mt-1">-</p>
              )}
            </ViewField>
            <ViewField icon={Video} label="Next schedule meeting" value={details.nextMeeting} />
            <ViewField icon={MessageSquare} label="Win / loss analysis - reasons" full>
              <div className="flex items-center gap-2 flex-wrap mt-1">
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
                  style={{
                    color: (TEMPERATURE_TONES[details.winLossTone] || TEMPERATURE_TONES.Cold).color,
                    backgroundColor: (TEMPERATURE_TONES[details.winLossTone] || TEMPERATURE_TONES.Cold).bg,
                  }}
                >
                  {details.winLossTone || "Cold"}
                </span>
              </div>
              <p className="text-[13px] font-semibold text-[#111] mt-1">{details.winLossReasons || "-"}</p>
            </ViewField>
            <ViewField icon={MessageSquare} label="Last discussion">
              <p className="text-[13px] font-semibold text-[#111] mt-1">{details.lastDiscussionAt || "-"}</p>
              {details.lastDiscussionNote ? (
                <p className="text-[12px] text-[#4B5563] mt-0.5">{details.lastDiscussionNote}</p>
              ) : null}
              <button
                type="button"
                onClick={() => toast.info("Follow-up history coming soon.")}
                className="text-[11.5px] font-semibold text-[#2563EB] hover:underline mt-1"
              >
                Follow up History
              </button>
            </ViewField>
            <ViewField icon={Calendar} label="Next action">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-semibold text-[#111] mt-1">{details.nextActionAt || "-"}</p>
                {details.nextActionUrgency ? (
                  <span className="text-[11px] font-bold text-[#E8395B] shrink-0">{details.nextActionUrgency}</span>
                ) : null}
              </div>
              {details.nextAction ? (
                <p className="text-[12px] text-[#4B5563] mt-0.5">{details.nextAction}</p>
              ) : null}
            </ViewField>
            <AssignedView label="Assigned to" name={details.assignedTo} />
            <AssignedView label="Assigned by" name={details.assignedBy} />
          </div>
        </section>
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

function StageGateCard({ items: initialItems, stageKey }) {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems, stageKey]);

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
 * Overview: deal details first, then lead activity history on the left;
 * stage gate, weighted value, RM flags, and Stage History & SLA on the right.
 */
export default function OverviewTab({ deal, currentStage, onPremiumChange, onDetailsSaved }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)] gap-5 items-start">
      <div className="flex flex-col gap-5 min-w-0">
        <DealDetailsCard
          deal={deal}
          currentStage={currentStage}
          onPremiumChange={onPremiumChange}
          onDetailsSaved={onDetailsSaved}
        />
        <LeadActivityHistory lead={deal} currentStage={currentStage} />
      </div>

      <div className="flex flex-col gap-5 min-w-0">
        <StageGateCard key={currentStage || deal.stageLabel} items={deal.stageGate} stageKey={currentStage || deal.stageLabel} />
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
