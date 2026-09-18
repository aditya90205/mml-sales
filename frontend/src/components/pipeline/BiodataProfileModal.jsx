import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Clock,
  HeartPulse,
  MoonStar,
  Trash2,
  UserPlus,
  UserRound,
  Utensils,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal.jsx";
import {
  FIELD_STATUS,
  LEAD_INCOME_BANDS,
  LEAD_OCCUPATIONS,
  LEAD_RELATIONS,
  classifyField,
  displayFieldValue,
  firstValidationMessage,
  validateCreateLeadFields,
} from "../../utils/leadFields.js";
import {
  buildBiodataIntakeSnapshots,
  intakeToLeadForm,
} from "../../utils/biodataDraftStore.js";
import { findLeadById } from "../../utils/pipelineStore.js";
import { findClientById } from "../../utils/clientsData.js";

const COUNTRIES = ["India", "USA", "UK", "Canada", "UAE", "Australia", "Singapore", "Other"];
const CITIES = [
  "Mumbai, Maharashtra",
  "Pune, Maharashtra",
  "Delhi, NCR",
  "Gurugram, Haryana",
  "Noida, Uttar Pradesh",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu",
  "Ahmedabad, Gujarat",
  "Jaipur, Rajasthan",
  "Kolkata, West Bengal",
];
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
  "Outbound Calls",
];
const MEETINGS = ["Meeting Agreed", "Call Agreed", "Callback Later", "Not Yet"];
const ZODIAC = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
];
const GAN = ["Dev", "Manushya", "Rakshas", "Ganesha"];
const NADI = ["Aadi", "Madhya", "Antya"];
const MANGLIK = ["Non Manglik", "Manglik", "Slightly Manglik", "Don't know"];
const RELIGIONS = ["Hindu", "Sikh", "Jain", "Muslim", "Christian", "Other"];
const COMMUNITY = ["General", "OBC", "SC", "ST", "Other"];
const BODY_TYPES = ["Slim", "Average", "Athletic", "Broad build", "Heavy", "Very heavy"];
const BLOOD = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const COMPLEXION = ["Very fair", "Fair", "Wheatish", "Wheatish to dark", "Dark"];
const YES_NO = ["Yes", "No"];
const DRINKING = ["Teetotaller", "Occasionally", "Regularly", "Socially", "No"];
const SMOKING = ["Non smoker", "Occasionally", "Regular", "Socially", "Hukka", "No"];
const EATING = ["Vegetarian", "Eggetarian", "Non vegetarian", "Occasionally non-veg", "Socially", "Vegan"];
const DROP_REASONS = [
  "Not interested",
  "Wrong enquiry / Never enquired",
  "Duplicate lead",
  "Invalid contact details",
  "Already registered",
  "Timing / not looking now",
  "Budget / Price",
  "Other",
];
const COUNTRY_DIAL = {
  India: "+91",
  USA: "+1",
  UK: "+44",
  Canada: "+1",
  UAE: "+971",
  Australia: "+61",
  Singapore: "+65",
  Other: "+",
};

function heightOptions() {
  const out = [];
  for (let ft = 4; ft <= 6; ft += 1) {
    for (let inch = 0; inch < 12; inch += 1) {
      if (ft === 4 && inch < 6) continue;
      out.push(`${ft} ft ${inch} in`);
    }
  }
  out.push("7 ft 0 in");
  return out;
}

function weightOptions() {
  return Array.from({ length: 101 }, (_, i) => `${40 + i} kg`);
}

const HEIGHTS = heightOptions();
const WEIGHTS = weightOptions();

const CHIP_META = {
  [FIELD_STATUS.neu]: { label: "New", className: "bg-[#EFF6FF] text-[#1D4ED8] border-[#93C5FD]" },
  [FIELD_STATUS.match]: { label: "Same", className: "bg-[#F0FDF4] text-[#15803D] border-[#86EFAC]" },
  [FIELD_STATUS.keep]: { label: "Existing", className: "bg-[#FFF7ED] text-[#C2410C] border-[#FDBA74]" },
  [FIELD_STATUS.mismatch]: { label: "Existing", className: "bg-[#FFF7ED] text-[#C2410C] border-[#FDBA74]" },
};

