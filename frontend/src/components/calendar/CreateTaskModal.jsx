import { useEffect, useMemo, useRef, useState } from "react";
import { CheckSquare, Plus, Search, Sparkles, X } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";

const BRANCHES = ["Rajouri Garden", "Pitampura", "Noida Sector 18", "Gurugram"];

const BRANCH_STAFF = {
  "Rajouri Garden": [
    { name: "Priya Sharma", load: 9 },
    { name: "Rahul Verma", load: 4 },
    { name: "Anjali Gupta", load: 7 },
  ],
  Pitampura: [
    { name: "Aditya Sharma", load: 6 },
    { name: "Sana Iqbal", load: 3 },
  ],
  "Noida Sector 18": [
    { name: "Dev Malhotra", load: 5 },
    { name: "Ishaan Roy", load: 8 },
  ],
  Gurugram: [
    { name: "Neha Kapoor", load: 2 },
    { name: "Karan Mehta", load: 6 },
  ],
};

const TASK_CLIENTS = [
  "Sethi Family",
  "Agarwal Family",
  "Malhotra Family",
  "Kapoor Family",
  "Mehta Family",
  "Rajouri Family",
  "Sharma Family",
  "Gupta Family",
  "Verma Family",
  "Nair Family",
  "Bansal Family",
];

const PRIORITIES = ["High", "Medium", "Low"];
const PRIORITY_STARS = { High: 10, Medium: 7, Low: 3 };
const TASK_TYPES = ["Follow-up call", "Client visit", "Documentation", "Payment", "Internal"];

const TASK_DESCRIPTIONS = [
  "Follow up on pending response",
  "Payment collection",
  "Document / KYC collection",
  "Send proposal or package",
  "Profile shortlisting",
  "Venue or vendor coordination",
  "Schedule a meeting with client",
  "Feedback / review call",
  "Others...",
];

const REPEAT_OPTIONS = ["Does not repeat", "Daily", "Every weekday", "Weekly", "Monthly"];
const EFFORT_OPTIONS = ["15 mins", "30 mins", "45 mins", "1 hour", "2 hours"];
const REMINDER_CHANNELS = ["Email", "WhatsApp", "SMS", "In-app"];
const REMINDER_FREQUENCIES = ["Every day till due", "On day of task", "1 hour before", "On overdue"];
const REMINDER_UNITS = ["minutes before", "hours before", "days before"];
const MESSAGE_TEMPLATES = [
  "No template — plain text",
  "Standard reminder",
  "Warm client nudge",
  "Payment follow-up",
  "Short SMS one-liner",
];

const INPUT =
  "w-full h-10 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40 transition-colors";

const PILL_ACTIVE = "border-[#E8395B]/50 text-[#E8395B] bg-[#FDECEE]";
const PILL_IDLE = "border-black/10 text-[#4B5563] hover:bg-[#FAFAFB]";

function toIsoDate(d) {
  const date = d instanceof Date ? d : new Date();
  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDaysIso(iso, n) {
  const [y, m, d] = String(iso || "").split("-").map(Number);
  const date = y && m && d ? new Date(y, m - 1, d) : new Date();
  date.setDate(date.getDate() + n);
  return toIsoDate(date);
}

function staffForBranch(branch) {
  return BRANCH_STAFF[branch] || BRANCH_STAFF["Rajouri Garden"];
}

function lightestRep(branch) {
  const staff = staffForBranch(branch);
  return [...staff].sort((a, b) => a.load - b.load)[0]?.name || staff[0]?.name || "";
}

function Field({ label, required, children, danger, hint, extra }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <div className="flex items-center justify-between gap-2">
          <p className={`text-[12.5px] font-semibold ${danger ? "text-[#E8395B]" : "text-[#374151]"}`}>
            {label}
            {required ? <span className="text-[#E8395B]"> *</span> : null}
          </p>
          {extra}
        </div>
      ) : null}
      {children}
      {hint ? <p className="text-[11.5px] text-[#9CA3AF]">{hint}</p> : null}
    </div>
  );
}

