import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Image as ImageIcon, CalendarDays, Search, Sparkles, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";

const EMPLOYEES = [
  "Priya Sharma",
  "Aditya Sharma",
  "Rahul Verma",
  "Sana Iqbal",
  "Dev Malhotra",
  "Neha Kapoor",
];

const CLIENTS = [
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
];

const OTHERS = [
  "Anjali Gupta",
  "Abhinav Pandey",
  "Ankur Mishra",
  "External Vendor",
  "Guest Speaker",
];

const PROFILE_EMAILS = {
  "Priya Sharma": "priya.sharma@mmlcompany.com",
  "Aditya Sharma": "aditya.sharma@mmlcompany.com",
  "Rahul Verma": "rahul.verma@mmlcompany.com",
  "Sana Iqbal": "sana.iqbal@mmlcompany.com",
  "Dev Malhotra": "dev.malhotra@mmlcompany.com",
  "Neha Kapoor": "neha.kapoor@mmlcompany.com",
  "Sethi Family": "sethi.family@thecompany.com",
  "Agarwal Family": "agarwal.family@thecompany.com",
  "Malhotra Family": "malhotra.family@thecompany.com",
  "Kapoor Family": "kapoor.family@thecompany.com",
  "Mehta Family": "mehta.family@thecompany.com",
  "Rajouri Family": "rajouri.family@thecompany.com",
  "Sharma Family": "sharma.family@thecompany.com",
  "Gupta Family": "gupta.family@thecompany.com",
  "Verma Family": "verma.family@thecompany.com",
  "Nair Family": "nair.family@thecompany.com",
  "Anjali Gupta": "anjali.gupta@thecompany.com",
  "Abhinav Pandey": "abhinav.pandey@thecompany.com",
  "Ankur Mishra": "ankur@thecompany.com",
  "External Vendor": "vendor@thecompany.com",
  "Guest Speaker": "speaker@thecompany.com",
};

const INVITE_GROUPS = [
  { key: "all", label: "All" },
  { key: "others", label: "Others/External" },
  { key: "employees", label: "Employees" },
  { key: "client", label: "Client" },
];

const GROUP_KEYS = ["others", "employees", "client"];

const EVENT_TYPES = ["Community Event", "Training", "Celebration", "Holiday", "Workshop", "Other"];

const MEETING_DESCRIPTIONS = [
  "General / internal discussions",
  "Family meeting",
  "Home visit",
  "Office visit",
  "Video call / profile review",
  "Package negotiation",
  "Intake / profile collection",
  "Follow-up",
  "Shortlist review",
  "Payment / closing",
  "Team sync",
  "Introduction meeting",
  "Other",
];

const TYPE_OPTIONS = [
  { key: "video", label: "Virtual/Video" },
  { key: "telephonic", label: "Telephonic" },
  { key: "face", label: "Face to Face" },
];

const MEETING_TYPE_OPTIONS = [
  { key: "face", label: "Face to Face" },
  { key: "video", label: "Virtual / Online" },
  { key: "telephonic", label: "Telephone" },
];

const MEETING_WITH_OPTIONS = [
  { key: "employee", label: "Employee" },
  { key: "client", label: "Client" },
  { key: "others", label: "Others" },
];

const DURATION_OPTIONS = [
  "15 minutes",
  "30 minutes",
  "45 minutes",
  "1 hour",
  "1 hour 30 minutes",
  "2 hours",
  "3 hours",
];

const REMINDER_CHANNELS = [
  { key: "email", label: "Email" },
  { key: "whatsapp", label: "WhatsApp" },
  { key: "sms", label: "SMS" },
  { key: "inapp", label: "In-app" },
];

const REMINDER_FREQUENCIES = [
  { key: "every_day", label: "Every day till meeting" },
  { key: "on_day", label: "On day of meeting" },
  { key: "hour_before", label: "1 hour before" },
  { key: "every_15", label: "Every 15 minutes" },
];

const MESSAGE_TEMPLATES = [
  { key: "", label: "No template — plain text" },
  { key: "invitation", label: "Meeting invitation" },
  { key: "reminder", label: "Meeting reminder" },
  { key: "followup", label: "Follow-up reminder" },
];

const PRIORITIES = ["High", "Medium", "Low"];

const MEETING_REQUIREMENTS = ["Interview recording", "Transcripts", "Meeting notes"];

const NOTES_RECIPIENTS = ["All Participants", "Only Organizer"];

const REMINDER_UNITS = ["minutes before", "hours before", "days before"];

