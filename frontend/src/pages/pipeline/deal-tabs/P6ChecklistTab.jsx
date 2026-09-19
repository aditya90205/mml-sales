import { useState } from "react";
import { toast } from "react-toastify";
import LockedTabOverlay from "../../../components/pipeline/LockedTabOverlay";
import { OutlineButton, PrimaryButton } from "../../../components/pipeline/deskUi";
import P6ChecklistContent from "./p6/P6ChecklistContent.jsx";
import { INITIAL_SECTIONS } from "./p6/p6ChecklistData.js";

/** Same design and data as the standalone "P6 Handover Checklist" page. */
export default function P6ChecklistTab({
  locked = true,
  allUnchecked = false,
  onHandoverToServices,
  serviceAssigned = null,
}) {
  const [sections, setSections] = useState(INITIAL_SECTIONS);

  const visibleItems = allUnchecked
    ? sections.flatMap((s) => s.items).map((item) => ({ ...item, done: false }))
    : sections.flatMap((s) => s.items);
  const doneCount = visibleItems.filter((i) => i.done).length;
  const totalCount = visibleItems.length;
  const percent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const checklistReady = !allUnchecked && percent === 100;

  const toggleItem = (id) => {
    if (allUnchecked) return;
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        items: section.items.map((item) => {
          if (item.id !== id) return item;
          const done = !item.done;
          return {
            ...item,
            done,
            status: done ? "Verified" : "Pending",
            tone: done ? "green" : "amber",
          };
        }),
      }))
    );
  };

  const content = (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <h2 className="text-[16px] font-bold text-[#111]">P6 Handover Checklist</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <OutlineButton onClick={() => toast.info("Checklist template downloaded.")}>Checklist template</OutlineButton>
          {serviceAssigned ? (
            <PrimaryButton onClick={() => onHandoverToServices?.()}>
              Service manager is assigned
            </PrimaryButton>
          ) : checklistReady ? (
            <PrimaryButton onClick={() => onHandoverToServices?.()}>
              Handover to services
            </PrimaryButton>
          ) : null}
        </div>
      </div>

      {serviceAssigned && (
        <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#14532D]">Service manager is assigned</p>
            <p className="text-[12px] text-[#166534] mt-0.5">
              {serviceAssigned.manager} · {serviceAssigned.branch}
            </p>
          </div>
          <OutlineButton onClick={() => onHandoverToServices?.()}>View branch manager</OutlineButton>
        </div>
      )}

      <P6ChecklistContent
        allUnchecked={allUnchecked}
        serviceAssigned={serviceAssigned}
        checklistReady={checklistReady}
        sections={sections}
        onSectionsChange={setSections}
        onToggleItem={toggleItem}
      />
    </div>
  );

  if (!locked) return content;

  return (
    <LockedTabOverlay title="P6 Checklist is locked." message="This screen will open at P5 stage.">
      {content}
    </LockedTabOverlay>
  );
}
