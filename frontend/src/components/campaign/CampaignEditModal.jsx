import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Mail, MessageSquare, Paperclip, Plus, X } from "lucide-react";
import { toast } from "react-toastify";
import ChannelTemplateModal from "./ChannelTemplateModal.jsx";

const CHANNELS = [
  { key: "email", label: "Email", icon: Mail },
  { key: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { key: "push", label: "Push Notification", icon: Bell },
  { key: "sms", label: "SMS", icon: MessageSquare },
];

const CHANNEL_KEY_BY_LABEL = {
  Email: "email",
  WhatsApp: "whatsapp",
  Push: "push",
  SMS: "sms",
};

const GROUP_OPTIONS = ["Common Pool", "Jalandhar", "Doctors", "IIT, IIM", "P3 Pipeline", "New Opportunity"];

function channelsFromCampaign(channelStr) {
  const selected = { email: false, whatsapp: false, push: false, sms: false };
  String(channelStr || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .forEach((label) => {
      const key = CHANNEL_KEY_BY_LABEL[label];
      if (key) selected[key] = true;
    });
  return selected;
}

function startModeFromCampaign(start) {
  return start === "Manual" ? "Manual" : "Time based";
}

function stopModeFromCampaign(end) {
  if (end === "Manual") return "Manual";
  if (String(end || "").toLowerCase().includes("action")) return "Customer Action";
  return "Time based";
}

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

function buildFormState(campaign) {
  return {
    name: campaign?.name || "",
    description: campaign?.tag || campaign?.description || "",
    group: campaign?.target || "",
    country: campaign?.country || "India (Default)",
    startMode: startModeFromCampaign(campaign?.start),
    stopMode: stopModeFromCampaign(campaign?.end),
    maxRetry: campaign?.maxRetry || "03",
    selectedChannels: channelsFromCampaign(campaign?.channel),
    startAt: campaign?.start && campaign.start !== "Manual" ? campaign.start : "",
    endAt: campaign?.end && campaign.end !== "Manual" ? campaign.end : "",
  };
}

export default function CampaignEditModal({ open, campaign, onClose, onSave, onBack }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [group, setGroup] = useState("");
  const [country, setCountry] = useState("");
  const [startMode, setStartMode] = useState("Manual");
  const [stopMode, setStopMode] = useState("Manual");
  const [maxRetry, setMaxRetry] = useState("03");
  const [selectedChannels, setSelectedChannels] = useState({ email: true, whatsapp: true, push: false, sms: true });
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [uploadFileName, setUploadFileName] = useState("");
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    if (!open || !campaign) return;
    const next = buildFormState(campaign);
    setName(next.name);
    setDescription(next.description);
    setGroup(next.group);
    setCountry(next.country);
    setStartMode(next.startMode);
    setStopMode(next.stopMode);
    setMaxRetry(next.maxRetry);
    setSelectedChannels(next.selectedChannels);
    setStartAt(next.startAt);
    setEndAt(next.endAt);
    setUploadFileName(campaign.uploadFileName || "");
    setActiveModal(null);
  }, [open, campaign]);

  if (!open || !campaign) return null;

  const toggleChannel = (key) => {
    setSelectedChannels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const handleFileChosen = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFileName(file.name);
    toast.success(`"${file.name}" attached.`);
    e.target.value = "";
  };

  const channelLabel = () =>
    CHANNELS.filter(({ key }) => selectedChannels[key])
      .map(({ label }) => (label === "Push Notification" ? "Push" : label))
      .join(", ");

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter a campaign name.");
      return;
    }

    onSave?.({
      ...campaign,
      name: name.trim(),
      tag: description.trim() || campaign.tag || "",
      description: description.trim(),
      target: group || campaign.target || "—",
      channel: channelLabel() || campaign.channel || "—",
      start: startMode === "Manual" ? "Manual" : startAt || campaign.start || "Time based",
      end: stopMode === "Manual" ? "Manual" : endAt || campaign.end || "Time based",
      country,
      maxRetry,
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-black/8 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-[#111]">Edit Campaign</h2>
            <p className="text-[13px] text-[#9CA3AF] mt-1">
              Update profile data for <span className="font-semibold text-[#374151]">{campaign.name}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6f7886] hover:bg-black/5 transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <StepBadge n={1} />
                <h3 className="text-[15px] font-bold text-[#111]">Campaign Profile</h3>
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
                <h3 className="text-[15px] font-bold text-[#111]">Who is your target segment / group</h3>
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
                    {GROUP_OPTIONS.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => toast.success("Group created.")}
                  className="inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-white border border-[#7A0A17]/30 text-[13px] font-semibold text-[#7A0A17] hover:bg-[#FCF5F6] transition-colors shrink-0"
                >
                  <Plus size={14} /> Create
                </button>
                <p className="hidden md:block text-[13px] font-semibold text-[#9CA3AF] pb-3">OR</p>
                <div>
                  <FieldLabel required>Upload File / Bulk Import</FieldLabel>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xlsx,.xls,.txt"
                    className="hidden"
                    onChange={handleFileChosen}
                  />
                  <button
                    type="button"
                    onClick={openFilePicker}
                    className="flex items-center gap-2 w-full h-11 border border-black/12 rounded-xl px-3.5 text-left hover:bg-[#FAFAFB] transition-colors"
                  >
                    <span
                      className={`flex-1 min-w-0 truncate text-[13px] ${
                        uploadFileName ? "text-[#111] font-medium" : "text-[#9CA3AF]"
                      }`}
                    >
                      {uploadFileName || "Upload File"}
                    </span>
                    <Paperclip size={15} className="text-[#6B7280] shrink-0" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose?.();
                    navigate("/bulk-upload?from=campaign");
                  }}
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
                <h3 className="text-[15px] font-bold text-[#111]">Start Campaign</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FieldLabel required>Start of campaign</FieldLabel>
                  <ToggleGroup options={["Manual", "Time based"]} value={startMode} onChange={setStartMode} />
                  {startMode === "Time based" && (
                    <input
                      value={startAt}
                      onChange={(e) => setStartAt(e.target.value)}
                      placeholder="e.g. 01 Aug 21 - 09:32 PM"
                      className="mt-3 w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40"
                    />
                  )}
                </div>
                <div>
                  <FieldLabel required>Stop campaign</FieldLabel>
                  <ToggleGroup options={["Manual", "Time based", "Customer Action"]} value={stopMode} onChange={setStopMode} />
                  {stopMode === "Time based" && (
                    <input
                      value={endAt}
                      onChange={(e) => setEndAt(e.target.value)}
                      placeholder="e.g. 01 Aug 21 - 09:32 PM"
                      className="mt-3 w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40"
                    />
                  )}
                </div>
              </div>
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
            </div>

            <div className="flex flex-col gap-3 pt-1 border-t border-black/6">
              <div className="flex items-center gap-2.5 pt-4">
                <StepBadge n={4} />
                <h3 className="text-[15px] font-bold text-[#111]">Choose Channel Output &amp; Create Templates</h3>
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
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-black/8 shrink-0">
          <button
            type="button"
            onClick={onBack || onClose}
            className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
          >
            Back
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
    </div>
  );
}
