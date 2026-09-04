import { useState } from "react";
import { toast } from "react-toastify";
import ChecklistCheck from "../../../components/common/ChecklistCheck";
import StatusPill from "../../../components/common/StatusPill";
import TabHeaderButton from "../../../components/pipeline/TabHeaderButton";
import LockedTabOverlay from "../../../components/pipeline/LockedTabOverlay";

const INITIAL_CHECKLIST = [
  { label: "Identity & verification documents", note: "Identity & verification documents 6 of 7 items verified", status: "1 Pending", tone: "amber", done: false },
  { label: "Payment & contract",                 note: "Contract signed, ₹18,100 balance outstanding",           status: "1 Pending", tone: "amber", done: false },
  { label: "Profile & data completeness",        note: "Bio-data, photos and preferences captured",              status: "Complete",  tone: "green", done: true },
  { label: "Client self-approval of visibility", note: "Client confirmed what may be shown to matches",          status: "Complete",  tone: "green", done: true },
  { label: "Data privacy consent",               note: "Accepted 29 Jun, 4:02 PM",                                status: "Complete",  tone: "green", done: true },
  { label: "Service assignment",                 note: "Blocked until all items verified",                       status: "Blocked",   tone: "red",   done: false, blocked: true },
];

/** P6 Checklist tab — blurred until Move to P6. */
export default function P6ChecklistTab({ locked = true }) {
  const [items, setItems] = useState(INITIAL_CHECKLIST);

  const toggleItem = (label) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.label !== label) return item;
        const done = !item.done;
        return {
          ...item,
          done,
          blocked: false,
          status: done ? "Complete" : "Pending",
          tone: done ? "green" : "amber",
        };
      })
    );
  };

  const content = (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold text-[#111]">P6 Checklist</h3>
          <p className="text-[12px] text-[#9CA3AF] mt-0.5">The gate between Sales and Service</p>
        </div>
        <TabHeaderButton onClick={() => toast.info("Handover request sent.")}>Request handover</TabHeaderButton>
      </div>

      <div className="flex flex-col divide-y divide-black/5">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => toggleItem(item.label)}
            className="w-full flex items-center gap-3 py-3.5 flex-wrap sm:flex-nowrap text-left cursor-pointer"
          >
            <ChecklistCheck done={item.done} blocked={item.blocked && !item.done} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#111]">{item.label}</p>
              <p className="text-[11.5px] text-[#9CA3AF] mt-0.5">{item.note}</p>
            </div>
            <StatusPill tone={item.tone}>{item.status}</StatusPill>
          </button>
        ))}
      </div>
    </div>
  );

  if (!locked) return content;

  return (
    <LockedTabOverlay title="P6 Checklist is locked." message="This screen will open at P6 stage.">
      {content}
    </LockedTabOverlay>
  );
}