const SECTIONS = [
  {
    key: "basic",
    title: "Overview",
    icon: UserRound,
    fields: [
      { key: "lookingFor", label: "Looking for", required: true, type: "select", options: ["Groom", "Bride"] },
      { key: "nri", label: "NRI", required: true, type: "select", options: YES_NO },
      { key: "enquiryBy", label: "Inquiry made by", required: true, type: "select", options: LEAD_RELATIONS },
      { key: "firstName", label: "First Name", required: true, type: "text" },
      { key: "lastName", label: "Last Name", required: true, type: "text" },
      { key: "profession", label: "Profession", required: true, type: "select", options: LEAD_OCCUPATIONS },
      { key: "dob", label: "Date of Birth", required: true, type: "date" },
      { key: "country", label: "Country", required: true, type: "select", options: COUNTRIES },
      { key: "mobile", label: "Mobile Number", required: false, type: "mobile" },
      { key: "city", label: "City", required: true, type: "select", options: CITIES },
      { key: "area", label: "Area / Locality", required: true, type: "text" },
      { key: "email", label: "Email", required: false, type: "text", placeholder: "name@email.com" },
      { key: "leadSource", label: "Source", required: true, type: "select", options: SOURCES },
      { key: "familyIncomeBand", label: "Family Income Bracket", required: true, type: "select", options: LEAD_INCOME_BANDS },
      { key: "meeting", label: "Agree to a meeting or call", required: true, type: "select", options: MEETINGS },
    ],
  },
  {
    key: "astro",
    title: "Birth & Astrology",
    icon: MoonStar,
    fields: [
      { key: "placeOfBirth", label: "Place of Birth", required: true, type: "text" },
      { key: "timeOfBirth", label: "Time of Birth", required: true, type: "time" },
      { key: "zodiacSign", label: "Zodiac Sign", required: true, type: "select", options: ZODIAC },
      { key: "gotra", label: "Gotra", required: true, type: "text" },
      { key: "manglik", label: "Astrologically You Are", required: true, type: "select", options: MANGLIK },
      { key: "nakshatra", label: "Nakshatra", required: true, type: "text" },
      { key: "gan", label: "GAN", required: true, type: "select", options: GAN },
      { key: "nadi", label: "Nadi", required: true, type: "select", options: NADI },
      { key: "kundliPoints", label: "Kundli Gun Points", required: true, type: "text" },
      { key: "kundliShown", label: "Kundli Shown to Client", required: true, type: "select", options: YES_NO },
      { key: "community", label: "Community", required: true, type: "select", options: COMMUNITY },
      { key: "religion", label: "Religion", required: true, type: "select", options: RELIGIONS },
      { key: "sectCaste", label: "Caste", required: true, type: "text" },
      { key: "subCaste", label: "Sub-Caste", required: true, type: "text" },
      { key: "motherTongue", label: "Mother Tongue", required: true, type: "text" },
    ],
  },
  {
    key: "body",
    title: "Body & Health",
    icon: HeartPulse,
    fields: [
      { key: "height", label: "Height", required: true, type: "select", options: HEIGHTS },
      { key: "weight", label: "Weight", required: true, type: "select", options: WEIGHTS },
      { key: "bodyType", label: "Body Type", required: true, type: "select", options: BODY_TYPES },
      { key: "bloodGroup", label: "Blood Group", required: true, type: "select", options: BLOOD },
      { key: "complexion", label: "Complexion", required: true, type: "select", options: COMPLEXION },
      { key: "spectacles", label: "Spectacles", required: true, type: "select", options: YES_NO },
      { key: "leftEyePower", label: "Left Eye Power", required: true, type: "text" },
      { key: "rightEyePower", label: "Right Eye Power", required: true, type: "text" },
      { key: "disability", label: "Any Disability or Health Issue", required: true, type: "select", options: YES_NO },
      { key: "disabilitySpecify", label: "If Yes, Specify", type: "text", placeholder: "e.g. Back pain, diabetes etc." },
      { key: "conditionSince", label: "Condition Since", type: "date", placeholder: "e.g. 2 years" },
      { key: "underTreatment", label: "Under Treatment", type: "select", options: YES_NO },
    ],
  },
  {
    key: "habits",
    title: "Habits",
    icon: Utensils,
    columns: 3,
    fields: [
      { key: "drinking", label: "Drinking", required: true, type: "select", options: DRINKING, noteKey: "drinkingNote" },
      { key: "smoking", label: "Smoking", required: true, type: "select", options: SMOKING, noteKey: "smokingNote" },
      { key: "eating", label: "Eating", required: true, type: "select", options: EATING, noteKey: "eatingNote" },
    ],
  },
];

