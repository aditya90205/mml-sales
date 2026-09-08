import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bell,
  Calendar as CalendarIcon,
  ChevronDown,
  Clock,
  Globe,
  Mail,
  MessageSquare,
  Paperclip,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import ChannelTemplateModal from "../components/campaign/ChannelTemplateModal.jsx";
import CreateGroupModal from "../components/campaign/CreateGroupModal.jsx";
import { addCampaign } from "../utils/campaignsStore.js";
import { readSavedGroups } from "../utils/clientGroups.js";

const CHANNELS = [
  { key: "email", label: "Email", icon: Mail },
  { key: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { key: "push", label: "Push Notification", icon: Bell },
  { key: "sms", label: "SMS", icon: MessageSquare },
];

const TIMEZONE_OPTIONS = [
  "(IST+05:30) India Standard Time (India)",
  "(GMT+00:00) Greenwich Mean Time",
  "(EST-05:00) Eastern Time (US & Canada)",
  "(PST-08:00) Pacific Time (US & Canada)",
  "(GST+04:00) Gulf Standard Time",
];

const INPUT =
  "w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] outline-none focus:border-[#7A0A17]/40 bg-white";

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[13px] font-bold text-[#111] mb-1.5">
      {children} {required && <span className="text-[#E8395B]">*</span>}
    </label>
  );
}

