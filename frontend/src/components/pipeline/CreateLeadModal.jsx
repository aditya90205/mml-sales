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
  UserPlus,
  X,
} from "lucide-react";

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
];
const INCOME = [
  "Under ₹5 Lakh",
  "₹5 Lakh to ₹10 Lakh",
  "₹10 Lakh to ₹25 Lakh",
  "₹25 Lakh to ₹50 Lakh",
  "₹50 Lakh to ₹1 Crore",
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

const INPUT =
  "w-full h-10 px-3.5 rounded-xl bg-white border border-black/12 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/45 transition-colors";

function emptyForm() {
  return {
    lookingFor: "yes",
    relation: "Self / Prospect",
    firstName: "",
    lastName: "",
    contactWith: "First Contact",
    dob: "",
    mobile: "",
    email: "",
    source: "Website Inquiry",
    city: "",
    area: "",
    income: "₹5 Lakh to ₹10 Lakh",
    meeting: "Meeting Agreed",
  };
}

function Field({ label, required, extra, children }) {
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

function NativeSelect({ value, onChange, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT} appearance-none pr-9 cursor-pointer`}
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

export default function CreateLeadModal({ open, onClose, onCreate }) {
  const fileRef = useRef(null);
  const cityRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [error, setError] = useState("");

  const set = (key) => (value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm());
    setFile(null);
    setDragging(false);
    setCityOpen(false);
    setError("");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

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

  const takeFile = (next) => {
    if (!next) return;
    setFile(next);
  };

  const validate = () => {
    if (!form.firstName.trim()) return "Prospect's first name is required.";
    if (!form.lastName.trim()) return "Prospect's last name is required.";
    const digits = form.mobile.replace(/\D/g, "");
    if (digits.length < 10) return "Enter a valid 10-digit mobile number.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address.";
    if (!form.city.trim()) return "City is required.";
    return "";
  };

  const submit = (e) => {
    e?.preventDefault?.();
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    const digits = form.mobile.replace(/\D/g, "").slice(-10);
    onCreate?.({
      ...form,
      name: `${form.firstName.trim()} ${form.lastName.trim()}`.replace(/\s+/g, " "),
      mobile: `+91 ${digits}`,
      fileName: file?.name || "",
    });
    onClose?.();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative z-10 w-full max-w-[640px] bg-white rounded-2xl shadow-xl border border-black/8 max-h-[90vh] flex flex-col overflow-hidden"
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
                  Capture the inquiry while you are on the call
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
              >
                <UserPlus size={14} strokeWidth={2.2} />
                Assign to Sales
              </button>
              <button
                type="button"
                onClick={onClose}
                className="size-8 grid place-items-center rounded-lg text-[#6B7280] hover:bg-black/5 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="px-6 pb-5 overflow-y-auto scrollbar-thin flex flex-col gap-5">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
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
                      : "Autofills and name checks • Browse files or drag & drop here (PDF, DOCX, XLSX)"}
                  </p>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
                onChange={(e) => takeFile(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-white border border-black/10 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] shrink-0"
              >
                <CloudUpload size={15} />
                Select File
              </button>
            </div>

            <Field label="Looking for a bride or groom" required>
              <div className="flex items-center gap-2">
                {[
                  { id: "yes", label: "Yes" },
                  { id: "no", label: "No" },
                ].map((opt) => {
                  const active = form.lookingFor === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => set("lookingFor")(opt.id)}
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
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field label="Relation to Prospect" required>
                <NativeSelect value={form.relation} onChange={set("relation")} options={RELATIONS} />
              </Field>
              <Field label="Prospect's First Name" required>
                <input
                  value={form.firstName}
                  onChange={(e) => set("firstName")(e.target.value)}
                  placeholder="Kabir"
                  className={INPUT}
                />
              </Field>
              <Field label="Prospect's Last Name" required>
                <input
                  value={form.lastName}
                  onChange={(e) => set("lastName")(e.target.value)}
                  placeholder="Vaidya"
                  className={INPUT}
                />
              </Field>
              <Field label="Already in Contact With" required>
                <NativeSelect value={form.contactWith} onChange={set("contactWith")} options={CONTACT_WITH} />
              </Field>
              <Field label="Date of Birth">
                <div className="relative">
                  <input
                    type="date"
                    value={form.dob}
                    onChange={(e) => set("dob")(e.target.value)}
                    className={`${INPUT} pr-10 relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-2 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-8 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                  />
                  <Calendar size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
                </div>
              </Field>
              <Field label="Mobile Number" required>
                <div className="flex h-10 rounded-xl border border-black/12 overflow-hidden focus-within:border-[#7A0A17]/45">
                  <span className="px-3 grid place-items-center text-[13px] font-medium text-[#6B7280] bg-[#F7F7F8] border-r border-black/10 shrink-0">
                    +91
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

            <Field label="Email">
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                  placeholder="kabir.vaidya@enterprise-group.in"
                  className={`${INPUT} pl-10`}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              <Field label="City" required>
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
                    className={`${INPUT} pl-10 pr-10`}
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
              <Field label="Area / Locality">
                <div className="relative">
                  <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
                  <input
                    value={form.area}
                    onChange={(e) => set("area")(e.target.value)}
                    placeholder="Bandra West"
                    className={`${INPUT} pl-10`}
                  />
                </div>
              </Field>
            </div>

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
            <p className="inline-flex items-center gap-1.5 text-[12px] text-[#9CA3AF]">
              <Lock size={13} />
              Enterprise encrypted pipeline
            </p>
            <div className="flex items-center gap-2.5">
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
                <Sparkles size={14} />
                Create Lead & Assign
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
