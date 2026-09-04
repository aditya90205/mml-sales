import { CheckCheck, MailOpen, MousePointerClick, Send } from "lucide-react";
import { toast } from "react-toastify";
import { parseChannels } from "../../utils/campaignChannels.js";

const AUDIENCE_SIZE_BY_TARGET = {
  "Common Pool": "612 Contacts",
  Jalandhar: "185 Contacts",
  Doctors: "248 Contacts",
  "IIT, IIM": "96 Contacts",
  "P3 Pipeline": "134 Contacts",
  "New Opportunity": "310 Contacts",
};

const KPI_STATS = [
  { key: "sent", label: "Sent", value: "25", icon: Send, fg: "#F59E0B" },
  { key: "delivered", label: "Delivered", value: "20", icon: CheckCheck, fg: "#16A34A" },
  { key: "opened", label: "Opened", value: "14", icon: MailOpen, fg: "#2563EB" },
  { key: "clicked", label: "Clicked", value: "08", icon: MousePointerClick, fg: "#E8395B" },
];

const STATUS_STYLES = {
  "Not Started": "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/25",
  Active: "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/25",
  Completed: "bg-[#DBEAFE] text-[#2563EB] border-[#2563EB]/20",
  Scheduled: "bg-[#FEF3C7] text-[#D97706] border-[#D97706]/20",
  "Stop Manually": "bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/20",
};

function OverviewField({ label, children }) {
  return (
    <div>
      <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#9CA3AF]">{label}</p>
      <div className="text-[14px] font-bold text-[#111] mt-1">{children}</div>
    </div>
  );
}

export default function CampaignViewModal({ open, onClose, campaign }) {
  if (!open || !campaign) return null;

  const channels = parseChannels(campaign.channel);
  const audienceSize = AUDIENCE_SIZE_BY_TARGET[campaign.target] || "—";
  const triggerType = campaign.start === "Manual" ? "Manual Trigger" : "Scheduled Batch";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative z-10 w-full max-w-3xl bg-white rounded-2xl shadow-xl flex flex-col max-h-[92vh] overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-black/8">
          <h2 className="text-xl font-bold text-[#111]">Campaign Settings &amp; KPI</h2>
          <p className="text-[13px] text-[#9CA3AF] mt-1">
            Scheduling and performance snapshot for <span className="font-semibold text-[#374151]">{campaign.name}</span>.
          </p>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-5">
          {/* Scheduling */}
          <div className="border border-black/10 rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-[15px] font-bold text-[#111] pb-3 border-b border-black/8">Scheduling</h3>

            <div>
              <p className="text-[11px] font-bold text-[#111] mb-1.5">Start Date &amp; Time</p>
              <div className="h-11 rounded-xl bg-[#FAFAFB] border border-black/10 px-3.5 flex items-center text-[13px] text-[#374151] font-medium">
                {campaign.start}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#111] mb-1.5">End Configuration</p>
              <div className="h-11 rounded-xl bg-[#FAFAFB] border border-black/10 px-3.5 flex items-center text-[13px] text-[#374151] font-medium">
                {campaign.end}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-bold text-[#111] mb-1.5">Status</p>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border ${STATUS_STYLES[campaign.status] || "bg-[#F1F2F4] text-[#6B7280] border-black/10"}`}>
                {campaign.status}
              </span>
            </div>
          </div>

          {/* KPI + Overview */}
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-4 gap-2.5">
              {KPI_STATS.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.key} className="border border-black/10 rounded-xl px-2.5 py-3 flex flex-col items-center text-center gap-1.5">
                    <Icon size={17} style={{ color: s.fg }} strokeWidth={1.8} />
                    <p className="text-[10px] text-[#9CA3AF]">{s.label}</p>
                    <p className="text-[17px] font-bold text-[#111] leading-none">{s.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="border border-black/10 rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="text-[15px] font-bold text-[#111] pb-3 border-b border-black/8">Campaign Overview</h3>

              <div className="grid grid-cols-2 gap-4">
                <OverviewField label="Target Group">{campaign.target}</OverviewField>
                <OverviewField label="Audience Size">{audienceSize}</OverviewField>
                <OverviewField label="Owner">{campaign.owner}</OverviewField>
                <OverviewField label="Trigger Type">{triggerType}</OverviewField>
                <OverviewField label="Start Date & Time">{campaign.start}</OverviewField>
                <OverviewField label="End Date & Time">{campaign.end}</OverviewField>
              </div>

              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#9CA3AF] mb-1.5">Active Channels</p>
                <div className="flex items-center gap-2">
                  {channels.map(({ label, Icon }) => (
                    <span
                      key={label}
                      title={label}
                      className="size-8 rounded-lg bg-[#FCF5F6] border border-[#7A0A17]/20 grid place-items-center"
                    >
                      <Icon size={15} className="text-[#7A0A17]" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2.5 px-6 py-4 border-t border-black/8 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
          >
            Back
          </button>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => toast.success(`Draft saved for ${campaign.name}.`)}
              className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