function PillButton({ active, onClick, children, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-xl border text-[13px] font-semibold transition-colors ${
        active ? PILL_ACTIVE : PILL_IDLE
      } ${className}`}
    >
      {children}
    </button>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#F1F2F4] text-[#111] text-[12.5px] font-medium rounded-lg px-2.5 py-1">
      {label}
      {onRemove ? (
        <button type="button" onClick={onRemove} className="text-[#9CA3AF] hover:text-[#E8395B]">
          ×
        </button>
      ) : null}
    </span>
  );
}

function emptyTaskForm(defaultDate) {
  const startDate = toIsoDate(defaultDate || new Date());
  return {
    title: "",
    description: "Follow up on pending response",
    customDescription: "",
    priority: "Low",
    taskType: "Client visit",
    branch: "Rajouri Garden",
    assignees: [],
    isClientRelated: true,
    client: "",
    startDate,
    dueDate: addDaysIso(startDate, 1),
    dueTime: "11:00",
    estimatedEffort: "30 mins",
    repeats: "Does not repeat",
    stars: PRIORITY_STARS.Low,
    reminderChannels: ["Email", "WhatsApp"],
    messageTemplate: "No template — plain text",
    messageBody: "",
    reminderFrequency: ["On day of task"],
    customReminders: [],
    checklist: [],
    attachment: "",
    referenceLink: "",
    specialInstructions: "",
    stage: "New",
  };
}

function normalizeInitial(defaultDate, initial) {
  const base = emptyTaskForm(defaultDate);
  if (!initial) return base;
  const merged = { ...base, ...initial };
  if (merged.priority === "Critical") merged.priority = "High";
  if (!PRIORITIES.includes(merged.priority)) merged.priority = "Low";
  if (!TASK_TYPES.includes(merged.taskType)) merged.taskType = "Client visit";
  if (!BRANCHES.includes(merged.branch)) merged.branch = "Rajouri Garden";
  if (!merged.description) merged.description = "Follow up on pending response";
  if (!Array.isArray(merged.assignees)) merged.assignees = merged.assignees ? [merged.assignees] : [];
  if (!Array.isArray(merged.reminderChannels) || merged.reminderChannels.length === 0) {
    merged.reminderChannels = ["Email", "WhatsApp"];
  }
  if (Array.isArray(merged.reminderFrequency)) {
    merged.reminderFrequency = merged.reminderFrequency.filter(Boolean);
  } else if (merged.reminderFrequency) {
    merged.reminderFrequency = [merged.reminderFrequency];
  } else {
    merged.reminderFrequency = ["On day of task"];
  }
  if (!Array.isArray(merged.customReminders)) merged.customReminders = [];
  const presets = TASK_DESCRIPTIONS.filter((d) => d !== "Others...");
  if (merged.description && !presets.includes(merged.description) && merged.description !== "Others...") {
    merged.customDescription = merged.customDescription || merged.description;
    merged.description = "Others...";
  }
  if (!Array.isArray(merged.checklist)) merged.checklist = [];
  merged.checklist = merged.checklist
    .map((item) => (typeof item === "string" ? { text: item, done: false } : item))
    .filter((item) => item?.text);
  if (merged.stars == null) merged.stars = PRIORITY_STARS[merged.priority] ?? 3;
  return merged;
}

function resolvedTaskDescription(form) {
  if (!form) return "";
  if (form.description === "Others...") return (form.customDescription || "").trim();
  return form.description || "";
}

export default function CreateTaskModal({ open, onClose, onSave, defaultDate, initial = null, mode = "create" }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(() => emptyTaskForm(defaultDate));
  const [clientQuery, setClientQuery] = useState("");
  const [clientOpen, setClientOpen] = useState(false);
  const [checklistDraft, setChecklistDraft] = useState("");
  const [reminderAmount, setReminderAmount] = useState("30");
  const [reminderUnit, setReminderUnit] = useState("minutes before");
  const clientRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm(normalizeInitial(defaultDate, initial));
    setClientQuery(initial?.client || "");
    setClientOpen(false);
    setChecklistDraft("");
    setReminderAmount("30");
    setReminderUnit("minutes before");
    // Seed once per open so parent re-renders don't reset in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!clientRef.current?.contains(e.target)) setClientOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const set = (field) => (val) => setForm((s) => ({ ...s, [field]: val }));

  const toggleInArray = (field) => (val) =>
    setForm((s) => ({
      ...s,
      [field]: s[field].includes(val) ? s[field].filter((x) => x !== val) : [...s[field], val],
    }));

  const branchStaff = staffForBranch(form.branch);
  const employeeOptions = branchStaff
    .map((s) => s.name)
    .filter((name) => !(form.assignees ?? []).includes(name));

  const clientMatches = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    return TASK_CLIENTS.filter((c) => (!q || c.toLowerCase().includes(q)) && c !== form.client);
  }, [clientQuery, form.client]);

  const reminderHint = form.reminderChannels.length
    ? `Assignees are notified on ${form.reminderChannels.join(" + ")} when the task is created and at every reminder.`
    : "Select at least one channel to notify assignees.";

  const handleClose = () => {
    setForm(emptyTaskForm(defaultDate));
    setClientQuery("");
    setChecklistDraft("");
    onClose();
  };

  const setPriority = (priority) => {
    setForm((s) => ({
      ...s,
      priority,
      stars: s.stars === PRIORITY_STARS[s.priority] ? PRIORITY_STARS[priority] : s.stars,
    }));
  };

  const addEmployee = (name) => {
    if (!name) return;
    setForm((s) => (s.assignees.includes(name) ? s : { ...s, assignees: [...s.assignees, name] }));
  };

  const autoAssign = () => {
    const name = lightestRep(form.branch);
    if (!name) return;
    setForm((s) => ({ ...s, assignees: [name] }));
    toast.success(`Assigned to ${name} (lightest load in ${form.branch}).`);
  };

  const pickClient = (name) => {
    set("client")(name);
    setClientQuery(name);
    setClientOpen(false);
  };

  const addChecklistItem = () => {
    const text = checklistDraft.trim();
    if (!text) return;
    setForm((s) => ({ ...s, checklist: [...s.checklist, { text, done: false }] }));
    setChecklistDraft("");
  };

  const addCustomReminder = () => {
    const amount = String(reminderAmount).trim();
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a reminder amount.");
      return;
    }
    const labelText = `${amount} ${reminderUnit}`;
    if ((form.customReminders || []).includes(labelText)) return;
    set("customReminders")([...(form.customReminders || []), labelText]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter a task title.");
      return;
    }
    if (form.isClientRelated && !form.client) {
      toast.error("Please select a client.");
      return;
    }
    if (!form.assignees.length) {
      toast.error("Assign at least one employee before saving.");
      return;
    }
    const description = resolvedTaskDescription(form);
    if (!description) {
      toast.error("Please add a task description.");
      return;
    }
    if (!form.startDate || !form.dueDate) {
      toast.error("Start date and due date are required.");
      return;
    }
    if (form.dueDate < form.startDate) {
      toast.error("Due date cannot be before the start date.");
      return;
    }
    if (!form.reminderChannels.length) {
      toast.error("Select at least one reminder channel.");
      return;
    }

    onSave?.({
      ...form,
      description,
      client: form.isClientRelated ? form.client : "",
    });
    toast.success(isEdit ? "Task updated successfully." : "Task assigned successfully.");
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? "Edit Task" : "Create Task"}
      subtitle="Assign work with a due date and reminders"
      icon={<CheckSquare size={16} />}
      iconBg="#FDECEE"
      iconColor="#E8395B"
      width="max-w-[640px]"
      footer={
        <div className="flex items-center justify-between gap-3 w-full">
          <p className="text-[11.5px] text-[#9CA3AF]">
            {form.assignees.length === 0 ? "Assign at least one employee before saving." : ""}
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
              form="create-task-form"
              className="h-9 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              {isEdit ? "Save Task" : "Assign Task"}
            </button>
          </div>
        </div>
      }
    >
      <form id="create-task-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Is the task related to a client?" required>
          <div className="flex items-center gap-2.5">
            {["Yes", "No"].map((opt) => {
              const active = form.isClientRelated === (opt === "Yes");
              return (
                <PillButton
                  key={opt}
                  active={active}
                  className="px-7"
                  onClick={() => {
                    const related = opt === "Yes";
                    setForm((s) => ({
                      ...s,
                      isClientRelated: related,
                      client: related ? s.client : "",
                    }));
                    if (!related) setClientQuery("");
                  }}
                >
                  {opt}
                </PillButton>
              );
            })}
          </div>
        </Field>

        <Field label="Task Title" required>
          <input
            value={form.title}
            onChange={(e) => set("title")(e.target.value)}
            placeholder="e.g. Collect balance payment - Gupta family"
            className={INPUT}
          />
        </Field>

        <Field label="Priority" required>
          <div className="grid grid-cols-3 gap-2.5">
            {PRIORITIES.map((p) => (
              <PillButton key={p} active={form.priority === p} onClick={() => setPriority(p)}>
                {p}
              </PillButton>
            ))}
          </div>
        </Field>

        <Field label="Task Type" required>
          <div className="flex items-center gap-2 flex-wrap">
            {TASK_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => set("taskType")(type)}
                className={`h-9 px-3.5 rounded-full border text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
                  form.taskType === type ? PILL_ACTIVE : PILL_IDLE
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Assign To" required>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <p className="text-[12px] text-[#9CA3AF]">Branch</p>
              <select
                value={form.branch}
                onChange={(e) => {
                  const branch = e.target.value;
                  const allowed = staffForBranch(branch).map((s) => s.name);
                  setForm((s) => ({
                    ...s,
                    branch,
                    assignees: s.assignees.filter((name) => allowed.includes(name)),
                  }));
                }}
                className={INPUT}
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[12px] text-[#9CA3AF]">Employee</p>
              <select
                value=""
                onChange={(e) => {
                  addEmployee(e.target.value);
                  e.target.value = "";
                }}
                className={`${INPUT} ${employeeOptions.length ? "text-[#111]" : "text-[#9CA3AF]"}`}
              >
                <option value="" disabled>
                  Add an employee...
                </option>
                {employeeOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {(form.assignees ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {form.assignees.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 bg-[#F1F2F4] text-[#111] text-[12.5px] font-medium rounded-lg px-2.5 py-1"
                >
                  {name}
                  <button
                    type="button"
                    onClick={() => set("assignees")(form.assignees.filter((n) => n !== name))}
                    className="text-[#9CA3AF] hover:text-[#E8395B]"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={autoAssign}
            className="self-start text-[12.5px] font-semibold text-[#E8395B] hover:underline text-left"
          >
            Auto-assign to the lightest-loaded rep in this branch
          </button>
        </Field>

        {form.isClientRelated && (
          <Field label="Client" required>
            <div ref={clientRef} className="relative">
              <div className={`${INPUT} flex items-center gap-2 pr-3`}>
                <Search size={14} className="text-[#9CA3AF] shrink-0" />
                <input
                  value={clientQuery}
                  onChange={(e) => {
                    setClientQuery(e.target.value);
                    setClientOpen(true);
                    if (form.client && e.target.value !== form.client) set("client")("");
                  }}
                  onFocus={() => setClientOpen(true)}
                  placeholder="Search a client..."
                  className="flex-1 min-w-0 bg-transparent outline-none text-[13px] text-[#111] placeholder:text-[#9CA3AF]"
                />
              </div>
              {clientOpen && clientMatches.length > 0 && (
                <div className="absolute z-20 mt-1 w-full rounded-xl border border-black/10 bg-white shadow-lg overflow-hidden max-h-52 overflow-y-auto">
                  {clientMatches.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => pickClient(c)}
                      className="w-full text-left px-3.5 py-2 text-[13px] text-[#111] hover:bg-[#FAFAFB]"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>
        )}

        <Field label="Task Description" required>
          <select
            value={form.description}
            onChange={(e) => set("description")(e.target.value)}
            className={INPUT}
          >
            {TASK_DESCRIPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          {form.description === "Others..." && (
            <textarea
              rows={3}
              value={form.customDescription}
              onChange={(e) => set("customDescription")(e.target.value)}
              placeholder="Describe the task..."
              className={`${INPUT} h-auto py-2.5 resize-none mt-2`}
            />
          )}
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date" required>
            <input type="date" value={form.startDate} onChange={(e) => set("startDate")(e.target.value)} className={INPUT} />
          </Field>
          <Field label="Due Date" required>
            <input type="date" value={form.dueDate} onChange={(e) => set("dueDate")(e.target.value)} className={INPUT} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Due Time">
            <input type="time" value={form.dueTime} onChange={(e) => set("dueTime")(e.target.value)} className={INPUT} />
          </Field>
          <Field label="Estimated Effort">
            <select value={form.estimatedEffort} onChange={(e) => set("estimatedEffort")(e.target.value)} className={INPUT}>
              {EFFORT_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Repeats">
          <select value={form.repeats} onChange={(e) => set("repeats")(e.target.value)} className={`${INPUT} max-w-[280px]`}>
            {REPEAT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </Field>

        <Field
          label="Assign Stars (xp)"
          required
          extra={
            <button
              type="button"
              onClick={() => set("stars")(PRIORITY_STARS[form.priority])}
              className="text-[12px] font-semibold text-[#E8395B] hover:underline"
            >
              Use priority default ({PRIORITY_STARS[form.priority]})
            </button>
          }
        >
          <input
            type="number"
            min={0}
            value={form.stars}
            onChange={(e) => set("stars")(Number(e.target.value))}
            className={INPUT}
          />
          <div className="rounded-xl border border-black/8 bg-[#FAFAFB] px-3.5 py-3 text-[12.5px] text-[#6B7280] leading-relaxed mt-1">
            <p className="font-semibold text-[#374151] mb-1">Selection criteria</p>
            Stars are credited only if the task is completed within the due date
            <br />
            High priority — 10 stars
            <br />
            Medium priority — 7 stars
            <br />
            Low priority — 3 stars
            <br />
            No stars after the due date
          </div>
        </Field>

        <Field label="Send Reminders Via" required hint={reminderHint}>
          <div className="flex items-center gap-2 flex-wrap">
            {REMINDER_CHANNELS.map((ch) => (
              <button
                key={ch}
                type="button"
                onClick={() => toggleInArray("reminderChannels")(ch)}
                className={`h-9 px-4 rounded-full border text-[13px] font-semibold transition-colors ${
                  form.reminderChannels.includes(ch) ? PILL_ACTIVE : PILL_IDLE
                }`}
              >
                {ch}
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
          <div className="flex flex-wrap gap-2">
            {REMINDER_FREQUENCIES.map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => toggleInArray("reminderFrequency")(freq)}
                className={`h-9 px-3.5 rounded-full border text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
                  (form.reminderFrequency || []).includes(freq) ? PILL_ACTIVE : PILL_IDLE
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <input
              type="number"
              min="1"
              value={reminderAmount}
              onChange={(e) => setReminderAmount(e.target.value)}
              className="w-[72px] h-10 px-3 rounded-xl bg-white border border-black/10 text-[13px] outline-none focus:border-[#7A0A17]/40"
            />
            <select
              value={reminderUnit}
              onChange={(e) => setReminderUnit(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white border border-black/10 text-[13px] outline-none focus:border-[#7A0A17]/40"
            >
              {REMINDER_UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addCustomReminder}
              className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712]"
            >
              Add reminder
            </button>
          </div>
          {(form.customReminders || []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.customReminders.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  onRemove={() =>
                    set("customReminders")(form.customReminders.filter((x) => x !== item))
                  }
                />
              ))}
            </div>
          )}
        </Field>

        <Field label="Checklist">
          <div className="flex items-center gap-2">
            <input
              value={checklistDraft}
              onChange={(e) => setChecklistDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addChecklistItem();
                }
              }}
              placeholder="Add a step — e.g. Call before reaching"
              className={`${INPUT} flex-1`}
            />
            <button
              type="button"
              onClick={addChecklistItem}
              className="size-10 shrink-0 rounded-xl bg-[#FDECEE] text-[#E8395B] grid place-items-center hover:bg-[#FADDE3]"
            >
              <Plus size={18} />
            </button>
          </div>
          {form.checklist.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              {form.checklist.map((item, idx) => (
                <div
                  key={`${item.text}-${idx}`}
                  className="flex items-center justify-between gap-2 rounded-xl border border-black/8 px-3 py-2"
                >
                  <p className="text-[13px] text-[#374151]">{item.text}</p>
                  <button
                    type="button"
                    onClick={() => set("checklist")(form.checklist.filter((_, i) => i !== idx))}
                    className="text-[#9CA3AF] hover:text-[#E8395B]"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
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
            placeholder="Paste a reference link"
            className={`${INPUT} mt-2`}
          />
        </Field>

        <Field label="Special Instructions" danger>
          <textarea
            rows={3}
            value={form.specialInstructions}
            onChange={(e) => set("specialInstructions")(e.target.value)}
            placeholder="e.g. Escalate to branch head if the client does not respond by 6 pm"
            className={`${INPUT} h-auto py-2.5 resize-y min-h-[72px]`}
          />
        </Field>
      </form>
    </Modal>
  );
}
