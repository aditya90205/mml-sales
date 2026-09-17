import { useEffect, useMemo, useRef, useState } from "react";
import {
  Ban,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  CloudUpload,
  FileSpreadsheet,
  Lock,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  digitsOnly,
  findDuplicatesByMobileOrEmail,
  formatDisplayMobile,
} from "../../utils/contactSearch.js";
import {
  CREATE_LEAD_COMPARE_FIELDS,
  EMAIL_RE,
  FIELD_DUMMY_HINTS,
  FIELD_STATUS_META,
  contactToLeadFields,
  displayFieldValue,
  firstValidationMessage,
  validateCreateLeadFields,
} from "../../utils/leadFields.js";

const RELATIONS = ["Self / Prospect", "Parent", "Sibling", "Relative", "Friend", "Other"];
const CONTACT_WITH = ["First Contact", "Follow-up", "Existing Client", "Referred Contact"];
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
const INCOME = [
  "Under ₹15 Lakh",
  "₹15 Lakh to ₹30 Lakh",
  "₹30 Lakh to ₹50 Lakh",
  "₹50 Lakh to ₹1 Crore",
  "₹1 Crore to ₹5 Crore",
  "Above ₹5 Crore",
];
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
const MEETINGS = [
  { id: "Meeting Agreed", label: "Meeting Agreed", icon: Calendar },
  { id: "Call Agreed", label: "Call Agreed", icon: Phone },
  { id: "Callback Later", label: "Callback Later", icon: Clock },
  { id: "Not Yet", label: "Not Yet", icon: Ban },
];
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
const COUNTRIES = ["India", "USA", "UK", "Canada", "UAE", "Australia", "Singapore", "Other"];
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

const INPUT =
  "w-full h-10 px-3.5 rounded-xl bg-white border border-black/12 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/45 transition-colors";

function emptyForm() {
  return {
    lookingFor: "yes",
    nri: "no",
    relation: "Self / Prospect",
    firstName: "",
    lastName: "",
    contactWith: "First Contact",
    dob: "",
    mobile: "",
    email: "",
    source: "Website Inquiry",
    country: "India",
    city: "",
    area: "",
    income: "₹5 Lakh to ₹10 Lakh",
    meeting: "Meeting Agreed",
  };
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
            className={`inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-[13px] font-semibold border transition-colors ${
              active
                ? "bg-[#7A0A17] text-white border-[#7A0A17]"
                : "bg-white text-[#374151] border-black/12 hover:bg-[#FAFAFB]"
            }`}
          >
            {active ? <Check size={13} strokeWidth={2.6} /> : null}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function FieldHint({ status }) {
  const meta = FIELD_STATUS_META[status];
  if (!meta) return null;
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md border ${meta.className}`}>
      {meta.label}
    </span>
  );
}

function FieldNote({ status, fieldKey, existingValue }) {
  if (status === "missing") {
    return <p className="text-[11.5px] font-medium text-[#B91C1C]">Blank — not in biodata. Fill this.</p>;
  }
  if (status === "mismatch") {
    return (
      <p className="text-[11.5px] font-medium text-[#92400E]">
        Different — on file: {displayFieldValue(fieldKey, existingValue)}
      </p>
    );
  }
  return null;
}

function StatusExtra({ status, fieldKey, existingValue, onUseExisting }) {
  if (!status) return null;
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <FieldHint status={status} />
      {status === "mismatch" && existingValue ? (
        <button
          type="button"
          onClick={() => onUseExisting?.(fieldKey)}
          className="text-[10px] font-semibold text-[#92400E] hover:underline"
        >
          Use existing
        </button>
      ) : null}
    </div>
  );
}

function toneClass(status) {
  if (status === "mismatch") return "ring-2 ring-[#F59E0B]/55 bg-[#FFFBEB]";
  if (status === "new") return "ring-2 ring-[#2563EB]/40 bg-[#EFF6FF]";
  if (status === "missing") return "ring-2 ring-[#E8395B]/40 bg-[#FEF2F2]";
  if (status === "match") return "ring-2 ring-[#16A34A]/35 bg-[#F0FDF4]";
  return "";
}

function Field({ label, required, extra, note, children }) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[13px] font-semibold text-[#111]">
          {label}
          {required ? <span className="text-[#E8395B]"> *</span> : null}
        </label>
        {extra}
      </div>
      {children}
      {note}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12.5px] font-medium border transition-colors ${
        active
          ? "bg-[#7A0A17] text-white border-[#7A0A17]"
          : "bg-white text-[#374151] border-black/12 hover:bg-[#FAFAFB]"
      }`}
    >
      {active ? <Check size={12} strokeWidth={2.6} /> : null}
      {children}
    </button>
  );
}

