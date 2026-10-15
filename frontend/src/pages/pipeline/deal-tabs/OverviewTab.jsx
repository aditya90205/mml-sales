import { useCallback, useEffect, useRef, useState } from "react";
import {
  Ban,
  Calendar,
  Clock,
  Eye,
  Handshake,
  Edit2,
  Phone,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import SendLinkModal from "../../../components/common/SendLinkModal";
import TabHeaderButton from "../../../components/pipeline/TabHeaderButton";
import {
  detailsFromDeal,
  ProfileDetailsView,
  toIsoDate,
} from "../../../components/pipeline/ProfileDetailsView";
import Modal from "../../../components/ui/Modal";
import OverviewDashboard from "./OverviewDashboard";
import { atLeast } from "./stageContent.jsx";
import LeadActivityHistory from "./LeadActivityHistory";
import {
  isLookingToggleValue,
  LEAD_INCOME_BANDS,
  LEAD_OCCUPATIONS,
  LEAD_RELATIONS,
} from "../../../utils/leadFields.js";

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

function DealDetailsCard({ deal, currentStage, onPremiumChange, onDetailsSaved, onReady, body = true }) {
  const [mode, setMode] = useState(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [details, setDetails] = useState(() => detailsFromDeal(deal));
  const [draft, setDraft] = useState(() => detailsFromDeal(deal));

  useEffect(() => {
    const next = detailsFromDeal(deal);
    setDetails(next);
    if (mode !== "edit") setDraft(next);
  }, [deal]); // eslint-disable-line react-hooks/exhaustive-deps

  const closeModal = () => setMode(null);

  const openEdit = () => {
    setDraft(details);
    setMode("edit");
  };

  useEffect(() => {
    onReady?.({
      openView: () => setMode("view"),
      openEdit,
      openSend: () => setSendOpen(true),
    });
  }, [onReady, details]); // eslint-disable-line react-hooks/exhaustive-deps

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const lookingToggle = isLookingToggleValue(details.lookingCustom || details.lookingFor);

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
    setMode(null);
  };

  return (
    <div className={body === false ? "contents" : "bg-white border border-black/8 rounded-2xl p-5"}>
      {body !== false && (
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0 flex-1 flex-wrap">
          <h3 className="text-[14px] font-bold text-[#111] shrink-0">Deal details</h3>
          <p className="text-[11.5px] text-[#9CA3AF] bg-[#FAFAFB] border border-black/6 rounded-xl px-3 py-1.5 leading-snug max-w-full">
            {deal.fieldsFilledNote ||
              "0 of 17 mandatory fields filled. please fill/edit all the details to move to Contacted"}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <TabHeaderButton onClick={() => setSendOpen(true)}>Send link</TabHeaderButton>
          <TabHeaderButton onClick={openEdit}>Edit details</TabHeaderButton>
        </div>
      </div>
      )}
      <SendLinkModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        deal={deal}
        currentStage={currentStage}
        linkTypes={
          atLeast(currentStage, "P1")
            ? ["payment", "biodata", "media", "review", "app"]
            : ["biodata", "media", "review", "app"]
        }
        initialType={atLeast(currentStage, "P1") ? "payment" : "biodata"}
        title="Send link"
        subtitle="Share a payment, biodata, video/image, Google Review, or app download link"
      />
      <Modal
        open={mode === "view"}
        onClose={closeModal}
        title="Profile"
        subtitle="Full profile details"
        icon={<Eye size={18} />}
        iconBg="#FFF6E8"
        iconColor="#C2410C"
        width="max-w-5xl"
        footer={
          <>
            <button
              type="button"
              onClick={closeModal}
              className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={openEdit}
              className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              <Edit2 size={13} />
              Edit
            </button>
          </>
        }
      >
        <ProfileDetailsView details={details} onFollowUp={() => setHistoryOpen(true)} />
      </Modal>
      <Modal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Lead History"
        width="max-w-3xl"
        zClass="z-[90]"
      >
        <LeadActivityHistory lead={deal} currentStage={currentStage} />
      </Modal>
      <Modal
        open={mode === "edit"}
        onClose={closeModal}
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
              onClick={closeModal}
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
      {body !== false ? <ProfileDetailsView details={details} onFollowUp={() => setHistoryOpen(true)} /> : null}
    </div>
  );
}

/**
 * Overview dashboard: profile, quick actions, package, next action, and activity.
 * Edit details and send-link modals stay mounted behind the cards.
 */
export default function OverviewTab({
  deal,
  currentStage,
  onPremiumChange,
  onDetailsSaved,
  onCreateTask,
  selectedPackageKey = null,
  onPackageSelect,
  onPaymentVerified,
}) {
  const actionsRef = useRef({});
  const onReady = useCallback((api) => {
    actionsRef.current = api;
  }, []);

  return (
    <>
      <DealDetailsCard
        body={false}
        deal={deal}
        currentStage={currentStage}
        onPremiumChange={onPremiumChange}
        onDetailsSaved={onDetailsSaved}
        onReady={onReady}
      />
      <OverviewDashboard
        deal={deal}
        currentStage={currentStage}
        onSend={() => actionsRef.current.openSend?.()}
        onView={() => actionsRef.current.openView?.()}
        onEdit={() => actionsRef.current.openEdit?.()}
        onCreateTask={onCreateTask}
        selectedPackageKey={selectedPackageKey}
        onPackageSelect={onPackageSelect}
        onPaymentVerified={onPaymentVerified}
      />
    </>
  );
}