function isFilled(value) {
  return Boolean(value && String(value).trim() && String(value).trim() !== "-");
}

function toDateInput(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const dmy = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;
  const parsed = Date.parse(raw);
  if (!Number.isNaN(parsed)) return new Date(parsed).toISOString().slice(0, 10);
  return raw;
}

function toTimeInput(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const match = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return raw;
  let hour = Number(match[1]);
  const min = match[2];
  const mer = (match[3] || "").toUpperCase();
  if (mer === "PM" && hour < 12) hour += 12;
  if (mer === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${min}`;
}

function withCurrentOption(options, value) {
  const raw = String(value || "").trim();
  if (!raw) return options;
  if (options.some((opt) => String(opt) === raw)) return options;
  return [raw, ...options];
}

function sameValue(key, a, b) {
  return isFilled(a) && isFilled(b) && classifyField(key, a, b) === FIELD_STATUS.match;
}

function hasFieldConflict(key, imported, existing, hasExisting) {
  if (!hasExisting) return false;
  if (!isFilled(imported) || !isFilled(existing)) return false;
  return !sameValue(key, imported, existing);
}

const CONTROL_BASE = "w-full h-10 rounded-lg text-[13px] text-[#111] outline-none";
const CONTROL_OK = "bg-white border border-black/12 focus:border-[#7A0A17]/45";
const CONTROL_CONFLICT = "bg-[#FEF2F2] border-2 border-[#E8395B] focus:border-[#E8395B]";

function fieldChip(key, values, imported, existing, hasExisting) {
  const current = values[key];
  if (!isFilled(current)) return null;
  if (!hasExisting) return FIELD_STATUS.neu;
  const sameExisting = sameValue(key, current, existing[key]);
  const sameImported = sameValue(key, current, imported[key]);
  if (sameExisting && sameImported) return FIELD_STATUS.match;
  if (sameExisting) return FIELD_STATUS.keep;
  if (sameImported) return FIELD_STATUS.neu;
  if (isFilled(existing[key])) return FIELD_STATUS.mismatch;
  return FIELD_STATUS.neu;
}

function formatHintValue(key, value) {
  if (!isFilled(value)) return "";
  if (key === "lookingFor" || key === "mobile") return displayFieldValue(key, value);
  if (key === "dob") {
    const iso = toDateInput(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const [year, month, day] = iso.split("-");
      return `${day}-${month}-${year}`;
    }
  }
  return String(value).trim();
}

function FieldHint({ fieldKey, current, imported, existing, hasExisting, onKeep, onUseImported }) {
  if (!hasExisting) return null;
  const existingLabel = formatHintValue(fieldKey, existing);
  const importedLabel = formatHintValue(fieldKey, imported);
  const sameExisting = sameValue(fieldKey, current, existing);
  const sameImported = sameValue(fieldKey, current, imported);
  const showExisting = isFilled(existing) && !sameExisting;
  const showImported = isFilled(imported) && !sameImported && sameExisting;
  if (!showExisting && !showImported) return null;

  return (
    <div className="mt-1 flex flex-col gap-0.5 min-w-0">
      {showExisting ? (
        <p className="text-[10.5px] text-[#C2410C] leading-snug truncate" title={existingLabel}>
          Existing: <span className="font-semibold">{existingLabel}</span>
        </p>
      ) : null}
      {showImported ? (
        <p className="text-[10.5px] text-[#1D4ED8] leading-snug truncate" title={importedLabel}>
          Biodata: <span className="font-semibold">{importedLabel}</span>
        </p>
      ) : null}
      <div className="flex items-center gap-1.5">
        {showExisting ? (
          <button
            type="button"
            onClick={onKeep}
            className="text-[10px] font-semibold text-[#C2410C] hover:underline underline-offset-2"
          >
            Keep existing
          </button>
        ) : null}
        {showImported ? (
          <button
            type="button"
            onClick={onUseImported}
            className="text-[10px] font-semibold text-[#1D4ED8] hover:underline underline-offset-2"
          >
            Use biodata
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CompactSelect({ value, onChange, options, disabled = false, conflict = false }) {
  const list = withCurrentOption(options, value);
  return (
    <div className="relative">
      <select
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${CONTROL_BASE} pl-3 pr-8 appearance-none ${
          conflict ? CONTROL_CONFLICT : CONTROL_OK
        } ${disabled ? "bg-[#F7F7F8] text-[#6B7280] cursor-not-allowed" : "cursor-pointer"}`}
      >
        <option value="">Select</option>
        {list.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
    </div>
  );
}