const INPUT =
  "w-full h-10 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40 transition-colors";

const PILL_ACTIVE = "border-[#E8395B]/50 text-[#E8395B] bg-[#FDECEE]";
const PILL_IDLE = "border-black/10 text-[#4B5563] hover:bg-[#FAFAFB]";

const emptyForm = {
  title: "",
  meetingWith: "client",
  inviteGroups: [],
  people: [],
  emails: [],
  emailIds: "",
  specialInstructions: "",
  notes: "",
  description: "",
  meetingType: "video",
  meetingTypes: [],
  meetingLink: "",
  venue: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  duration: "",
  reminderChannels: ["email"],
  messageTemplate: "",
  messageBody: "",
  reminderFrequency: ["on_day"],
  customReminders: [],
  priority: "High",
  attachment: "",
  referenceLink: "",
  referenceLinkDescription: "",
  requirements: [],
  notesTo: [],
};

function parseEmails(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || "")
    .split(/[;,]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

function durationToMinutes(duration) {
  const map = {
    "15 minutes": 15,
    "30 minutes": 30,
    "45 minutes": 45,
    "1 hour": 60,
    "1 hour 30 minutes": 90,
    "1.5 hours": 90,
    "2 hours": 120,
    "3 hours": 180,
  };
  if (map[duration]) return map[duration];
  const n = parseInt(String(duration), 10);
  if (String(duration).includes("hour")) return Number.isFinite(n) ? n * 60 : 60;
  return Number.isFinite(n) ? n : 60;
}

function normalizeDuration(duration) {
  if (!duration) return "1 hour";
  if (DURATION_OPTIONS.includes(duration)) return duration;
  const mins = durationToMinutes(duration);
  const match = DURATION_OPTIONS.find((opt) => durationToMinutes(opt) === mins);
  return match || "1 hour";
}

function addMinutesToTime(time, minutes) {
  const [h, m] = String(time || "10:00").split(":").map(Number);
  const total = ((h || 0) * 60 + (m || 0) + minutes + 24 * 60) % (24 * 60);
  const nh = Math.floor(total / 60);
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

function formatTime12(time) {
  const [h, m] = String(time || "11:00").split(":").map(Number);
  const hour = Number.isFinite(h) ? h : 11;
  const min = Number.isFinite(m) ? m : 0;
  const ampm = hour >= 12 ? "PM" : "AM";
  const h12 = hour % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(min).padStart(2, "0")} ${ampm}`;
}

function formatDateLabel(iso) {
  if (!iso) return "the scheduled date";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}-${m}-${y}`;
}

function deriveMeetingWith(inviteGroups = []) {
  if (inviteGroups.includes("client")) return "client";
  if (inviteGroups.includes("employees")) return "employee";
  if (inviteGroups.includes("others")) return "others";
  return "client";
}

function inviteGroupsFromPeople(people, meetingWith) {
  const groups = new Set();
  if (meetingWith === "employee") groups.add("employees");
  else if (meetingWith) groups.add(meetingWith);
  (people || []).forEach((p) => {
    if (CLIENTS.includes(p)) groups.add("client");
    if (EMPLOYEES.includes(p)) groups.add("employees");
    if (OTHERS.includes(p)) groups.add("others");
  });
  return [...groups];
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

function AttendeePicker({ group, people, onAdd, onRemove }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const config = {
    employee: { heading: "Employees — search or pick", placeholder: "Type an employee name...", options: EMPLOYEES },
    client: { heading: "Clients — search or pick", placeholder: "Type a client name...", options: CLIENTS },
    others: { heading: "Others — search or pick", placeholder: "Type a name...", options: OTHERS },
  }[group] || { heading: "Search or pick", placeholder: "Type a name...", options: [] };

  const matches = config.options.filter(
    (name) => name.toLowerCase().includes(query.trim().toLowerCase()) && !people.includes(name)
  );

  useEffect(() => {
    const onDoc = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (name) => {
    onAdd(name);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[12.5px] font-semibold text-[#374151]">Who is attending</p>
      <p className="text-[12px] text-[#9CA3AF]">{config.heading}</p>
      <div ref={rootRef} className="relative">
        <div className={`${INPUT} flex items-center gap-2 pr-3`}>
          <Search size={14} className="text-[#9CA3AF] shrink-0" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (matches[0]) pick(matches[0]);
              }
            }}
            placeholder={config.placeholder}
            className="flex-1 min-w-0 bg-transparent outline-none placeholder:text-[#9CA3AF]"
          />
          <ChevronDown size={15} className="text-[#9CA3AF] shrink-0" />
        </div>
        {open && (
          <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-xl border border-black/10 bg-white shadow-lg">
            {matches.length === 0 ? (
              <p className="px-3.5 py-2.5 text-[13px] text-[#9CA3AF]">No matches</p>
            ) : (
              matches.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => pick(name)}
                  className="w-full text-left px-3.5 py-2 text-[13px] text-[#111] hover:bg-[#FDECEE]"
                >
                  {name}
                </button>
              ))
            )}
          </div>
        )}
      </div>
      {people.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-1">
          {people.map((p) => (
            <Chip key={p} label={p} onRemove={() => onRemove(p)} />
          ))}
        </div>
      )}
      <p className="text-[11.5px] text-[#9CA3AF]">
        Add as many clients and employees as you need; a meeting can have both.
      </p>
    </div>
  );
}

