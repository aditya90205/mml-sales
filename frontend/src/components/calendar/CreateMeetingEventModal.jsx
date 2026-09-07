import { useEffect, useState } from "react";
import { Plus, Image as ImageIcon, CalendarDays, Users2 } from "lucide-react";
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

const CLIENTS = ["ABC Pvt. Ltd", "Sethi Family", "Agarwal Contract", "Malhotra Family", "Mehta & Co"];

const OTHERS = [
  "Anjali Gupta",
  "Abhinav Pandey",
  "Ankur Mishra",
  "External Vendor",
  "Guest Speaker",
];

const INVITE_GROUPS = [
  { key: "all", label: "All" },
  { key: "others", label: "Others/External" },
  { key: "employees", label: "Employees" },
  { key: "client", label: "Client" },
];

const GROUP_KEYS = ["others", "employees", "client"];

const EVENT_TYPES = ["Company Event", "Training", "Celebration", "Holiday", "Workshop", "Other"];
const MEETING_DESCRIPTIONS = [
  "General Discussion",
  "Client Meeting",
  "Team Sync",
  "Performance Review",
  "Project Kickoff",
  "Other",
];

const TYPE_OPTIONS = [
  { key: "video", label: "Virtual/Video" },
  { key: "telephonic", label: "Telephonic" },
  { key: "face", label: "Face to Face" },
];

const NOTES_RECIPIENTS = ["All Participants", "Only Organizer"];

const INPUT =
  "w-full h-10 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40 transition-colors";

const emptyForm = {
  title: "",
  inviteGroups: [],
  people: [],
  emailIds: "",
  specialInstructions: "",
  notes: "",
  description: "",
  meetingTypes: [],
  meetingLink: "",
  venue: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  duration: "",
  attachment: "",
  requirements: [],
  notesTo: [],
};

function Field({ label, required, children, danger }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <p className={`text-[12.5px] font-semibold ${danger ? "text-[#E8395B]" : "text-[#374151]"}`}>
          {label}
          {required ? <span className="text-[#E8395B]"> *</span> : null}
        </p>
      ) : null}
      {children}
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
  mode = "create", // "create" | "edit"
}) {
  const isEvent = entityLabel === "Event";
  const isEdit = mode === "edit";
  const label = entityLabel;
  const baseDescriptionOptions = isEvent ? EVENT_TYPES : MEETING_DESCRIPTIONS;
  const requirementOptions = ["Interview Recording", "Transcripts", `${label} Notes`];
  const notesRequirement = `${label} Notes`;
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({ ...emptyForm, ...initial });
      return;
    }
    const dateStr = defaultDate
      ? `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, "0")}-${String(defaultDate.getDate()).padStart(2, "0")}`
      : "";
    setForm({ ...emptyForm, startDate: dateStr, endDate: dateStr, startTime: "10:00", endTime: "11:00", duration: "60 min" });
  }, [open, defaultDate, initial]);

  const descriptionOptions =
    form.description && !baseDescriptionOptions.includes(form.description)
      ? [form.description, ...baseDescriptionOptions]
      : baseDescriptionOptions;

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
      const merged = [...new Set([...form.people, ...peopleOptions])];
      set("people")(merged);
      return;
    }
    if (name && !form.people.includes(name)) set("people")([...form.people, name]);
  };

  const removePerson = (name) => set("people")(form.people.filter((p) => p !== name));

  const emailInputId = `calendar-${label.toLowerCase()}-email-${isEdit ? "edit" : "create"}`;

  const addEmail = () => {
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

  const handleClose = () => {
    setForm(emptyForm);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error(`${label} title is required.`);
      return;
    }
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

    onSave?.({ ...form, eventType: isEvent ? form.description : undefined });
    toast.success(isEdit ? `${label} updated successfully.` : `${label} created successfully.`);
    setForm(emptyForm);
    onClose();
  };

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
      icon={isEvent ? <CalendarDays size={16} /> : <Users2 size={16} />}
      iconBg={isEvent ? "#FDECF3" : "#F6FFF5"}
      iconColor={isEvent ? "#A02868" : "#41703D"}
      width="max-w-[640px]"
    >
      <form id={`create-${label.toLowerCase()}-form`} onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label={`${label} Title`} required>
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title")(e.target.value)}
            placeholder={isEvent ? "e.g. All Hand Meet - Ankur Mishra" : "e.g. Logging Framework"}
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
                <span
                  key={p}
                  className="inline-flex items-center gap-1.5 bg-[#F1F2F4] text-[#111] text-[12.5px] font-medium rounded-lg px-2.5 py-1"
                >
                  {p}
                  <button type="button" onClick={() => removePerson(p)} className="text-[#9CA3AF] hover:text-[#E8395B]">
                    ×
                  </button>
                </span>
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
                  addEmail();
                }
              }}
              placeholder="xyz@mmlcompany.com;"
              className={`${INPUT} flex-1`}
            />
            <button
              type="button"
              onClick={addEmail}
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

        {isEvent ? (
          <Field label="Description">
            <textarea
              rows={3}
              value={form.notes || ""}
              onChange={(e) => set("notes")(e.target.value)}
              placeholder="e.g. Company-wide all-hands covering Q3 goals and updates."
              className={`${INPUT} h-auto py-2.5 resize-none`}
            />
          </Field>
        ) : null}

        <Field label={isEvent ? "Event Type" : `${label} description`} required>
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

        <Field label={isEvent ? "Event Modes" : `${label} Type`} required>
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

        <Field label={`${label} Link (video)`}>
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
              Create {label.toLowerCase()} link
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
      </form>
    </Modal>
  );
}
