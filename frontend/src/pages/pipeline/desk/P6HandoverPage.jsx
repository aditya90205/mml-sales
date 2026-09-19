import { useState } from "react";
import { toast } from "react-toastify";
import { DeskPage, OutlineButton } from "../../../components/pipeline/deskUi";
import P6ChecklistContent from "../deal-tabs/p6/P6ChecklistContent.jsx";
import { INITIAL_SECTIONS } from "../deal-tabs/p6/p6ChecklistData.js";

export default function P6HandoverPage() {
  const [sections, setSections] = useState(INITIAL_SECTIONS);

  const allItems = sections.flatMap((s) => s.items);
  const doneCount = allItems.filter((i) => i.done).length;
  const totalCount = allItems.length;
  const percent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const checklistReady = percent === 100;

  const toggleItem = (id) => {
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

  return (
    <DeskPage
      title="P6 Handover Checklist"
      actions={
        <OutlineButton onClick={() => toast.info("Checklist template downloaded.")}>Checklist template</OutlineButton>
      }
    >
      <P6ChecklistContent
        checklistReady={checklistReady}
        sections={sections}
        onSectionsChange={setSections}
        onToggleItem={toggleItem}
      />
    </DeskPage>
  );
}
