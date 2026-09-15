import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Search, Sparkles, X } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";

const EVENT_CATEGORIES = [
  "Internal meeting",
  "Review",
  "Training",
  "Town hall",
  "Offsite",
  "Celebration",
  "Other",
];

const PRIORITIES = ["High", "Medium", "Low"];
const MODES = ["In-person", "Hybrid", "Virtual"];
const VISIBILITY_OPTIONS = ["Branch only", "All branches", "Company-wide", "Private"];
const BRANCHES = ["Rajouri Garden", "Pitampura", "Noida Sector 18", "Gurugram"];

const BRANCH_STAFF = {
  "Rajouri Garden": ["Priya Sharma", "Rahul Verma", "Anjali Gupta"],
  Pitampura: ["Aditya Sharma", "Sana Iqbal"],
  "Noida Sector 18": ["Dev Malhotra", "Ishaan Roy"],
  Gurugram: ["Neha Kapoor", "Karan Mehta"],
};

const CLIENTS = ["Sethi Family", "Agarwal Family", "Malhotra Family", "Kapoor Family", "Mehta Family"];

const REMINDER_CHANNELS = ["Email", "WhatsApp", "SMS", "In-app"];

const DURATION_OPTIONS = ["30 minutes", "1 hour", "2 hours", "3 hours", "5 hours", "Full day"];
const DURATION_MINUTES = {
  "30 minutes": 30,
  "1 hour": 60,
  "2 hours": 120,
  "3 hours": 180,
  "5 hours": 300,
};

const MESSAGE_TEMPLATES = [
  "No template — plain text",
  "Standard reminder",
  "Warm client nudge",
  "Payment follow-up",
  "Short SMS one-liner",
];

const REMINDER_FREQUENCIES = ["Every day till event", "On day of event", "2 hours before", "Week before"];

const VENDOR_OPTIONS = ["Catering", "Decor / florals", "Photography", "Sound & lighting", "Transport for guests"];

const INPUT =
  "w-full h-10 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40 transition-colors";

const PILL_ACTIVE = "border-[#E8395B]/50 text-[#E8395B] bg-[#FDECEE]";
const PILL_IDLE = "border-black/10 text-[#4B5563] hover:bg-[#FAFAFB]";

function computeEndTime(startTime, durationLabel) {
  if (!startTime || !durationLabel) return "";
  if (durationLabel === "Full day") return "All day";
  const mins = DURATION_MINUTES[durationLabel];
  if (mins == null) return "";
  const [h, m] = startTime.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return "";
  let total = (h * 60 + m + mins) % (24 * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  const period = hh >= 12 ? "PM" : "AM";
  let hh12 = hh % 12;
  if (hh12 === 0) hh12 = 12;
  return `${hh12}:${String(mm).padStart(2, "0")} ${period}`;
}

function emptyForm(defaultDate) {
  const dateStr = defaultDate
    ? `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, "0")}-${String(defaultDate.getDate()).padStart(2, "0")}`
    : "";
  return {
    title: "",
    category: "Internal meeting",
    priority: "High",
    mode: "In-person",
    visibility: "Branch only",
    venue: "",
    logisticsRequired: false,
    branches: [],
    employees: [],
    clients: [],
    startDate: dateStr,
    endDate: dateStr,
    startTime: "18:00",
    duration: "5 hours",
    reminderChannels: ["Email", "WhatsApp"],
    messageTemplate: "No template — plain text",
    reminderFrequency: "On day of event",
    vendors: [],
    attachment: "",
    referenceLink: "",
    specialInstructions: "",
  };
}

function Field({ label, required, children, danger, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <p className={`text-[12.5px] font-semibold ${danger ? "text-[#E8395B]" : "text-[#374151]"}`}>
          {label}
          {required ? <span className="text-[#E8395B]"> *</span> : null}
        </p>
      ) : null}
      {hint ? <p className="text-[11.5px] text-[#9CA3AF] -mt-1">{hint}</p> : null}
      {children}
    </div>
  );
}