function NativeSelect({ value, onChange, options, className = "" }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT} appearance-none pr-9 cursor-pointer ${className}`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
    </div>
  );
}

function ReasonSelect({ value, onChange, options, placeholder = "Select reason" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${INPUT} flex items-center text-left pr-9 ${value ? "text-[#111]" : "text-[#9CA3AF]"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{value || placeholder}</span>
      </button>
      <ChevronDown
        size={15}
        className={`absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none transition-transform ${open ? "rotate-180" : ""}`}
      />
      {open ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white border border-black/8 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-30 py-1 max-h-44 overflow-y-auto"
          role="listbox"
        >
          {options.map((opt) => {
            const active = opt === value;
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2 text-[13px] ${
                  active ? "bg-[#FCF5F6] text-[#7A0A17] font-semibold" : "text-[#374151] hover:bg-[#FCF5F6] hover:text-[#7A0A17]"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function DropLeadConfirm({ reason, onReasonChange, error, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drop-lead-title"
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-md" onClick={onCancel} aria-hidden />
      <div className="relative z-10 w-full max-w-[400px] bg-white rounded-2xl shadow-xl p-5 overflow-visible">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="size-9 rounded-full bg-[#FCE8EC] text-[#7A0A17] grid place-items-center shrink-0">
              <Trash2 size={16} />
            </span>
            <h3 id="drop-lead-title" className="text-[16px] font-bold text-[#111]">
              Drop Lead
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="size-8 grid place-items-center rounded-lg text-[#6B7280] hover:bg-black/5 transition-colors shrink-0 -mt-1 -mr-1"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-[13.5px] font-semibold text-[#111]">Are you sure you want to drop this lead?</p>
        <p className="text-[12.5px] text-[#9CA3AF] mt-1 leading-relaxed">
          This lead will be removed from your pipeline and won&apos;t be available in your active leads list.
        </p>

        <div className="mt-4">
          <label className="block text-[13px] font-semibold text-[#111] mb-1.5">Reason for dropping</label>
          <ReasonSelect value={reason} onChange={onReasonChange} options={DROP_REASONS} />
          {error ? <p className="text-[12px] font-semibold text-[#E8395B] mt-1.5">{error}</p> : null}
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            <Trash2 size={14} />
            Drop Lead
          </button>
        </div>
      </div>
    </div>
  );
}

function applyInitial(initial) {
  const base = emptyForm();
  if (!initial || typeof initial !== "object") return base;
  const next = { ...base, ...initial };
  if (initial.mobile) {
    next.mobile = String(initial.mobile).replace(/\D/g, "").replace(/^91/, "").slice(-10);
  }
  if (initial.lookingFor) {
    const lf = String(initial.lookingFor).toLowerCase();
    next.lookingFor = lf.includes("no") || lf === "bride" ? "no" : "yes";
  }
  if (initial.relation) {
    const r = String(initial.relation).toLowerCase();
    if (r.includes("self")) next.relation = "Self / Prospect";
    else if (r.includes("parent")) next.relation = "Parent";
    else if (r.includes("sibling")) next.relation = "Sibling";
    else if (r.includes("relative")) next.relation = "Relative";
    else if (r.includes("friend")) next.relation = "Friend";
    else next.relation = "Other";
  }
  if (initial.city && !String(initial.city).includes(",")) {
    const hit = CITIES.find((c) => c.toLowerCase().startsWith(String(initial.city).toLowerCase()));
    if (hit) next.city = hit;
  }
  return next;
}

export default function CreateLeadModal({ open, onClose, onCreate, onUploadBiodata, initial = null }) {
  const fileRef = useRef(null);
  const cityRef = useRef(null);
  const [form, setForm] = useState(() => applyInitial(initial));
  const [file, setFile] = useState(() => (initial?.fileName ? { name: initial.fileName } : null));
  const [dragging, setDragging] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [error, setError] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const [dropReason, setDropReason] = useState("");
  const [dropError, setDropError] = useState("");
  const [linkedLead, setLinkedLead] = useState(null);
  const [fieldMeta, setFieldMeta] = useState(() => initial?.fieldMeta || {});
  const alsoRead = Array.isArray(initial?.alsoRead) ? initial.alsoRead : [];
  const existingValues = initial?.existingValues || {};
  const fromBiodata = Boolean(initial?.fileName || Object.keys(fieldMeta).length);
  const isUpdate = Boolean(initial?.existingLeadId || initial?.mode === "update" || linkedLead);

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
    setFieldMeta((prev) => {
      if (!prev[key] || prev[key] !== "missing") return prev;
      if (!String(value ?? "").trim()) return prev;
      return { ...prev, [key]: "new" };
    });
  };

  useEffect(() => {
    if (!open) {
      setDropOpen(false);
      setDropReason("");
      setDropError("");
      setLinkedLead(null);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (dropOpen) {
        setDropOpen(false);
        return;
      }
      onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, dropOpen]);

  useEffect(() => {
    const close = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) setCityOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const cityMatches = useMemo(() => {
    const q = form.city.trim().toLowerCase();
    if (!q) return CITIES;
    return CITIES.filter((c) => c.toLowerCase().includes(q));
  }, [form.city]);

  const dialCode = COUNTRY_DIAL[form.country] || "+91";

  const takeFile = (next) => {
    if (!next) return;
    setFile(next);
  };

  const openBiodataUpload = () => {
    if (onUploadBiodata) {
      onUploadBiodata(form);
      return;
    }
    fileRef.current?.click();
  };

  const duplicateHits = useMemo(() => {
    const digits = digitsOnly(form.mobile);
    const email = form.email.trim();
    const hits = findDuplicatesByMobileOrEmail({
      mobile: digits.length >= 8 ? form.mobile : "",
      email: EMAIL_RE.test(email) ? email : "",
    });
    const skip = new Set(
      [initial?.existingLeadId, linkedLead?.recordId, linkedLead?.id]
        .filter(Boolean)
        .flatMap((id) => [id, `lead:${id}`, `client:${id}`])
    );
    return hits.filter((row) => !skip.has(row.recordId) && !skip.has(row.id));
  }, [form.mobile, form.email, initial?.existingLeadId, linkedLead]);

  const missingFields = useMemo(
    () => CREATE_LEAD_COMPARE_FIELDS.filter((f) => fieldMeta[f.key] === "missing"),
    [fieldMeta]
  );
  const statusCounts = useMemo(() => {
    const counts = { match: 0, mismatch: 0, new: 0, missing: 0 };
    for (const status of Object.values(fieldMeta)) {
      if (status in counts) counts[status] += 1;
    }
    return counts;
  }, [fieldMeta]);

  const statusUi = (key) =>
    fromBiodata
      ? {
          extra: (
            <StatusExtra
              status={fieldMeta[key]}
              fieldKey={key}
              existingValue={existingValues[key]}
              onUseExisting={useExistingValue}
            />
          ),
          note: <FieldNote status={fieldMeta[key]} fieldKey={key} existingValue={existingValues[key]} />,
        }
      : {};

  const useExistingValue = (key) => {
    const raw = existingValues[key];
    if (raw == null || String(raw).trim() === "") return;
    const mapped = applyInitial({ [key]: raw });
    const value =
      key === "mobile"
        ? String(raw).replace(/\D/g, "").replace(/^91/, "").slice(-10)
        : mapped[key] || raw;
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldMeta((prev) => ({ ...prev, [key]: "match" }));
    setError("");
  };

  const applyExistingLead = (row) => {
    const fields = contactToLeadFields(row);
    setLinkedLead(row);
    setForm((prev) => ({
      ...prev,
      firstName: prev.firstName || fields.firstName,
      lastName: prev.lastName || fields.lastName,
      mobile: digitsOnly(prev.mobile || fields.mobile).replace(/^91/, "").slice(-10),
      email: prev.email || fields.email,
      city: prev.city || fields.city,
      area: prev.area || fields.area,
      dob: prev.dob || fields.dob,
      lookingFor: fields.lookingFor || prev.lookingFor,
      relation: fields.relation || prev.relation,
      contactWith: "Existing Client",
    }));
    setError("");
  };

  const validate = () => firstValidationMessage(validateCreateLeadFields(form));

  const submit = (e) => {
    e?.preventDefault?.();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    const digits = form.mobile.replace(/\D/g, "");
    onCreate?.({
      ...form,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`.replace(/\s+/g, " "),
      mobile: `${dialCode} ${digits}`,
      fileName: file?.name || initial?.fileName || "",
      existingLeadId:
        (linkedLead?.type === "lead" ? linkedLead.recordId : null) ||
        initial?.existingLeadId ||
        undefined,
      clientId:
        (linkedLead?.type === "client" ? linkedLead.recordId : null) ||
        initial?.clientId ||
        undefined,
      mode: isUpdate ? "update" : "create",
    });
    onClose?.();
  };

  const openDropModal = () => {
    setDropReason("");
    setDropError("");
    setDropOpen(true);
  };

  const confirmDrop = () => {
    if (!dropReason) {
      setDropError("Select a reason for dropping.");
      return;
    }
    const name = `${form.firstName.trim()} ${form.lastName.trim()}`.replace(/\s+/g, " ").trim();
    toast.info(name ? `Lead "${name}" dropped.` : "Lead dropped.");
    setDropOpen(false);
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="absolute inset-0"
        onClick={() => {
          if (!dropOpen) onClose?.();
        }}
        aria-hidden
      />
      <div
        className={`relative z-10 w-full max-w-[640px] bg-white rounded-2xl shadow-xl border border-black/8 max-h-[90vh] flex flex-col overflow-hidden ${
          dropOpen ? "opacity-0 pointer-events-none" : ""
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-lead-title"
      >
        <form onSubmit={submit} className="flex flex-col min-h-0 flex-1">
          <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-3 shrink-0">
            <div className="flex items-start gap-2 min-w-0">
              <UserPlus size={18} strokeWidth={2.2} className="text-[#7A0A17] shrink-0 mt-0.5" />
              <div className="min-w-0">
                <h2 id="create-lead-title" className="text-[18px] font-bold text-[#111] leading-tight">
                  {isUpdate ? "Update Lead" : "Create Lead"}
                </h2>
                <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                  {isUpdate
                    ? "Existing lead found — review Existing / New / Blank fields and save"
                    : fromBiodata
                      ? "Biodata filled this form — green Existing, blue New, red Blank"
                      : "Capture the inquiry while you are on the call"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="size-8 grid place-items-center rounded-lg text-[#6B7280] hover:bg-black/5 transition-colors shrink-0"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-6 pb-5 overflow-y-auto scrollbar-thin flex flex-col gap-5">
            {!fromBiodata ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  if (onUploadBiodata) {
                    onUploadBiodata(form);
                    return;
                  }
                  takeFile(e.dataTransfer.files?.[0]);
                }}
                className={`flex items-center justify-between gap-4 rounded-2xl px-4 py-3.5 transition-colors ${
                  dragging ? "bg-[#EDE7F6]" : "bg-[#F5F2FB]"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="size-10 rounded-xl bg-white text-[#7A0A17] grid place-items-center shrink-0 shadow-sm">
                    <FileSpreadsheet size={18} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13.5px] font-bold text-[#111]">Upload Biodata / Bulk Import</p>
                      <span className="inline-flex items-center gap-1 h-5 px-2 rounded-full bg-white text-[#E8395B] text-[10px] font-semibold">
                        <Sparkles size={10} />
                        AI Parsing
                      </span>
                    </div>
                    <p className="text-[11.5px] text-[#9CA3AF] mt-0.5 truncate">
                      {file
                        ? file.name
                        : "PDF, Word, or scanned image (JPG / PNG) · match by mobile & email"}
                    </p>
                  </div>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.xls,.xlsx"
                  className="hidden"
                  onChange={(e) => takeFile(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={openBiodataUpload}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-white border border-black/10 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] shrink-0"
                >
                  <CloudUpload size={15} />
                  Select File
                </button>
              </div>
            ) : null}

            {fromBiodata ? (
              <div className="flex flex-col gap-2">
                <p className="text-[12px] text-[#6B7280]">
                  After upload: <span className="font-semibold text-[#166534]">Existing</span> already in
                  system, <span className="font-semibold text-[#1D4ED8]">New</span> from biodata,{" "}
                  <span className="font-semibold text-[#B91C1C]">Blank</span> not captured.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["match", "new", "missing", "mismatch"].map((key) =>
                    statusCounts[key] ? (
                      <span
                        key={key}
                        className={`inline-flex items-center h-6 px-2 rounded-full border text-[11px] font-semibold ${FIELD_STATUS_META[key].className}`}
                      >
                        {FIELD_STATUS_META[key].label}
                        {` · ${statusCounts[key]}`}
                      </span>
                    ) : null
                  )}
                </div>
              </div>
            ) : null}

            {missingFields.length > 0 ? (
              <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-3 -mt-1">
                <p className="text-[13px] font-bold text-[#B91C1C]">Blank fields — fill these</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {missingFields.map((field) => (
                    <li key={field.key} className="text-[12.5px] text-[#7F1D1D]">
                      <span className="font-semibold">{field.label}</span>
                      {field.required ? " *" : ""}
                      <span className="text-[#9B1C1C]/80">
                        {" "}
                        — not captured. {FIELD_DUMMY_HINTS[field.key] || "Fill manually"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {alsoRead.length > 0 ? (
              <div className="-mt-1">
                <p className="text-[12px] font-semibold text-[#6B7280] mb-2">
                  Also read{" "}
                  <span className="font-normal text-[#9CA3AF]">(kept on the profile, not form fields)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {alsoRead.map((chip) => (
                    <span
                      key={chip.label}
                      className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-[#F3F4F6] text-[11.5px] text-[#374151]"
                    >
                      <span className="font-semibold text-[#6B7280]">{chip.label}</span>
                      <span className="font-medium">{chip.value}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {duplicateHits[0] ? (
              <div className="rounded-xl border border-[#F5D78E] bg-[#FFF8E8] px-3.5 py-3 flex flex-col sm:flex-row sm:items-center gap-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold text-[#92400E]">Already in system</p>
                  <p className="text-[12.5px] text-[#78350F] mt-0.5">
                    {duplicateHits[0].mobileOk ? "Mobile" : "Email"} matches{" "}
                    <span className="font-semibold">{duplicateHits[0].name}</span>
                    {duplicateHits[0].email ? ` · ${duplicateHits[0].email}` : ""}
                    {duplicateHits[0].mobile ? ` · ${formatDisplayMobile(duplicateHits[0].mobile)}` : ""}
                    {duplicateHits.length > 1 ? ` · +${duplicateHits.length - 1} more` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => applyExistingLead(duplicateHits[0])}
                  className="h-9 px-3.5 rounded-xl bg-white border border-[#D97706]/40 text-[12.5px] font-semibold text-[#92400E] hover:bg-[#FFFBEB] shrink-0"
                >
                  Update this lead
                </button>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Looking for a bride or groom" required {...statusUi("lookingFor")}>
                <div className={`rounded-xl ${toneClass(fieldMeta.lookingFor)}`}>
                  <YesNoToggle value={form.lookingFor} onChange={set("lookingFor")} />
                </div>
              </Field>
              <Field label="NRI" required>
                <YesNoToggle
                  value={form.nri}
                  onChange={(value) => {
                    setForm((prev) => ({
                      ...prev,
                      nri: value,
                      country: value === "no" ? "India" : prev.country,
                    }));
                    setError("");
                  }}
                />
              </Field>
            </div>

            <Field label="Relation to Prospect" required {...statusUi("relation")}>
              <NativeSelect
                value={form.relation}
                onChange={set("relation")}
                options={RELATIONS}
                className={toneClass(fieldMeta.relation)}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Prospect's First Name" required {...statusUi("firstName")}>
                <input
                  value={form.firstName}
                  onChange={(e) => set("firstName")(e.target.value)}
                  placeholder="Kabir"
                  className={`${INPUT} ${toneClass(fieldMeta.firstName)}`}
                />
              </Field>
              <Field label="Prospect's Last Name" required {...statusUi("lastName")}>
                <input
                  value={form.lastName}
                  onChange={(e) => set("lastName")(e.target.value)}
                  placeholder="Vaidya"
                  className={`${INPUT} ${toneClass(fieldMeta.lastName)}`}
                />
              </Field>
              <Field label="Already in Contact With" required>
                <NativeSelect value={form.contactWith} onChange={set("contactWith")} options={CONTACT_WITH} />
              </Field>
              <Field label="Date of Birth" {...statusUi("dob")}>
                <div className="relative">
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => set("dob")(e.target.value)}
                    className={`${INPUT} ${toneClass(fieldMeta.dob)} pr-10 relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                  />
                  <Calendar size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Country" required>
                <NativeSelect
                  value={form.country}
                  onChange={set("country")}
                  options={form.nri === "yes" ? COUNTRIES : ["India"]}
                />
              </Field>
              <Field label="Mobile Number" required {...statusUi("mobile")}>
                <div className={`flex h-10 rounded-xl border overflow-hidden focus-within:border-[#7A0A17]/45 ${toneClass(fieldMeta.mobile) || "border-black/12"}`}>
                  <span className="min-w-[3.25rem] px-2.5 grid place-items-center text-[13px] font-medium text-[#6B7280] bg-[#F7F7F8] border-r border-black/10 shrink-0">
                    {dialCode}
                  </span>
                  <input
                    value={form.mobile}
                    onChange={(e) => set("mobile")(e.target.value.replace(/[^\d\s]/g, ""))}
                    placeholder="98201 54930"
                    inputMode="numeric"
                    className="flex-1 min-w-0 px-3 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none"
                  />
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field label="City" required {...statusUi("city")}>
                <div className="relative" ref={cityRef}>
                  <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    value={form.city}
                    onChange={(e) => {
                      set("city")(e.target.value);
                      setCityOpen(true);
                    }}
                    onFocus={() => setCityOpen(true)}
                    placeholder="Mumbai, Maharashtra"
                    className={`${INPUT} ${toneClass(fieldMeta.city)} pl-10 pr-10`}
                    autoComplete="off"
                  />
                  <Search size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  {cityOpen && cityMatches.length > 0 && (
                    <div className="absolute left-0 right-0 top-[calc(100%+6px)] bg-white border border-black/8 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-20 py-1 max-h-48 overflow-y-auto">
                      {cityMatches.map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => {
                            set("city")(city);
                            setCityOpen(false);
                          }}
                          className="w-full text-left px-3.5 py-2 text-[13px] text-[#374151] hover:bg-[#FCF5F6] hover:text-[#7A0A17]"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
              <Field label="Area / Locality" {...statusUi("area")}>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    value={form.area}
                    onChange={(e) => set("area")(e.target.value)}
                    placeholder="Bandra West"
                    className={`${INPUT} ${toneClass(fieldMeta.area)} pl-10`}
                  />
                </div>
              </Field>
            </div>

            <Field label="Email" {...statusUi("email")}>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                  placeholder="kabir.vaidya@enterprise-group.in"
                  className={`${INPUT} ${toneClass(fieldMeta.email)} pl-10`}
                />
              </div>
            </Field>

            <Field label="Source" required>
              <div className="flex flex-wrap gap-2">
                {SOURCES.map((source) => (
                  <Chip key={source} active={form.source === source} onClick={() => set("source")(source)}>
                    {source}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field
              label="Family Income Bracket"
              extra={<span className="text-[11px] text-[#9CA3AF]">Annual Gross</span>}
            >
              <div className="flex flex-wrap gap-2">
                {INCOME.map((band) => (
                  <Chip key={band} active={form.income === band} onClick={() => set("income")(band)}>
                    {band}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field label="Agree to a Meeting or Call" required>
              <div className="flex flex-wrap gap-2">
                {MEETINGS.map(({ id, label, icon: Icon }) => {
                  const active = form.meeting === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => set("meeting")(id)}
                      className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[12.5px] font-semibold border transition-colors ${
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
            </Field>

            {error ? <p className="text-[12.5px] font-semibold text-[#E8395B] -mt-2">{error}</p> : null}
          </div>

          <div className="flex items-center justify-between gap-3 px-6 py-3.5 bg-[#F5F2FB] shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={openDropModal}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-[#7A0A17]/35 text-[13px] font-semibold text-[#7A0A17] hover:bg-[#FCF5F6] transition-colors shrink-0"
              >
                <Trash2 size={14} />
                Drop Lead
              </button>
              <p className="hidden sm:inline-flex items-center gap-1.5 text-[12px] text-[#9CA3AF] truncate">
                <Lock size={13} className="shrink-0" />
                Enterprise encrypted pipeline
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
              >
                <UserPlus size={14} />
                {isUpdate ? "Save Lead" : "Create Lead"}
              </button>
            </div>
          </div>
        </form>
      </div>
      {dropOpen ? (
        <DropLeadConfirm
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
    </div>
  );
}