function StepBadge({ n }) {
  return (
    <span className="size-5 rounded-full bg-[#FCF5F6] text-[#E8395B] text-[11px] font-bold grid place-items-center shrink-0">
      {n}
    </span>
  );
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`h-11 flex-1 min-w-[120px] rounded-xl text-[13px] font-semibold border transition-colors ${
            value === opt ? "border-[#E8395B] text-[#E8395B] bg-[#FCF5F6]" : "border-black/12 text-[#9CA3AF] hover:bg-[#FAFAFB]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function emptySchedule() {
  return { date: "", time: "", timezone: TIMEZONE_OPTIONS[0] };
}

/** Date / time / timezone card shown when campaign start or stop is time-based. */
function ScheduleTimeCard({ title, value, onChange }) {
  const set = (field) => (e) => onChange({ ...value, [field]: e.target.value });

  return (
    <div className="bg-[#FAFAFB] border border-black/8 rounded-2xl p-5 flex flex-col gap-4">
      <h3 className="text-[15px] font-bold text-[#111]">{title}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-[12.5px] text-[#9CA3AF] mb-1.5">Date</p>
          <div className="relative">
            <CalendarIcon
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
            />
            <input
              type="date"
              value={value.date}
              onChange={set("date")}
              className={`${INPUT} pl-10`}
            />
          </div>
        </div>
        <div>
          <p className="text-[12.5px] text-[#9CA3AF] mb-1.5">Time</p>
          <div className="relative">
            <Clock
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
            />
            <input
              type="time"
              value={value.time}
              onChange={set("time")}
              className={`${INPUT} pl-10`}
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-[12.5px] text-[#9CA3AF] mb-1.5">Timezone</p>
        <div className="relative">
          <Globe
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
          />
          <select
            value={value.timezone}
            onChange={set("timezone")}
            className={`${INPUT} pl-10 pr-10 appearance-none`}
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
          <ChevronDown
            size={15}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
}

export default function CreateCampaignPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [group, setGroup] = useState("");
  const [groupOptions, setGroupOptions] = useState(() => readSavedGroups());
  const [country, setCountry] = useState("");
  const [startMode, setStartMode] = useState("Manual");
  const [stopMode, setStopMode] = useState("Manual");
  const [startSchedule, setStartSchedule] = useState(emptySchedule);
  const [endSchedule, setEndSchedule] = useState(emptySchedule);
  const [maxRetry, setMaxRetry] = useState("03");
  const [selectedChannels, setSelectedChannels] = useState({ email: true, whatsapp: true, push: false, sms: true });
  const [activeModal, setActiveModal] = useState(null);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);

  const groupSelectOptions = useMemo(() => {
    const names = groupOptions.map((g) => g.name);
    const extras = ["Common Pool", "Doctors", "P3 Pipeline", "New Opportunity"].filter((n) => !names.includes(n));
    return [...names, ...extras];
  }, [groupOptions]);

  const toggleChannel = (key) => {
    setSelectedChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter a campaign name.");
      return;
    }
    if (startMode === "Time based" && (!startSchedule.date || !startSchedule.time)) {
      toast.error("Please set start date and time for the time-based campaign.");
      return;
    }
    if (stopMode === "Time based" && (!endSchedule.date || !endSchedule.time)) {
      toast.error("Please set end date and time for the time-based campaign stop.");
      return;
    }
    const created = addCampaign({
      name: name.trim(),
      description: description.trim(),
      tag: description.trim() || "New campaign",
      group,
      target: group || "Common Pool",
      selectedChannels,
      startMode,
      stopMode,
      startSchedule: startMode === "Time based" ? startSchedule : null,
      endSchedule: stopMode === "Time based" ? endSchedule : null,
      country,
      maxRetry,
      status: startMode === "Time based" ? "Scheduled" : "Not Started",
    });
    toast.success(`Campaign "${created.name}" saved.`);
    navigate("/campaign/management");
  };

  const handleGroupSaved = (created) => {
    setGroupOptions(readSavedGroups());
    setGroup(created.name);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pt-5 pb-8 flex flex-col gap-5 min-w-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-[26px] font-bold text-[#111] tracking-tight">Create New Campaign</h1>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => toast.info("Exporting results...")}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            >
              Export results
            </button>
            <button
              type="button"
              onClick={() => navigate("/campaign/management")}
              className="inline-flex items-center gap-1.5 h-[38px] px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors shrink-0"
              aria-label="Back to campaigns"
            >
              <ArrowLeft size={15} />
              Back
            </button>
          </div>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-6 flex flex-col gap-7 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <StepBadge n={1} />
              <h2 className="text-[15px] font-bold text-[#111]">Create Campaign</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <FieldLabel required>Campaign Name</FieldLabel>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40"
                />
              </div>
              <div>
                <FieldLabel required>Description</FieldLabel>
                <input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-1 border-t border-black/6">
            <div className="flex items-center gap-2.5 pt-4">
              <StepBadge n={2} />
              <h2 className="text-[15px] font-bold text-[#111]">Who is your target segment / group</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_1fr_auto] gap-4 items-end">
              <div>
                <FieldLabel required>Select Group</FieldLabel>
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] outline-none bg-white"
                >
                  <option value="">Select Group</option>
                  {groupSelectOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setCreateGroupOpen(true)}
                className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-white border border-[#7A0A17]/30 text-[13px] font-semibold text-[#7A0A17] hover:bg-[#FCF5F6] transition-colors shrink-0"
              >
                <Plus size={14} /> Create Client Group
              </button>
              <p className="hidden md:block text-[13px] font-semibold text-[#9CA3AF] pb-3">OR</p>
              <div>
                <FieldLabel required>Upload File / Bulk Import</FieldLabel>
                <div className="flex items-center gap-2 h-11 border border-black/12 rounded-xl px-3.5">
                  <input
                    readOnly
                    placeholder="Upload File"
                    className="flex-1 min-w-0 bg-transparent text-[13px] text-[#9CA3AF] outline-none"
                  />
                  <Paperclip size={15} className="text-[#6B7280] shrink-0" />
                </div>
              </div>
              <button
                type="button"
                onClick={() => toast.info("Opening bulk import...")}
                className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-white border border-[#7A0A17]/30 text-[13px] font-semibold text-[#7A0A17] hover:bg-[#FCF5F6] transition-colors shrink-0"
              >
                Bulk Import →
              </button>
            </div>

            <div className="max-w-md">
              <label className="block text-[13px] font-semibold text-[#111] mb-1.5">
                Select Country <span className="text-[#DC2626] font-medium">(Please make sure privacy policy &amp; regulation for each country)</span>
              </label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="India (Default)"
                className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-1 border-t border-black/6">
            <div className="flex items-center gap-2.5 pt-4">
              <StepBadge n={3} />
              <h2 className="text-[15px] font-bold text-[#111]">Start Campaign</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FieldLabel required>Start of campaign</FieldLabel>
                <ToggleGroup options={["Manual", "Time based"]} value={startMode} onChange={setStartMode} />
              </div>
              <div>
                <FieldLabel required>Stop campaign</FieldLabel>
                <ToggleGroup options={["Manual", "Time based", "Customer Action"]} value={stopMode} onChange={setStopMode} />
              </div>
            </div>

            {(startMode === "Time based" || stopMode === "Time based") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                {startMode === "Time based" && (
                  <ScheduleTimeCard
                    title="Start Time"
                    value={startSchedule}
                    onChange={setStartSchedule}
                  />
                )}
                {stopMode === "Time based" && (
                  <ScheduleTimeCard
                    title="End Time"
                    value={endSchedule}
                    onChange={setEndSchedule}
                  />
                )}
              </div>
            )}

            <div className="max-w-[200px]">
              <label className="block text-[13px] font-semibold text-[#111] mb-1.5">Max Retry</label>
              <select
                value={maxRetry}
                onChange={(e) => setMaxRetry(e.target.value)}
                className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] outline-none bg-white"
              >
                {["01", "02", "03", "04", "05"].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </div>
            <p className="text-[13px] text-[#6B7280]">
              Black out time will be from 8 PM to 7 AM. During this time no message or email will be sent to clients.
            </p>
            <p className="text-[13px] text-[#6B7280]">
              If manual stop is selected for campaign than the default period for campaign is maximum 7 days.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-1 border-t border-black/6">
            <div className="flex items-center gap-2.5 pt-4">
              <StepBadge n={4} />
              <h2 className="text-[15px] font-bold text-[#111]">Choose Channel Output &amp; Create Templates</h2>
            </div>
            <div className="flex flex-col gap-3">
              {CHANNELS.map(({ key, label, icon: Icon }) => {
                const checked = selectedChannels[key];
                return (
                  <div
                    key={key}
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveModal(key)}
                    onKeyDown={(e) => e.key === "Enter" && setActiveModal(key)}
                    className={`flex items-center gap-3 h-14 px-4 rounded-xl border cursor-pointer transition-colors ${
                      checked ? "border-[#7A0A17]/50 bg-[#FCF5F6]" : "border-black/12 hover:bg-[#FAFAFB]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleChannel(key)}
                      className="size-4 accent-[#7A0A17] shrink-0"
                    />
                    <Icon size={16} className="text-[#7A0A17] shrink-0" />
                    <span className="text-[13px] font-semibold text-[#111]">{label}</span>
                    <span className="ml-auto text-[11px] text-[#9CA3AF]">Click to configure template</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => navigate("/campaign/management")}
            className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Save &amp; Update
          </button>
        </div>
      </div>

      <ChannelTemplateModal open={Boolean(activeModal)} onClose={() => setActiveModal(null)} channel={activeModal || "email"} />
      <CreateGroupModal
        open={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
        onSaved={handleGroupSaved}
      />
    </div>
  );
}
