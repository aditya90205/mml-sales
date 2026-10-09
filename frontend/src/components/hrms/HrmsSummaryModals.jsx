import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";

const ACHIEVEMENT_KPIS = [
  { label: "Registration Value", value: "19.5 lakh" },
  { label: "Qualifying meetings", value: "46/30" },
  { label: "Google reviews", value: "7" },
  { label: "Testimonial videos", value: "3/5" },
  { label: "Wedding photo uploads", value: "5" },
  { label: "Negative reviews", value: "1" },
];

const INITIAL_COMPLAINTS_WARNINGS = [
  {
    id: 1,
    kind: "Warning",
    title: "Late arrivals — April 2025",
    raisedOn: "28 Apr 2025",
    raisedBy: "Reporting manager",
    status: "Open",
    severity: "Medium",
    detail: "Late arrivals flagged twice this month. Official warning notice issued.",
  },
  {
    id: 2,
    kind: "Complaint",
    title: "Workplace conduct — desk dispute",
    raisedOn: "04 Mar 2025",
    raisedBy: "Self",
    status: "Closed",
    severity: "Low",
    detail: "Logged and mediated by HR. No further action required.",
  },
  {
    id: 3,
    kind: "Warning",
    title: "Missed client follow-up SLA",
    raisedOn: "19 Jan 2025",
    raisedBy: "Quality desk",
    status: "Acknowledged",
    severity: "High",
    detail: "Written warning acknowledged on 21 Jan 2025.",
  },
];

export function ComplaintsWarningsPanel({ onViewNotice, embedded = false }) {
  return (
    <div className="flex flex-col gap-6 min-w-0">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Open warnings", value: "1", sub: "Needs acknowledgement" },
          { label: "Complaints filed", value: "1", sub: "Closed this year" },
          { label: "Total on record", value: "3", sub: "Warnings + complaints" },
        ].map((card) => (
          <div key={card.label} className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">{card.label}</p>
            <p className="text-xl font-extrabold text-[#111827] mt-1.5">{card.value}</p>
            <p className="text-[12.5px] text-[#6B7280] mt-1">{card.sub}</p>
          </div>
        ))}
      </div>

      <div className={embedded ? "min-w-0" : "bg-white border border-black/10 rounded-2xl p-5 shadow-sm"}>
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="size-8 rounded-lg grid place-items-center shrink-0 text-[#7A0A17]">
              <AlertTriangle size={16} strokeWidth={2} />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-[#111827]">Complaints &amp; warnings</h3>
              <p className="text-[12.5px] text-[#6B7280]">Official notices and HR-logged issues</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onViewNotice}
              className="h-9 px-3.5 rounded-xl border border-[#7A0A17] text-[#7A0A17] text-xs font-bold hover:bg-[#7A0A17] hover:text-white transition-colors"
            >
              View notice
            </button>
            <button
              type="button"
              onClick={() => toast.info("Complaint form opens here.")}
              className="h-9 px-3.5 rounded-xl bg-[#7A0A17] text-white text-xs font-bold hover:bg-[#600712] transition-colors"
            >
              Raise complaint
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-w-0 border border-black/8 rounded-xl">
          <table className="w-full min-w-[860px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#FAFAFB] border-b border-black/8">
                {["#", "Type", "Title", "Raised on", "Raised by", "Severity", "Status", "Detail"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[11px] font-bold text-[#6B7280] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {INITIAL_COMPLAINTS_WARNINGS.map((row) => (
                <tr key={row.id} className="border-b border-black/5 last:border-b-0">
                  <td className="px-4 py-3 text-[#6B7280]">{row.id}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        row.kind === "Warning"
                          ? "bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/20"
                          : "bg-[#DBEAFE] text-[#2563EB] border-[#2563EB]/20"
                      }`}
                    >
                      {row.kind}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-[#111827] whitespace-nowrap">{row.title}</td>
                  <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{row.raisedOn}</td>
                  <td className="px-4 py-3 text-[#374151] whitespace-nowrap">{row.raisedBy}</td>
                  <td className="px-4 py-3 text-[#374151]">{row.severity}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                        row.status === "Open"
                          ? "bg-[#FEF3C7] text-[#D97706] border-[#D97706]/20"
                          : row.status === "Closed"
                            ? "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/20"
                            : "bg-[#F3F4F6] text-[#4B5563] border-black/10"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280] min-w-[220px]">{row.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OfficialNoticeOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-[90] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#111]">
          <X size={18} />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <span className="size-8 rounded-lg grid place-items-center shrink-0 text-[#7A0A17]">
            <AlertTriangle size={16} strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-lg font-bold text-[#111]">Official Warning Notice</h3>
            <p className="text-xs text-[#6B7280]">Issued on April 12, 2025</p>
          </div>
        </div>
        <div className="bg-[#FCF5F6] border border-[#7A0A17]/20 rounded-xl p-4 text-xs text-[#374151] space-y-2">
          <p className="font-bold text-[#7A0A17]">Subject: Attendance & Punctuality Advisory</p>
          <p>Our records show late check-ins logged twice in the current billing month (July 29 & July 30). Please ensure compliance with standard shift hours (9:00 AM - 6:00 PM).</p>
        </div>
        <div className="mt-5 flex justify-end">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-[#7A0A17] text-white rounded-xl text-xs font-bold">
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function AchievementKpiModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} hideHeader width="max-w-[440px]" zClass="z-[80]">
      <div className="-mx-6 -mt-5 -mb-5">
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="size-11 rounded-full bg-[#7A0A17] grid place-items-center shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="8.2" stroke="white" strokeWidth="1.7" />
                <circle cx="12" cy="12" r="4.6" stroke="white" strokeWidth="1.7" />
                <circle cx="12" cy="12" r="1.35" fill="white" />
              </svg>
            </span>
            <h2 className="text-[18px] font-extrabold text-[#111827] tracking-tight">KPI Scorecard</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#9CA3AF] hover:bg-black/5 hover:text-[#111827] transition-colors shrink-0"
            aria-label="Close KPI scorecard"
          >
            <X size={18} />
          </button>
        </div>
        <ul>
          {ACHIEVEMENT_KPIS.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-4 px-5 py-3.5 border-t border-[#EEF1F6]"
            >
              <span className="text-[14px] font-medium text-[#6B7280]">{row.label}</span>
              <span className="text-[15px] font-extrabold text-[#111827] tabular-nums shrink-0">{row.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </Modal>
  );
}

export function WarningsComplaintsModal({ open, onClose }) {
  const [noticeOpen, setNoticeOpen] = useState(false);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Warnings and Complaints"
        subtitle="Official notices and HR-logged issues"
        icon={<AlertTriangle size={17} />}
        iconBg="transparent"
        iconColor="#7A0A17"
        width="max-w-6xl"
        zClass="z-[80]"
        contain
      >
        <ComplaintsWarningsPanel embedded onViewNotice={() => setNoticeOpen(true)} />
      </Modal>
      {noticeOpen && <OfficialNoticeOverlay onClose={() => setNoticeOpen(false)} />}
    </>
  );
}