function Pill({ active, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 px-4 rounded-xl border text-[13px] font-semibold transition-colors ${
        active ? PILL_ACTIVE : PILL_IDLE
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default function CreateEventModal({ open, onClose, onSave, defaultDate, initial = null, mode = "create" }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(() => emptyForm(defaultDate));

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({ ...emptyForm(defaultDate), ...initial });
      return;
    }
    setForm(emptyForm(defaultDate));
    // Seed once per open so parent re-renders don't reset in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (field) => (val) => setForm((f) => ({ ...f, [field]: val }));

  const toggleInArray = (field) => (val) =>
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter((x) => x !== val) : [...f[field], val],
    }));

  const toggleBranch = (branch) => {
    setForm((f) => ({
      ...f,
      branches: f.branches.includes(branch) ? f.branches.filter((b) => b !== branch) : [...f.branches, branch],
    }));
  };

  const pooledEmployees = useMemo(() => {
    const source = form.branches.length ? form.branches : BRANCHES;
    return [...new Set(source.flatMap((b) => BRANCH_STAFF[b] || []))];
  }, [form.branches]);

  const addEmployee = (name) => {
    if (name === "__all__") {
      set("employees")([...new Set([...form.employees, ...pooledEmployees])]);
      return;
    }
    if (name && !form.employees.includes(name)) set("employees")([...form.employees, name]);
  };
  const addBranchStaff = (branch) => {
    const names = BRANCH_STAFF[branch] || [];
    set("employees")([...new Set([...form.employees, ...names])]);
  };
  const removeEmployee = (name) => set("employees")(form.employees.filter((e) => e !== name));

  const [clientQuery, setClientQuery] = useState("");
  const clientMatches = useMemo(
    () =>
      clientQuery.trim()
        ? CLIENTS.filter(
            (c) => c.toLowerCase().includes(clientQuery.trim().toLowerCase()) && !form.clients.includes(c)
          )
        : [],
    [clientQuery, form.clients]
  );
  const addClient = (name) => {
    if (!form.clients.includes(name)) set("clients")([...form.clients, name]);
    setClientQuery("");
  };
  const removeClient = (name) => set("clients")(form.clients.filter((c) => c !== name));

  const endTimeDisplay = computeEndTime(form.startTime, form.duration);

  const reminderHint = form.reminderChannels.length
    ? `Host team and invited families are reminded on ${form.reminderChannels.join(" + ")}.`
    : "Select at least one channel to notify invitees.";

  const handleClose = () => {
    setForm(emptyForm(defaultDate));
    setClientQuery("");
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Event title is required.");
      return;
    }
    if (!form.venue.trim()) {
      toast.error("Venue / location is required.");
      return;
    }
    if (form.employees.length === 0) {
      toast.error("Add at least one host-team member before creating.");
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error("Start date and end date are required.");
      return;
    }
    if (form.reminderChannels.length === 0) {
      toast.error("Select at least one reminder channel.");
      return;
    }

    onSave?.({ ...form, endTime: endTimeDisplay });
    toast.success(isEdit ? "Event updated successfully." : "Event created successfully.");
    setForm(emptyForm(defaultDate));
    setClientQuery("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? "Edit Event" : "Create Event"}
      subtitle="An internal event — review, training, town hall or offsite"
      icon={<ClipboardList size={16} />}
      iconBg="#FDECEE"
      iconColor="#E8395B"
      width="max-w-[640px]"
      footer={
        <div className="flex items-center justify-between gap-3 w-full">
          <p className="text-[11.5px] text-[#9CA3AF]">
            {form.employees.length === 0 ? "Add at least one host-team member before creating." : ""}
          </p>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="h-9 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="create-event-form"
              className="h-9 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              {isEdit ? "Save" : "Create Event"}
            </button>
          </div>
        </div>
      }
    >
      <form id="create-event-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Event Title" required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title")(e.target.value)}
            placeholder="e.g. Q3 branch review — Delhi NCR"
            className={INPUT}
          />
        </Field>

        <Field label="Event Category" required>
          <select value={form.category} onChange={(e) => set("category")(e.target.value)} className={INPUT}>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Priority" required>
          <div className="grid grid-cols-3 gap-2.5">
            {PRIORITIES.map((p) => (
              <Pill key={p} active={form.priority === p} onClick={() => set("priority")(p)} className="w-full">
                {p}
              </Pill>
            ))}
          </div>
        </Field>

        <Field label="Event Mode" required>
          <div className="flex items-center gap-2.5 flex-wrap">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => set("mode")(m)}
                className={`h-9 px-4 rounded-full border text-[13px] font-semibold transition-colors ${
                  form.mode === m ? PILL_ACTIVE : PILL_IDLE
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Visibility">
          <select value={form.visibility} onChange={(e) => set("visibility")(e.target.value)} className={INPUT}>
            {VISIBILITY_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Venue / Location" required>
          <input
            type="text"
            value={form.venue}
            onChange={(e) => set("venue")(e.target.value)}
            placeholder="Banquet name, address or maps link"
            className={INPUT}
          />
        </Field>

        <label className="flex items-center gap-2 cursor-pointer -mt-1">
          <input
            type="checkbox"
            checked={form.logisticsRequired}
            onChange={(e) => set("logisticsRequired")(e.target.checked)}
            className="size-3.5 accent-[#7A0A17]"
          />
          <span className="text-[13px] text-[#374151]">Company vehicle / logistics booking required</span>
        </label>

        <Field
          label="Employees Invited"
          required
          hint="Pick any number of branches — the employee list pools across all of them."
        >
          <div className="flex items-center gap-2.5 flex-wrap">
            {BRANCHES.map((b) => (
              <div key={b} className="relative">
                <button
                  type="button"
                  onClick={() => toggleBranch(b)}
                  className={`h-9 px-4 rounded-full border text-[13px] font-semibold transition-colors ${
                    form.branches.includes(b) ? PILL_ACTIVE : PILL_IDLE
                  }`}
                >
                  {b}
                </button>
                {form.branches.includes(b) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      addBranchStaff(b);
                    }}
                    className="absolute -right-2 -top-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-[#E8395B] text-white"
                  >
                    + all
                  </button>
                )}
              </div>
            ))}
          </div>

          <select
            defaultValue=""
            onChange={(e) => {
              addEmployee(e.target.value);
              e.target.value = "";
            }}
            className={`${INPUT} text-[#9CA3AF] mt-2`}
          >
            <option value="" disabled hidden>
              Add an employee...
            </option>
            <option value="__all__" className="text-[#111] font-semibold">
              All
            </option>
            {pooledEmployees
              .filter((e) => !form.employees.includes(e))
              .map((e) => (
                <option key={e} value={e} className="text-[#111]">
                  {e}
                </option>
              ))}
          </select>
          {form.employees.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.employees.map((e) => (
                <span
                  key={e}
                  className="inline-flex items-center gap-1.5 bg-[#F1F2F4] text-[#111] text-[12.5px] font-medium rounded-lg px-2.5 py-1"
                >
                  {e}
                  <button type="button" onClick={() => removeEmployee(e)} className="text-[#9CA3AF] hover:text-[#E8395B]">
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <Field label="Clients / Families Invited">
          <div className="relative">
            <div className={`${INPUT} flex items-center gap-2 pr-3`}>
              <Search size={14} className="text-[#9CA3AF] shrink-0" />
              <input
                type="text"
                value={clientQuery}
                onChange={(e) => setClientQuery(e.target.value)}
                placeholder="Search a client..."
                className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-[#111] placeholder:text-[#9CA3AF]"
              />
            </div>
            {clientMatches.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-black/10 bg-white shadow-lg overflow-hidden">
                {clientMatches.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => addClient(c)}
                    className="w-full text-left px-3.5 py-2 text-[13px] text-[#111] hover:bg-[#FAFAFB]"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
          {form.clients.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.clients.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 bg-[#F1F2F4] text-[#111] text-[12.5px] font-medium rounded-lg px-2.5 py-1"
                >
                  {c}
                  <button type="button" onClick={() => removeClient(c)} className="text-[#9CA3AF] hover:text-[#E8395B]">
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date" required>
            <input type="date" value={form.startDate} onChange={(e) => set("startDate")(e.target.value)} className={INPUT} />
          </Field>
          <Field label="End Date" required>
            <input type="date" value={form.endDate} onChange={(e) => set("endDate")(e.target.value)} className={INPUT} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Time">
            <input type="time" value={form.startTime} onChange={(e) => set("startTime")(e.target.value)} className={INPUT} />
          </Field>
          <Field label="Duration">
            <select value={form.duration} onChange={(e) => set("duration")(e.target.value)} className={INPUT}>
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="End Time" hint="set automatically from start time + duration">
          <input
            type="text"
            readOnly
            value={endTimeDisplay}
            placeholder="—"
            className={`${INPUT} bg-[#FAFAFB] text-[#6B7280]`}
          />
        </Field>

        <Field label="Send Reminders Via" required hint={reminderHint}>
          <div className="flex items-center gap-2.5 flex-wrap">
            {REMINDER_CHANNELS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleInArray("reminderChannels")(c)}
                className={`h-9 px-4 rounded-full border text-[13px] font-semibold transition-colors ${
                  form.reminderChannels.includes(c) ? PILL_ACTIVE : PILL_IDLE
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Message template">
          <div className="flex items-center gap-2">
            <select
              value={form.messageTemplate}
              onChange={(e) => set("messageTemplate")(e.target.value)}
              className={`${INPUT} flex-1`}
            >
              {MESSAGE_TEMPLATES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => toast.info("AI message drafting is coming soon.")}
              className="h-10 px-3.5 rounded-xl border border-[#E8395B]/40 text-[#E8395B] text-[12.5px] font-semibold inline-flex items-center gap-1.5 whitespace-nowrap hover:bg-[#FDECEE]"
            >
              <Sparkles size={14} /> Make with AI
            </button>
          </div>
          <p className="text-[11.5px] text-[#9CA3AF]">Message body is composed from the entry title, date and time.</p>
        </Field>

        <Field label="Reminder Frequency">
          <div className="flex items-center gap-2.5 flex-wrap">
            {REMINDER_FREQUENCIES.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => set("reminderFrequency")(f)}
                className={`h-9 px-3.5 rounded-full border text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
                  form.reminderFrequency === f ? PILL_ACTIVE : PILL_IDLE
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Vendors & Arrangements">
          <div className="flex flex-col gap-2">
            {VENDOR_OPTIONS.map((v) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.vendors.includes(v)}
                  onChange={() => toggleInArray("vendors")(v)}
                  className="size-3.5 accent-[#7A0A17]"
                />
                <span className="text-[13px] text-[#374151]">{v}</span>
              </label>
            ))}
          </div>
        </Field>

        <Field label="Attachments">
          <div className="flex items-center">
            <input
              type="text"
              value={form.attachment}
              readOnly
              placeholder="Select file"
              className={`${INPUT} flex-1 rounded-r-none bg-[#FAFAFB]`}
            />
            <label className="h-10 px-4 rounded-r-xl border border-l-0 border-black/10 inline-flex items-center text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] cursor-pointer whitespace-nowrap">
              Browse
              <input
                type="file"
                className="hidden"
                onChange={(e) => set("attachment")(e.target.files?.[0]?.name ?? "")}
              />
            </label>
          </div>
          <input
            type="text"
            value={form.referenceLink}
            onChange={(e) => set("referenceLink")(e.target.value)}
            placeholder="Paste a reference link — run sheet, guest list"
            className={`${INPUT} mt-2`}
          />
        </Field>

        <Field label="Special Instructions" danger>
          <textarea
            rows={3}
            value={form.specialInstructions}
            onChange={(e) => set("specialInstructions")(e.target.value)}
            placeholder="e.g. Staff to reach two hours before guests; carry branded backdrop"
            className={`${INPUT} h-auto py-2.5 resize-none`}
          />
        </Field>
      </form>
    </Modal>
  );
}