function FieldShell({ label, required, chip, hint, children }) {
  const meta = chip ? CHIP_META[chip] : null;
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <div className="flex items-center justify-between gap-2 min-h-[18px]">
        <label className="text-[12px] font-medium text-[#374151] truncate">
          {label}
          {required ? <span className="text-[#E8395B]"> *</span> : null}
        </label>
        {meta ? (
          <span className={`inline-flex items-center h-[18px] px-1.5 rounded-md border text-[10px] font-semibold shrink-0 ${meta.className}`}>
            {meta.label}
          </span>
        ) : null}
      </div>
      {children}
      {hint}
    </div>
  );
}

function DropProfileConfirm({ reason, onReasonChange, error, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-md" onClick={onCancel} aria-hidden />
      <div className="relative z-10 w-full max-w-[400px] bg-white rounded-2xl shadow-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="size-9 rounded-full bg-[#FCE8EC] text-[#7A0A17] grid place-items-center shrink-0">
              <Trash2 size={16} />
            </span>
            <h3 className="text-[16px] font-bold text-[#111]">Drop Profile</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="size-8 grid place-items-center rounded-lg text-[#6B7280] hover:bg-black/5"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <p className="text-[13.5px] font-semibold text-[#111]">Drop this biodata profile without saving?</p>
        <p className="text-[12.5px] text-[#9CA3AF] mt-1 leading-relaxed">
          Nothing will be created. Extra details will not go to Profile Create (P2).
        </p>
        <div className="mt-4">
          <label className="block text-[13px] font-semibold text-[#111] mb-1.5">Reason for dropping</label>
          <CompactSelect value={reason} onChange={onReasonChange} options={DROP_REASONS} />
          {error ? <p className="text-[12px] font-semibold text-[#E8395B] mt-1.5">{error}</p> : null}
        </div>
        <div className="flex items-center justify-end gap-2.5 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712]"
          >
            <Trash2 size={14} />
            Drop Profile
          </button>
        </div>
      </div>
    </div>
  );
}

function seedValues(initial) {
  const isNew = initial?.mode === "create" || !initial?.existingLeadId;
  const existingLead = !isNew && initial?.existingLeadId
    ? findLeadById(initial.existingLeadId)?.lead
    : null;
  const client = !isNew && initial?.clientId ? findClientById(initial.clientId) : null;
  return buildBiodataIntakeSnapshots(initial || {}, existingLead, { client });
}

export default function BiodataProfileModal({ open, onClose, onSave, initial = null }) {
  const [{ imported, existing, values: seed }] = useState(() => seedValues(initial));
  const [values, setValues] = useState(seed);
  const [openSections, setOpenSections] = useState(() => new Set(SECTIONS.map((s) => s.key)));
  const [error, setError] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const [dropReason, setDropReason] = useState("");
  const [dropError, setDropError] = useState("");

  const hasExisting = useMemo(
    () => initial?.mode !== "create" && Boolean(initial?.existingLeadId || initial?.mode === "update"),
    [initial]
  );

  const setField = (key, value) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "nri" && String(value).toLowerCase() === "no") next.country = "India";
      if (key === "lookingFor") {
        next.gender = value === "Groom" ? "Female" : value === "Bride" ? "Male" : prev.gender;
      }
      return next;
    });
    setError("");
  };

  const keepExisting = (key) => {
    if (!isFilled(existing[key])) return;
    setField(key, existing[key]);
  };

  const applyImported = (key) => {
    if (!isFilled(imported[key])) return;
    setField(key, imported[key]);
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const nriNo = String(values.nri || "").toLowerCase() === "no";
  const dial = COUNTRY_DIAL[nriNo ? "India" : values.country] || "+91";

  const submit = () => {
    const lead = intakeToLeadForm(values, {
      fileName: initial?.fileName || "",
      alsoRead: initial?.alsoRead,
      intake: initial?.intake,
      existingLeadId: initial?.existingLeadId,
      clientId: initial?.clientId,
      mode: initial?.existingLeadId || initial?.mode === "update" ? "update" : "create",
    });
    const msg = firstValidationMessage(validateCreateLeadFields(lead, { requireContact: false }));
    if (msg) {
      setError(msg);
      return;
    }
    onSave?.(lead);
  };

  const confirmDrop = () => {
    if (!dropReason) {
      setDropError("Select a reason for dropping.");
      return;
    }
    const name = [values.firstName, values.lastName].filter(Boolean).join(" ").trim();
    toast.info(name ? `Profile "${name}" dropped.` : "Profile dropped.");
    setDropOpen(false);
    onClose?.();
  };

  const renderControl = (field, conflict) => {
    const value = values[field.key] || "";
    const pickerClass =
      "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer";
    if (field.type === "select") {
      return (
        <CompactSelect
          value={value}
          onChange={(next) => setField(field.key, next)}
          options={field.options || []}
          disabled={field.key === "country" && nriNo}
          conflict={conflict}
        />
      );
    }
    if (field.type === "date") {
      return (
        <div className="relative">
          <input
            type="date"
            value={toDateInput(value)}
            onChange={(e) => setField(field.key, e.target.value)}
            className={`${CONTROL_BASE} pl-3 pr-9 ${conflict ? CONTROL_CONFLICT : CONTROL_OK} ${pickerClass}`}
          />
          <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>
      );
    }
    if (field.type === "time") {
      return (
        <div className="relative">
          <input
            type="time"
            value={toTimeInput(value)}
            onChange={(e) => setField(field.key, e.target.value)}
            className={`${CONTROL_BASE} pl-3 pr-9 ${conflict ? CONTROL_CONFLICT : CONTROL_OK} ${pickerClass}`}
          />
          <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
        </div>
      );
    }
    if (field.type === "mobile") {
      return (
        <div
          className={`flex h-10 rounded-lg overflow-hidden ${
            conflict
              ? "border-2 border-[#E8395B] bg-[#FEF2F2] focus-within:border-[#E8395B]"
              : "border border-black/12 focus-within:border-[#7A0A17]/45"
          }`}
        >
          <span className="px-2.5 grid place-items-center text-[12.5px] font-semibold text-[#6B7280] bg-[#FAFAFB] border-r border-black/10 shrink-0">
            {dial}
          </span>
          <input
            value={String(value).replace(/\D/g, "").replace(/^91/, "").slice(-10)}
            onChange={(e) => setField(field.key, e.target.value.replace(/\D/g, "").slice(-10))}
            placeholder="9876543210"
            className={`flex-1 min-w-0 px-3 text-[13px] text-[#111] outline-none ${conflict ? "bg-[#FEF2F2]" : ""}`}
          />
        </div>
      );
    }
    return (
      <input
        value={value}
        onChange={(e) => setField(field.key, e.target.value)}
        placeholder={field.placeholder || ""}
        className={`${CONTROL_BASE} px-3 placeholder:text-[#9CA3AF] ${conflict ? CONTROL_CONFLICT : CONTROL_OK}`}
      />
    );
  };

  if (!open) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={hasExisting ? "Update Profile" : "Create Profile"}
        subtitle={
          hasExisting
            ? "Existing client. Extra details go to Profile Create (P2)."
            : "New biodata. Save to create this profile in Sales Pipeline."
        }
        icon={<UserPlus size={18} />}
        iconBg="#F3E8F0"
        iconColor="#7A0A17"
        width="max-w-[1180px]"
        zClass="z-[70]"
        footer={
          <div className="flex items-center justify-between w-full gap-3">
            <button
              type="button"
              onClick={() => {
                setDropReason("");
                setDropError("");
                setDropOpen(true);
              }}
              className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-[13px] font-semibold text-[#E8395B] hover:bg-[#FDECEE] transition-colors"
            >
              <Trash2 size={15} />
              Drop Profile
            </button>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712]"
              >
                {hasExisting ? "Save Profile" : "Save & Create Profile"}
              </button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-3.5">
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const expanded = openSections.has(section.key);
            const cols = section.columns || 5;
            return (
              <section key={section.key} className="rounded-2xl border border-[#E8E4F0] overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => toggleSection(section.key)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-[#F7F4FC] hover:bg-[#F3EFFA] transition-colors"
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Icon size={15} className="text-[#7A0A17] shrink-0" />
                    <span className="text-[13.5px] font-bold text-[#7A0A17]">{section.title}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-[#9CA3AF] shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </button>
                {expanded ? (
                  <div className={`p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-3.5 ${cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-5"}`}>
                    {section.fields.map((field) => {
                      const chip = fieldChip(field.key, values, imported, existing, hasExisting);
                      const conflict = hasFieldConflict(
                        field.key,
                        imported[field.key],
                        existing[field.key],
                        hasExisting
                      );
                      const noteConflict = field.noteKey
                        ? hasFieldConflict(
                            field.noteKey,
                            imported[field.noteKey],
                            existing[field.noteKey],
                            hasExisting
                          )
                        : false;
                      return (
                        <div key={field.key} className="min-w-0">
                          <FieldShell
                            label={field.label}
                            required={field.required}
                            chip={chip}
                            hint={
                              <FieldHint
                                fieldKey={field.key}
                                current={values[field.key]}
                                imported={imported[field.key]}
                                existing={existing[field.key]}
                                hasExisting={hasExisting}
                                onKeep={() => keepExisting(field.key)}
                                onUseImported={() => applyImported(field.key)}
                              />
                            }
                          >
                            {renderControl(field, conflict)}
                          </FieldShell>
                          {field.noteKey ? (
                            <div className="mt-2">
                              <label className="block text-[11px] font-medium text-[#6B7280] mb-1">Notes</label>
                              <textarea
                                value={values[field.noteKey] || ""}
                                onChange={(e) => setField(field.noteKey, e.target.value)}
                                placeholder={
                                  field.key === "drinking"
                                    ? "e.g. Occasionally, social drinking etc."
                                    : field.key === "smoking"
                                      ? "e.g. Non-smoker, occasionally etc."
                                      : "e.g. Pure veg, egg, non-veg etc."
                                }
                                rows={2}
                                className={`w-full px-3 py-2 rounded-lg text-[12.5px] text-[#111] placeholder:text-[#9CA3AF] outline-none resize-none ${
                                  noteConflict ? CONTROL_CONFLICT : `bg-white ${CONTROL_OK}`
                                }`}
                              />
                              <FieldHint
                                fieldKey={field.noteKey}
                                current={values[field.noteKey]}
                                imported={imported[field.noteKey]}
                                existing={existing[field.noteKey]}
                                hasExisting={hasExisting}
                                onKeep={() => keepExisting(field.noteKey)}
                                onUseImported={() => applyImported(field.noteKey)}
                              />
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </section>
            );
          })}
          {error ? <p className="text-[12.5px] font-semibold text-[#E8395B]">{error}</p> : null}
        </div>
      </Modal>
      {dropOpen ? (
        <DropProfileConfirm
          reason={dropReason}
          onReasonChange={(value) => {
            setDropReason(value);
            setDropError("");
          }}
          error={dropError}
          onCancel={() => setDropOpen(false)}
          onConfirm={confirmDrop}
        />
      ) : null}
    </>
  );
}
