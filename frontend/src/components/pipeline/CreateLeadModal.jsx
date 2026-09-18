import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Ban,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Phone,
  Search,
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
  FIELD_STATUS,
  FIELD_STATUS_META,
  classifyField,
  coerceCreateLeadValue,
  contactToLeadFields,
  displayFieldValue,
  firstValidationMessage,
  formToLeadFields,
  isValidEmail,
  isValidMobile,
  normalizeField,
  validateCreateLeadFields,
} from "../../utils/leadFields.js";

const RELATIONS = ["Self", "Parent", "Sibling", "Relative", "Friend", "Other"];
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
const OCCUPATIONS = [
  "Independent",
  "Business (joint / nuclear)",
  "Professional",
  "Self employed",
  "Industrialist",
  "Bureaucrat",
  "Private sector",
  "Student",
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
    relation: "Self",
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
    income: "",
    profession: "",
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

function statusLabel(status) {
  if (status === FIELD_STATUS.mismatch) return "Will change";
  if (status === FIELD_STATUS.match) return "Same";
  if (status === FIELD_STATUS.neu) return "New";
  if (status === FIELD_STATUS.keep) return "Existing";
  return FIELD_STATUS_META[status]?.label || "";
}

function FieldCompareNote({ info, onKeep, onUseImported }) {
  if (!info) return null;
  const showActions = info.canKeep || info.canUseImported;
  if (info.status === FIELD_STATUS.match && !showActions) return null;
  if (info.status === FIELD_STATUS.empty && !showActions) return null;
  if (info.status === FIELD_STATUS.missing && !showActions) return null;
  return (
    <div className="flex flex-col gap-1.5">
      {info.status === FIELD_STATUS.mismatch ? (
        <p className="text-[11.5px] text-[#92400E] leading-snug">
          Existing <span className="font-semibold">{info.from}</span>
          <span className="text-[#D97706]"> → </span>
          biodata <span className="font-semibold">{info.to}</span>
        </p>
      ) : null}
      {info.status === FIELD_STATUS.neu ? (
        <p className="text-[11.5px] text-[#1D4ED8] leading-snug">
          Not on the existing record. Will be added from biodata.
        </p>
      ) : null}
      {info.status === FIELD_STATUS.keep ? (
        <p className="text-[11.5px] text-[#15803D] leading-snug">
          Not in biodata · keeping existing <span className="font-semibold">{info.from}</span>
        </p>
      ) : null}
      {info.status === FIELD_STATUS.match && showActions ? (
        <p className="text-[11.5px] text-[#15803D] leading-snug">
          Keeping existing. Biodata had {displayFieldValue(info.key, info.imported)}.
        </p>
      ) : null}
      {showActions ? (
        <div className="flex flex-wrap gap-1.5">
          {info.canKeep ? (
            <button
              type="button"
              onClick={onKeep}
              className="h-7 px-2.5 rounded-lg bg-white border border-black/12 text-[11.5px] font-semibold text-[#374151] hover:bg-[#FAFAFB]"
            >
              Keep existing
            </button>
          ) : null}
          {info.canUseImported ? (
            <button
              type="button"
              onClick={onUseImported}
              className="h-7 px-2.5 rounded-lg bg-[#FFFBEB] border border-[#FCD34D] text-[11.5px] font-semibold text-[#92400E] hover:bg-[#FEF3C7]"
            >
              Use biodata
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function ComparedField({ fieldKey, label, required, compare, onKeep, onUseImported, children }) {
  const info = compare[fieldKey];
  const showBadge =
    info &&
    (info.status === FIELD_STATUS.mismatch ||
      info.status === FIELD_STATUS.neu ||
      info.status === FIELD_STATUS.keep ||
      info.status === FIELD_STATUS.match);
  const meta = showBadge ? FIELD_STATUS_META[info.status] : null;
  return (
    <Field
      label={label}
      required={required}
      extra={
        meta ? (
          <span
            className={`inline-flex items-center h-5 px-1.5 rounded-md border text-[10px] font-semibold shrink-0 ${meta.className}`}
          >
            {statusLabel(info.status)}
          </span>
        ) : null
      }
      note={<FieldCompareNote info={info} onKeep={() => onKeep(fieldKey)} onUseImported={() => onUseImported(fieldKey)} />}
    >
      {children}
    </Field>
  );
}

function NativeSelect({ value, onChange, options, className = "", disabled = false }) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT} appearance-none pr-9 ${
          disabled ? "bg-[#F7F7F8] text-[#6B7280] cursor-not-allowed pointer-events-none" : "cursor-pointer"
        } ${className}`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {!disabled ? (
        <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
      ) : null}
    </div>
  );
}

function ReasonSelect({ value, onChange, options, placeholder = "Select reason" }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  const placeMenu = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const menuH = Math.min(options.length * 36 + 8, 176);
    const gap = 6;
    const spaceBelow = window.innerHeight - r.bottom - gap;
    const shouldUp = spaceBelow < menuH && r.top > spaceBelow;
    setMenuStyle({
      position: "fixed",
      left: r.left,
      width: r.width,
      zIndex: 80,
      ...(shouldUp ? { bottom: window.innerHeight - r.top + gap } : { top: r.bottom + gap }),
    });
  };

  useEffect(() => {
    const close = (e) => {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!open) return;
    placeMenu();
    const onMove = () => placeMenu();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open, options.length]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
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
      {open && menuStyle
        ? createPortal(
            <div
              ref={menuRef}
              style={menuStyle}
              className="bg-white border border-black/8 rounded-l-xl rounded-r-none shadow-[0_8px_30px_rgba(0,0,0,0.10)] py-1 max-h-44 overflow-y-auto scrollbar-thin"
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
                      active
                        ? "bg-[#FCF5F6] text-[#7A0A17] font-semibold"
                        : "text-[#374151] hover:bg-[#FCF5F6] hover:text-[#7A0A17]"
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>,
            document.body
          )
        : null}
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
    if (r.includes("self")) next.relation = "Self";
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
  if (String(next.nri).toLowerCase() !== "yes") {
    next.nri = "no";
    next.country = "India";
  }
  if (!next.profession && initial.occupation) next.profession = initial.occupation;
  return next;
}

export default function CreateLeadModal({ open, onClose, onCreate, initial = null }) {
  const cityRef = useRef(null);
  const [form, setForm] = useState(() => applyInitial(initial));
  const [cityOpen, setCityOpen] = useState(false);
  const [error, setError] = useState("");
  const [dropOpen, setDropOpen] = useState(false);
  const [dropReason, setDropReason] = useState("");
  const [dropError, setDropError] = useState("");
  const [linkedLead, setLinkedLead] = useState(null);
  const [existingSnap, setExistingSnap] = useState(() =>
    initial?.existingValues && Object.keys(initial.existingValues).length ? initial.existingValues : null
  );
  const [importedSnap, setImportedSnap] = useState(() => initial?.importedFields || {});
  const fromBiodata = Boolean(initial?.fileName || initial?.intake);
  const isUpdate = Boolean(
    initial?.existingLeadId ||
      initial?.clientId ||
      initial?.mode === "update" ||
      initial?.matchName ||
      linkedLead
  );

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
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

  const dialCode = COUNTRY_DIAL[form.nri === "no" ? "India" : form.country] || "+91";

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

  const applyExistingLead = (row) => {
    const fields = contactToLeadFields(row);
    setLinkedLead(row);
    setExistingSnap(fields);
    setImportedSnap((prev) => {
      const hasImported = CREATE_LEAD_COMPARE_FIELDS.some((f) => String(prev?.[f.key] || "").trim());
      return hasImported ? prev : formToLeadFields(form);
    });
    setForm((prev) => ({
      ...prev,
      firstName: prev.firstName || fields.firstName,
      lastName: prev.lastName || fields.lastName,
      mobile: digitsOnly(prev.mobile || fields.mobile).replace(/^91/, "").slice(-10),
      email: prev.email || fields.email,
      city: prev.city || fields.city,
      area: prev.area || fields.area,
      dob: prev.dob || fields.dob,
      lookingFor: prev.lookingFor || fields.lookingFor,
      relation: prev.relation || fields.relation,
      contactWith: "Existing Client",
    }));
    setError("");
  };

  const hasExistingRecord = Boolean(
    isUpdate ||
      (existingSnap &&
        CREATE_LEAD_COMPARE_FIELDS.some((field) => String(existingSnap[field.key] || "").trim()))
  );

  const fieldCompare = useMemo(() => {
    if (!hasExistingRecord || !existingSnap) return {};
    const out = {};
    for (const field of CREATE_LEAD_COMPARE_FIELDS) {
      const current = form[field.key];
      const existing = existingSnap[field.key];
      const imported = importedSnap[field.key];
      const currentNorm = normalizeField(field.key, current);
      const existingNorm = normalizeField(field.key, existing);
      const importedNorm = normalizeField(field.key, imported);
      const status =
        !existingNorm && !importedNorm
          ? FIELD_STATUS.empty
          : classifyField(field.key, current, existing);
      out[field.key] = {
        key: field.key,
        status,
        from: displayFieldValue(field.key, existing),
        to: displayFieldValue(field.key, current),
        imported,
        canKeep: Boolean(existingNorm) && currentNorm !== existingNorm,
        canUseImported: Boolean(importedNorm) && currentNorm !== importedNorm,
      };
    }
    return out;
  }, [form, existingSnap, importedSnap, hasExistingRecord]);

  const applyFieldSource = (key, source) => {
    const raw = source === "existing" ? existingSnap?.[key] : importedSnap?.[key];
    set(key)(coerceCreateLeadValue(key, raw));
  };

  const keepField = (key) => applyFieldSource(key, "existing");
  const useBiodataField = (key) => applyFieldSource(key, "imported");
  const mismatchClass = (key) => {
    const status = fieldCompare[key]?.status;
    if (status === FIELD_STATUS.mismatch) return "ring-2 ring-[#FCD34D] bg-[#FFFBEB]";
    if (status === FIELD_STATUS.neu) return "ring-2 ring-[#93C5FD] bg-[#EFF6FF]";
    return "";
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
      country: form.nri === "no" ? "India" : form.country,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`.replace(/\s+/g, " "),
      mobile: digits ? `${dialCode} ${digits}` : "",
      fileName: initial?.fileName || "",
      alsoRead: initial?.alsoRead,
      intake: initial?.intake,
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
                  className={`relative z-10 w-full max-w-[720px] bg-white rounded-2xl shadow-xl border border-black/8 max-h-[90vh] flex flex-col overflow-hidden ${
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
                  Create Lead
                </h2>
                <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                  {fromBiodata
                    ? "Filled from biodata. Check the fields, then save."
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
              <ComparedField
                fieldKey="lookingFor"
                label="Looking for a bride or groom"
                required
                compare={fieldCompare}
                onKeep={keepField}
                onUseImported={useBiodataField}
              >
                <YesNoToggle value={form.lookingFor} onChange={set("lookingFor")} />
              </ComparedField>
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

            <ComparedField
              fieldKey="relation"
              label="Enquiry Made by"
              required
              compare={fieldCompare}
              onKeep={keepField}
              onUseImported={useBiodataField}
            >
              <NativeSelect value={form.relation} onChange={set("relation")} options={RELATIONS} />
            </ComparedField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <ComparedField
                fieldKey="firstName"
                label="First Name"
                required
                compare={fieldCompare}
                onKeep={keepField}
                onUseImported={useBiodataField}
              >
                <input
                  value={form.firstName}
                  onChange={(e) => set("firstName")(e.target.value)}
                  placeholder="Kabir"
                  className={`${INPUT} ${mismatchClass("firstName")}`}
                />
              </ComparedField>
              <ComparedField
                fieldKey="lastName"
                label="Last Name"
                required
                compare={fieldCompare}
                onKeep={keepField}
                onUseImported={useBiodataField}
              >
                <input
                  value={form.lastName}
                  onChange={(e) => set("lastName")(e.target.value)}
                  placeholder="Vaidya"
                  className={`${INPUT} ${mismatchClass("lastName")}`}
                />
              </ComparedField>
              <ComparedField
                fieldKey="dob"
                label="Date of Birth"
                compare={fieldCompare}
                onKeep={keepField}
                onUseImported={useBiodataField}
              >
                <div className="relative">
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => set("dob")(e.target.value)}
                    className={`${INPUT} pr-10 relative ${mismatchClass("dob")} [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                  />
                  <Calendar size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                </div>
              </ComparedField>
              <Field label="Profession">
                <ReasonSelect
                  value={form.profession}
                  onChange={set("profession")}
                  options={OCCUPATIONS}
                  placeholder="Select profession"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <ComparedField
                fieldKey="mobile"
                label="Mobile Number"
                required={!isValidEmail(form.email)}
                compare={fieldCompare}
                onKeep={keepField}
                onUseImported={useBiodataField}
              >
                <div
                  className={`flex h-10 rounded-xl border overflow-hidden focus-within:border-[#7A0A17]/45 ${
                    fieldCompare.mobile?.status === FIELD_STATUS.mismatch
                      ? "border-[#FCD34D] bg-[#FFFBEB]"
                      : fieldCompare.mobile?.status === FIELD_STATUS.neu
                        ? "border-[#93C5FD] bg-[#EFF6FF]"
                        : "border-black/12"
                  }`}
                >
                  <span className="min-w-[3.25rem] px-2.5 grid place-items-center text-[13px] font-medium text-[#6B7280] bg-[#F7F7F8] border-r border-black/10 shrink-0">
                    {dialCode}
                  </span>
                  <input
                    value={form.mobile}
                    onChange={(e) => set("mobile")(e.target.value.replace(/[^\d\s]/g, ""))}
                    placeholder="98201 54930"
                    inputMode="numeric"
                    className="flex-1 min-w-0 px-3 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none bg-transparent"
                  />
                </div>
              </ComparedField>
              <ComparedField
                fieldKey="email"
                label="Email"
                required={!isValidMobile(form.mobile)}
                compare={fieldCompare}
                onKeep={keepField}
                onUseImported={useBiodataField}
              >
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email")(e.target.value)}
                    placeholder="kabir.vaidya@enterprise-group.in"
                    className={`${INPUT} pl-10 ${mismatchClass("email")}`}
                  />
                </div>
              </ComparedField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-4">
              <Field label="Country" required>
                <NativeSelect
                  value={form.nri === "no" ? "India" : form.country}
                  onChange={set("country")}
                  options={form.nri === "yes" ? COUNTRIES : ["India"]}
                  disabled={form.nri === "no"}
                />
              </Field>
              <ComparedField
                fieldKey="city"
                label="City"
                required
                compare={fieldCompare}
                onKeep={keepField}
                onUseImported={useBiodataField}
              >
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
                    className={`${INPUT} pl-10 pr-10 ${mismatchClass("city")}`}
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
              </ComparedField>
              <ComparedField
                fieldKey="area"
                label="Area / Locality"
                compare={fieldCompare}
                onKeep={keepField}
                onUseImported={useBiodataField}
              >
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    value={form.area}
                    onChange={(e) => set("area")(e.target.value)}
                    placeholder="Bandra West"
                    className={`${INPUT} pl-10 ${mismatchClass("area")}`}
                  />
                </div>
              </ComparedField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field
                label="Family Income Bracket"
                extra={<span className="text-[11px] text-[#9CA3AF]">Annual Gross</span>}
              >
                <ReasonSelect
                  value={form.income}
                  onChange={set("income")}
                  options={INCOME}
                  placeholder="Select income"
                />
              </Field>
              <Field label="Source" required>
                <ReasonSelect
                  value={form.source}
                  onChange={set("source")}
                  options={SOURCES}
                  placeholder="Select source"
                />
              </Field>
            </div>

            <Field label="Agree to a Meeting or Call" required>
              <div className="flex flex-wrap gap-2">
                {MEETINGS.map(({ id, label, icon: Icon }) => {
                  const active = form.meeting === id && !dropOpen;
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
                <button
                  type="button"
                  onClick={openDropModal}
                  className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[12.5px] font-semibold border transition-colors ${
                    dropOpen
                      ? "bg-[#7A0A17] text-white border-[#7A0A17]"
                      : "bg-white text-[#4B5563] border-black/12 hover:bg-[#FAFAFB]"
                  }`}
                >
                  <Trash2 size={14} />
                  Drop Lead
                </button>
              </div>
            </Field>

            {fromBiodata ? (
              <div className="rounded-xl bg-[#F5F2FB] border border-black/8 px-3.5 py-3">
                <p className="text-[13px] font-medium text-[#374151]">
                  Remaining details updated in P2 profile.
                </p>
              </div>
            ) : null}

            {error ? <p className="text-[12.5px] font-semibold text-[#E8395B] -mt-2">{error}</p> : null}
          </div>

          <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-[#F5F2FB] shrink-0">
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
              Create Lead
            </button>
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