export default function CreateMeetingEventModal({
  open,
  onClose,
  onSave,
  entityLabel = "Meeting",
  defaultDate,
  initial = null,
  mode = "create",
}) {
  const isEvent = entityLabel === "Event";
  const isEdit = mode === "edit";
  const label = entityLabel;
  const baseDescriptionOptions = EVENT_TYPES;
  const requirementOptions = ["Interview Recording", "Transcripts", `${label} Notes`];
  const notesRequirement = `${label} Notes`;
  const [form, setForm] = useState(emptyForm);
  const [emailDraft, setEmailDraft] = useState("");
  const [reminderAmount, setReminderAmount] = useState("30");
  const [reminderUnit, setReminderUnit] = useState("minutes before");

  const seedForm = () => {
    const dateStr = defaultDate
      ? `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, "0")}-${String(defaultDate.getDate()).padStart(2, "0")}`
      : "";

    if (initial) {
      const emails = parseEmails(initial.emails || initial.emailIds);
      const meetingType = initial.meetingType || initial.meetingTypes?.[0] || "video";
      setForm({
        ...emptyForm,
        ...initial,
        emails,
        emailIds: emails.join("; "),
        meetingType,
        meetingTypes: initial.meetingTypes?.length ? initial.meetingTypes : meetingType ? [meetingType] : [],
        meetingWith: initial.meetingWith || deriveMeetingWith(initial.inviteGroups),
        duration: isEvent ? initial.duration || "60 min" : normalizeDuration(initial.duration),
        reminderChannels: initial.reminderChannels?.length ? initial.reminderChannels : ["email"],
        reminderFrequency: initial.reminderFrequency?.length ? initial.reminderFrequency : ["on_day"],
        customReminders: initial.customReminders || [],
        priority: initial.priority || "High",
        referenceLink: initial.referenceLink || "",
        referenceLinkDescription: initial.referenceLinkDescription || "",
        messageTemplate: initial.messageTemplate || "",
        messageBody: initial.messageBody || "",
      });
      setEmailDraft("");
      return;
    }

    if (isEvent) {
      setForm({
        ...emptyForm,
        startDate: dateStr,
        endDate: dateStr,
        startTime: "10:00",
        endTime: "11:00",
        duration: "60 min",
        meetingType: "",
        reminderChannels: [],
        reminderFrequency: [],
        priority: "Medium",
      });
    } else {
      setForm({
        ...emptyForm,
        startDate: dateStr,
        endDate: dateStr,
        startTime: "10:00",
        duration: "1 hour",
        meetingWith: "client",
        description: "General / internal discussions",
        meetingType: "video",
        reminderChannels: ["email"],
        reminderFrequency: ["on_day"],
        priority: "High",
      });
    }
    setEmailDraft("");
    setReminderAmount("30");
    setReminderUnit("minutes before");
  };

  useEffect(() => {
    if (!open) return;
    seedForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultDate, initial, isEvent]);

  const computedEndTime = useMemo(
    () => addMinutesToTime(form.startTime || "10:00", durationToMinutes(form.duration || "1 hour")),
    [form.startTime, form.duration]
  );

  const recipientEmails = useMemo(() => {
    const fromPeople = (form.people || []).map((p) => PROFILE_EMAILS[p]).filter(Boolean);
    return [...new Set([...fromPeople, ...(form.emails || [])])];
  }, [form.people, form.emails]);

  const channelLabels = REMINDER_CHANNELS.filter((c) => form.reminderChannels.includes(c.key)).map((c) => c.label);
  const channelLabel = channelLabels.join(", ") || "Email";

  const descriptionOptions =
    form.description && !baseDescriptionOptions.includes(form.description)
      ? [form.description, ...baseDescriptionOptions]
      : baseDescriptionOptions;

  const meetingDescriptionOptions =
    form.description && !MEETING_DESCRIPTIONS.includes(form.description)
      ? [form.description, ...MEETING_DESCRIPTIONS]
      : MEETING_DESCRIPTIONS;

  const set = (field) => (val) => setForm((f) => ({ ...f, [field]: val }));

  const toggleInArray = (field) => (val) =>
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter((x) => x !== val) : [...f[field], val],
    }));

  const toggleInviteGroup = (key) => {
    setForm((f) => {
      let next = [...(f.inviteGroups || [])];
      if (key === "all") {
        const allOn = GROUP_KEYS.every((k) => next.includes(k));
        next = allOn ? [] : [...GROUP_KEYS];
      } else {
        next = next.includes(key) ? next.filter((x) => x !== key) : [...next, key];
        next = next.filter((x) => x !== "all");
      }
      return { ...f, inviteGroups: next };
    });
  };

  const inviteAllChecked = GROUP_KEYS.every((k) => form.inviteGroups.includes(k));

  const peopleOptions = [
    ...(form.inviteGroups.includes("others") ? OTHERS : []),
    ...(form.inviteGroups.includes("employees") ? EMPLOYEES : []),
    ...(form.inviteGroups.includes("client") ? CLIENTS : []),
  ].filter((v, i, arr) => arr.indexOf(v) === i);

  const addPerson = (name) => {
    if (name === "__all__") {
      set("people")([...new Set([...form.people, ...peopleOptions])]);
      return;
    }
    if (name && !form.people.includes(name)) set("people")([...form.people, name]);
  };

  const removePerson = (name) => set("people")(form.people.filter((p) => p !== name));

  const emailInputId = `calendar-${label.toLowerCase()}-email-${isEdit ? "edit" : "create"}`;
  const formId = `create-${label.toLowerCase()}-form`;

  const addEmailFromInput = () => {
    const input = document.getElementById(emailInputId);
    const value = input?.value.trim();
    if (!value) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    set("emailIds")(form.emailIds ? `${form.emailIds}; ${value}` : `${value};`);
    input.value = "";
  };

  const addMeetingEmail = () => {
    const value = emailDraft.trim();
    if (!value) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (form.emails.includes(value)) {
      toast.error("This email is already added.");
      return;
    }
    setForm((f) => {
      const emails = [...f.emails, value];
      return { ...f, emails, emailIds: emails.join("; ") };
    });
    setEmailDraft("");
  };

  const removeMeetingEmail = (email) => {
    setForm((f) => {
      const emails = f.emails.filter((x) => x !== email);
      return { ...f, emails, emailIds: emails.join("; ") };
    });
  };

  const addCustomReminder = () => {
    const amount = String(reminderAmount).trim();
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a reminder amount.");
      return;
    }
    const labelText = `${amount} ${reminderUnit}`;
    if (form.customReminders.includes(labelText)) return;
    set("customReminders")([...form.customReminders, labelText]);
  };

  const handleMakeWithAI = () => {
    const title = form.title.trim() || "this meeting";
    const when = `${formatDateLabel(form.startDate)} at ${formatTime12(form.startTime || "10:00")}`;
    const body = `Reminder: ${title} is scheduled on ${when} (${form.duration || "1 hour"}). Please join on time.`;
    setForm((f) => ({ ...f, messageTemplate: f.messageTemplate || "reminder", messageBody: body }));
    toast.success("Message drafted with AI from the title, date and time.");
  };

  const handleSendNow = () => {
    toast.success(`Reminder fired on ${channelLabel} to ${recipientEmails.length} recipient(s).`);
  };

  const handleClose = () => {
    setForm(emptyForm);
    setEmailDraft("");
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error(`${label} title is required.`);
      return;
    }

    if (isEvent) {
      if (!form.emailIds && form.people.length === 0) {
        toast.error("Please add at least one Email Id or select an Employee/Client.");
        return;
      }
      if (!form.description) {
        toast.error(`${label} description is required.`);
        return;
      }
      if (form.meetingTypes.length === 0) {
        toast.error(`Please select at least one ${label} Type.`);
        return;
      }
      if (!form.startDate || !form.endDate) {
        toast.error("Start date and end date are required.");
        return;
      }
      if (!form.duration) {
        toast.error("Duration is required.");
        return;
      }
      if (form.requirements.length === 0) {
        toast.error(`Please select what you require for this ${label.toLowerCase()}.`);
        return;
      }
      onSave?.({ ...form, eventType: form.description });
      toast.success(isEdit ? `${label} updated successfully.` : `${label} created successfully.`);
      setForm(emptyForm);
      onClose();
      return;
    }

    if (!form.meetingWith) {
      toast.error("Please select who the meeting is with.");
      return;
    }
    if (!form.description) {
      toast.error("Meeting description is required.");
      return;
    }
    if (!form.meetingType) {
      toast.error("Please select a meeting type.");
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error("Start date and end date are required.");
      return;
    }
    if (form.reminderChannels.length === 0) {
      toast.error("Please select how reminders should be sent.");
      return;
    }
    if (!form.priority) {
      toast.error("Please select a priority.");
      return;
    }
    if (form.people.length === 0 && form.emails.length === 0) {
      toast.error("Add at least one attendee or email id.");
      return;
    }

    const inviteGroups = inviteGroupsFromPeople(form.people, form.meetingWith);
    onSave?.({
      ...form,
      inviteGroups,
      meetingTypes: [form.meetingType],
      emailIds: form.emails.join("; "),
      endTime: computedEndTime,
      duration: form.duration || "1 hour",
    });
    toast.success(isEdit ? "Meeting updated successfully." : "Meeting created successfully.");
    setForm(emptyForm);
    setEmailDraft("");
    onClose();
  };

  const meetingFooter = (
    <>
      <button
        type="button"
        onClick={handleClose}
        className="h-9 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
      >
        Cancel
      </button>
      <button
        type="submit"
        form={formId}
        className="h-9 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
      >
        {isEdit ? "Save" : "Send & Save"}
      </button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? `Edit ${label}` : `Create ${label}`}
      subtitle={
        isEdit
          ? `Update ${label.toLowerCase()} details`
          : isEvent
            ? "Schedule a new event on the calendar"
            : "Schedule a meeting or appointment"
      }
      icon={<CalendarDays size={16} />}
      iconBg={isEvent ? "#FDECF3" : "#FDECEE"}
      iconColor={isEvent ? "#A02868" : "#E8395B"}
      width={isEvent ? "max-w-[640px]" : "max-w-[560px]"}
      footer={isEvent ? undefined : meetingFooter}
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-5">
        {isEvent ? (
          <>
            <Field label={`${label} Title`} required>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title")(e.target.value)}
                placeholder="e.g. Meet the Parents Evening"
                className={INPUT}
              />
            </Field>

            <Field label="Invite">
              <div className="flex items-center gap-5 flex-wrap">
                {INVITE_GROUPS.map((g) => (
                  <label key={g.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={g.key === "all" ? inviteAllChecked : form.inviteGroups.includes(g.key)}
                      onChange={() => toggleInviteGroup(g.key)}
                      className="size-3.5 accent-[#7A0A17]"
                    />
                    <span className="text-[13px] text-[#374151]">{g.label}</span>
                  </label>
                ))}
              </div>
            </Field>

            <Field label="">
              <select
                defaultValue=""
                onChange={(e) => {
                  addPerson(e.target.value);
                  e.target.value = "";
                }}
                className={`${INPUT} text-[#9CA3AF]`}
              >
                <option value="" disabled hidden>
                  Select Employee/Client/Others
                </option>
                {peopleOptions.length > 0 && (
                  <option value="__all__" className="text-[#111] font-semibold">
                    All
                  </option>
                )}
                {peopleOptions.map((p) => (
                  <option key={p} value={p} className="text-[#111]">
                    {p}
                  </option>
                ))}
              </select>
              {form.people.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.people.map((p) => (
                    <Chip key={p} label={p} onRemove={() => removePerson(p)} />
                  ))}
                </div>
              )}
            </Field>

            <Field label="Add Email Id (Enter Email Id's)" required>
              <div className="flex items-center gap-2">
                <input
                  id={emailInputId}
                  type="text"
                  defaultValue=""
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addEmailFromInput();
                    }
                  }}
                  placeholder="xyz@mmlcompany.com;"
                  className={`${INPUT} flex-1`}
                />
                <button
                  type="button"
                  onClick={addEmailFromInput}
                  className="size-10 shrink-0 rounded-none border border-[#E8395B]/35 text-[#E8395B] grid place-items-center hover:bg-[#FDECEE]"
                >
                  <Plus size={18} />
                </button>
              </div>
              {form.emailIds ? <p className="text-[11.5px] text-[#9CA3AF] break-all mt-1">{form.emailIds}</p> : null}
            </Field>

            <Field label="Special instructions" danger>
              <input
                type="text"
                value={form.specialInstructions}
                onChange={(e) => set("specialInstructions")(e.target.value)}
                placeholder="e.g. Special Instructions"
                className={INPUT}
              />
            </Field>

            <Field label="Description">
              <textarea
                rows={3}
                value={form.notes || ""}
                onChange={(e) => set("notes")(e.target.value)}
                placeholder="e.g. Walk family through shortlisted matches and confirm next visit."
                className={`${INPUT} h-auto py-2.5 resize-none`}
              />
            </Field>

            <Field label="Event Type" required>
              <select
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
                className={INPUT}
                style={{ color: form.description ? "#111" : "#9CA3AF" }}
              >
                <option value="" disabled hidden>
                  Select
                </option>
                {descriptionOptions.map((d) => (
                  <option key={d} value={d} className="text-[#111]">
                    {d}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Event Modes" required>
              <div className="flex flex-col gap-2">
                {TYPE_OPTIONS.map((m) => (
                  <label key={m.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.meetingTypes.includes(m.key)}
                      onChange={() => toggleInArray("meetingTypes")(m.key)}
                      className="size-3.5 accent-[#7A0A17]"
                    />
                    <span className="text-[13px] text-[#374151]">{m.label}</span>
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Event Link (video)">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={form.meetingLink}
                  onChange={(e) => set("meetingLink")(e.target.value)}
                  placeholder="https://zoom.us/j/123456789"
                  className={`${INPUT} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => set("meetingLink")("https://zoom.us/j/123456789#success")}
                  className="text-[12.5px] font-semibold text-[#7A0A17] hover:underline whitespace-nowrap"
                >
                  Create event link
                </button>
              </div>
            </Field>

            <Field label="Venue/Location (face to face)">
              <input
                type="text"
                value={form.venue}
                onChange={(e) => set("venue")(e.target.value)}
                placeholder="//google.maps//"
                className={INPUT}
              />
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
              <Field label="End Time">
                <input type="time" value={form.endTime} onChange={(e) => set("endTime")(e.target.value)} className={INPUT} />
              </Field>
            </div>

            <Field label="Duration" required>
              <input
                type="text"
                value={form.duration}
                onChange={(e) => set("duration")(e.target.value)}
                placeholder="e.g. 45 min"
                className={INPUT}
              />
            </Field>

            <Field label="Attachments">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={form.attachment}
                  readOnly
                  placeholder="Select file"
                  className={`${INPUT} flex-1 bg-[#FAFAFB]`}
                />
                <label className="h-10 px-3.5 rounded-none border border-black/10 inline-flex items-center gap-2 text-[12.5px] font-medium text-[#374151] hover:bg-[#FAFAFB] cursor-pointer whitespace-nowrap">
                  <ImageIcon size={14} /> Browse
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => set("attachment")(e.target.files?.[0]?.name ?? "")}
                  />
                </label>
              </div>
            </Field>

            <Field label="Do you require ?" required>
              <div className="flex flex-col gap-2">
                {requirementOptions.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.requirements.includes(opt)}
                      onChange={() => toggleInArray("requirements")(opt)}
                      className="size-3.5 accent-[#7A0A17]"
                    />
                    <span className="text-[13px] text-[#374151]">{opt}</span>
                  </label>
                ))}
              </div>
            </Field>

            {form.requirements.includes(notesRequirement) && (
              <Field label={`${label} Notes will be sent to`}>
                <div className="flex flex-col gap-2">
                  {NOTES_RECIPIENTS.map((opt) => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.notesTo.includes(opt)}
                        onChange={() => toggleInArray("notesTo")(opt)}
                        className="size-3.5 accent-[#7A0A17]"
                      />
                      <span className="text-[13px] text-[#374151]">{opt}</span>
                    </label>
                  ))}
                </div>
              </Field>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/8">
              <button
                type="button"
                onClick={handleClose}
                className="h-9 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
              >
                {isEdit ? "Save" : "Send & Save"}
              </button>
            </div>
          </>
        ) : (
          <>
            <Field label="Meeting Title" required>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title")(e.target.value)}
                placeholder="e.g. Home Visit - Rajouri Family"
                className={INPUT}
              />
            </Field>

            <Field label="Meeting With" required>
              <div className="grid grid-cols-3 gap-2.5">
                {MEETING_WITH_OPTIONS.map((opt) => (
                  <PillButton
                    key={opt.key}
                    active={form.meetingWith === opt.key}
                    onClick={() => set("meetingWith")(opt.key)}
                  >
                    {opt.label}
                  </PillButton>
                ))}
              </div>
            </Field>

            <AttendeePicker
              group={form.meetingWith}
              people={form.people}
              onAdd={(name) => addPerson(name)}
              onRemove={removePerson}
            />

            <Field
              label="Meeting Description"
              required
              hint={`Client list — ${meetingDescriptionOptions.length} options`}
            >
              <select
                value={form.description}
                onChange={(e) => set("description")(e.target.value)}
                className={INPUT}
                style={{ color: form.description ? "#111" : "#9CA3AF" }}
              >
                <option value="" disabled hidden>
                  Select
                </option>
                {meetingDescriptionOptions.map((d) => (
                  <option key={d} value={d} className="text-[#111]">
                    {d}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Meeting Type" required>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex flex-col gap-2.5 min-w-[150px]">
                  {MEETING_TYPE_OPTIONS.map((m) => (
                    <label key={m.key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="meeting-type"
                        checked={form.meetingType === m.key}
                        onChange={() => set("meetingType")(m.key)}
                        className="size-3.5 accent-[#7A0A17]"
                      />
                      <span className="text-[13px] text-[#374151]">{m.label}</span>
                    </label>
                  ))}
                </div>
                {form.meetingType === "video" && (
                  <div className="flex-1 w-full rounded-xl bg-[#FDECEE]/70 border border-[#E8395B]/10 px-3.5 py-3">
                    <p className="text-[12px] text-[#9CA3AF] mb-2">Meeting link (video)</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={form.meetingLink}
                        onChange={(e) => set("meetingLink")(e.target.value)}
                        placeholder="https://zoom.us/j/123456789"
                        className="flex-1 h-9 px-3 rounded-lg bg-white border border-black/10 text-[13px] outline-none focus:border-[#7A0A17]/40"
                      />
                      <button
                        type="button"
                        onClick={() => set("meetingLink")(`https://zoom.us/j/${Math.floor(100000000 + Math.random() * 900000000)}`)}
                        className="text-[13px] font-semibold text-[#E8395B] hover:underline whitespace-nowrap"
                      >
                        Create link
                      </button>
                    </div>
                  </div>
                )}
                {form.meetingType === "face" && (
                  <div className="flex-1 w-full rounded-xl bg-[#FDECEE]/70 border border-[#E8395B]/10 px-3.5 py-3">
                    <p className="text-[12px] text-[#9CA3AF] mb-2">Venue / location</p>
                    <input
                      type="text"
                      value={form.venue}
                      onChange={(e) => set("venue")(e.target.value)}
                      placeholder="Paste a Google Maps link"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-black/10 text-[13px] outline-none focus:border-[#7A0A17]/40"
                    />
                  </div>
                )}
              </div>
            </Field>

            <Field
              label="Add Email Id (Enter Email Id)"
              required
              hint="Attendee addresses are filled in from their profiles — add extras below."
            >
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={emailDraft}
                  onChange={(e) => setEmailDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addMeetingEmail();
                    }
                  }}
                  placeholder="e.g. ankur@thecompany.com"
                  className={`${INPUT} flex-1`}
                />
                <button
                  type="button"
                  onClick={addMeetingEmail}
                  className="size-10 shrink-0 rounded-xl bg-[#FDECEE] text-[#E8395B] grid place-items-center hover:bg-[#FADDE3]"
                >
                  <Plus size={18} />
                </button>
              </div>
              {form.emails.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.emails.map((email) => (
                    <Chip key={email} label={email} onRemove={() => removeMeetingEmail(email)} />
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
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="End Time — set automatically from start time + duration">
              <input
                readOnly
                value={formatTime12(computedEndTime)}
                className={`${INPUT} bg-[#FDECEE]/40 text-[#6B7280]`}
              />
            </Field>

            <Field
              label="Send Reminders Via"
              required
              hint={`Reminders go out on ${channelLabel} to every attendee address and mobile on file.`}
            >
              <div className="flex flex-wrap gap-2">
                {REMINDER_CHANNELS.map((ch) => (
                  <button
                    key={ch.key}
                    type="button"
                    onClick={() => toggleInArray("reminderChannels")(ch.key)}
                    className={`h-9 px-4 rounded-full border text-[13px] font-semibold transition-colors ${
                      form.reminderChannels.includes(ch.key) ? PILL_ACTIVE : PILL_IDLE
                    }`}
                  >
                    {ch.label}
                  </button>
                ))}
              </div>
            </Field>

            <div className="flex flex-col gap-1.5">
              <p className="text-[12.5px] font-semibold text-[#374151]">Message template</p>
              <div className="flex items-center gap-2">
                <select
                  value={form.messageTemplate}
                  onChange={(e) => set("messageTemplate")(e.target.value)}
                  className={`${INPUT} flex-1`}
                >
                  {MESSAGE_TEMPLATES.map((t) => (
                    <option key={t.key || "none"} value={t.key}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleMakeWithAI}
                  className="h-10 px-3.5 rounded-xl border border-[#E8395B]/40 text-[#E8395B] inline-flex items-center gap-1.5 text-[13px] font-semibold whitespace-nowrap hover:bg-[#FDECEE]"
                >
                  <Sparkles size={14} /> Make with AI
                </button>
              </div>
              <p className="text-[11.5px] text-[#9CA3AF]">
                Message body is composed from the entry title, date and time.
              </p>
              {form.messageBody ? (
                <textarea
                  rows={3}
                  value={form.messageBody}
                  onChange={(e) => set("messageBody")(e.target.value)}
                  className={`${INPUT} h-auto py-2.5 resize-none mt-1`}
                />
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-3 rounded-xl bg-[#FDECEE] px-4 py-3">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-[#E8395B]">Send a reminder now</p>
                <p className="text-[12px] text-[#9CA3AF]">
                  Fires on {channelLabel} to {recipientEmails.length} recipient(s) right away.
                </p>
              </div>
              <button
                type="button"
                onClick={handleSendNow}
                className="h-9 px-4 rounded-xl border border-black/10 bg-white text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] shrink-0"
              >
                Send now
              </button>
            </div>

            <Field label="Reminder Frequency">
              <div className="flex flex-wrap gap-2">
                {REMINDER_FREQUENCIES.map((freq) => (
                  <button
                    key={freq.key}
                    type="button"
                    onClick={() => toggleInArray("reminderFrequency")(freq.key)}
                    className={`h-9 px-3.5 rounded-full border text-[12.5px] font-semibold whitespace-nowrap transition-colors ${
                      form.reminderFrequency.includes(freq.key) ? PILL_ACTIVE : PILL_IDLE
                    }`}
                  >
                    {freq.label}
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
              {form.customReminders.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.customReminders.map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      onRemove={() => set("customReminders")(form.customReminders.filter((x) => x !== item))}
                    />
                  ))}
                </div>
              )}
            </Field>

            <Field label="Priority" required>
              <div className="grid grid-cols-3 gap-2.5">
                {PRIORITIES.map((p) => (
                  <PillButton key={p} active={form.priority === p} onClick={() => set("priority")(p)}>
                    {p}
                  </PillButton>
                ))}
              </div>
            </Field>

            <Field label="Attachments">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={form.attachment}
                  readOnly
                  placeholder="Select file"
                  className={`${INPUT} flex-1 bg-[#FAFAFB]`}
                />
                <label className="h-10 px-3.5 rounded-xl border border-black/10 inline-flex items-center gap-2 text-[12.5px] font-medium text-[#374151] hover:bg-[#FAFAFB] cursor-pointer whitespace-nowrap">
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
                className={INPUT}
              />
              <input
                type="text"
                value={form.referenceLinkDescription}
                onChange={(e) => set("referenceLinkDescription")(e.target.value)}
                placeholder="Description and purpose of the link"
                className={INPUT}
              />
            </Field>

            <Field label="Do you require ?">
              <div className="flex flex-col gap-2">
                {MEETING_REQUIREMENTS.map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.requirements.includes(opt)}
                      onChange={() => toggleInArray("requirements")(opt)}
                      className="size-3.5 accent-[#7A0A17]"
                    />
                    <span className="text-[13px] text-[#374151]">{opt}</span>
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Special Instructions" danger>
              <textarea
                rows={3}
                value={form.specialInstructions}
                onChange={(e) => set("specialInstructions")(e.target.value)}
                placeholder="e.g. In case of leave, inform branch manager to reassign and inform the client"
                className={`${INPUT} h-auto py-2.5 resize-y min-h-[72px]`}
              />
            </Field>
          </>
        )}
      </form>
    </Modal>
  );
}
