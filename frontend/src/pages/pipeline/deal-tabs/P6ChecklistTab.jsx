import { AlertTriangle, Check } from "lucide-react";
import LockedTabOverlay from "../../../components/pipeline/LockedTabOverlay";
import StatusPill from "../../../components/pipeline/StatusPill";

const CHECKLIST = [
  { label: "Identity & verification documents", note: "Identity & verification documents 6 of 7 items verified", status: "1 Pending", tone: "amber", state: "pending" },
  { label: "Payment & contract",                 note: "Contract signed, ₹18,100 balance outstanding",           status: "1 Pending", tone: "amber", state: "pending" },
  { label: "Profile & data completeness",        note: "Bio-data, photos and preferences captured",              status: "Complete",  tone: "green", state: "done" },
  { label: "Client self-approval of visibility", note: "Client confirmed what may be shown to matches",          status: "Complete",  tone: "green", state: "done" },
  { label: "Data privacy consent",               note: "Accepted 29 Jun, 4:02 PM",                                status: "Complete",  tone: "green", state: "done" },
  { label: "Service assignment",                 note: "Blocked until all items verified",                       status: "Blocked",   tone: "red",   state: "blocked" },
];

const INDICATOR_CLASSES = {
  pending: "bg-white border border-black/15",
  done:    "bg-[#16A34A]",
  blocked: "bg-[#E8395B]",
};

/** P6 Checklist tab — locked until the deal reaches P5, shown as a blurred preview. */
export default function P6ChecklistTab() {
  return (
    <LockedTabOverlay title="Payment is locked." message="This screen will open at P5 stage.">
      <div className="bg-white border border-black/8 rounded-2xl p-5">
        <h3 className="text-[14px] font-bold text-[#111]">P6 Checklist</h3>
        <p className="text-[12px] text-[#9CA3AF] mt-0.5 mb-1">The gate between Sales and Service</p>

        <div className="flex flex-col divide-y divide-black/5">
          {CHECKLIST.map((item) => (
            <div key={item.label} className="flex items-center gap-3 py-3.5 flex-wrap sm:flex-nowrap">
              <span className={`size-[18px] rounded-full grid place-items-center shrink-0 ${INDICATOR_CLASSES[item.state]}`}>
                {item.state === "done" && <Check size={12} className="text-white" strokeWidth={3} />}
                {item.state === "blocked" && <AlertTriangle size={11} className="text-white" strokeWidth={2.5} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#111]">{item.label}</p>
                <p className="text-[11.5px] text-[#9CA3AF] mt-0.5">{item.note}</p>
              </div>
              <StatusPill tone={item.tone}>{item.status}</StatusPill>
            </div>
          ))}
        </div>
      </div>
    </LockedTabOverlay>
  );
}
