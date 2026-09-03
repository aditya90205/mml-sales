import LockedTabOverlay from "../../../components/pipeline/LockedTabOverlay";
import StatusPill from "../../../components/pipeline/StatusPill";

const DOT_TONES = {
  green: "bg-[#16A34A]",
  amber: "bg-[#F59E0B]",
  red:   "bg-[#E8395B]",
};

const CHECKLIST = [
  { label: "Identity & verification documents", note: "Identity & verification documents ID for 2 items verified.", status: "Pending",  tone: "amber" },
  { label: "Payment & contract",                 note: "Contract signed. Full P5 balance outstanding.",             status: "Pending",  tone: "amber" },
  { label: "Profile & data completeness",        note: "Bio data, photos and professional details approved.",      status: "Complete", tone: "green" },
  { label: "Client self-approval of visibility", note: "Client confirmed what may be shown on matches.",           status: "Complete", tone: "green" },
  { label: "Data privacy consent",               note: "Accepted 29 Jun, 10:42 PM",                                 status: "Complete", tone: "green" },
  { label: "Service assignment",                 note: "Blocked until all items above are verified.",              status: "Blocked",  tone: "red" },
];

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
              <span className={`size-2.5 rounded-full shrink-0 ${DOT_TONES[item.tone]}`} />
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
