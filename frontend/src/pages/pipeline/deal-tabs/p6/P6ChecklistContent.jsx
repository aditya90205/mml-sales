import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import StatusPill from "../../../../components/common/StatusPill";
import { useTableSort } from "../../../../components/common/useTableSort.jsx";
import {
  CheckRow,
  DeskTable,
  FilterSelect,
  ProgressMeter,
  SectionCard,
  StepLabel,
  Td,
} from "../../../../components/pipeline/deskUi";
import { dashRow, dashRows } from "../stageContent.jsx";
import P6DocumentUploadModal from "./P6DocumentUploadModal.jsx";
import { applyItemUpload, QUEUE, QUEUE_COLUMNS } from "./p6ChecklistData.js";

const ACTION_BTN =
  "inline-flex items-center justify-center h-9 px-3.5 rounded-lg bg-white border border-black/15 text-[12.5px] font-semibold text-[#111] hover:bg-[#FAFAFB] transition-colors shrink-0";

function VerifiedCell({ pct, label, color }) {
  return (
    <div className="flex items-center gap-2 min-w-[110px]">
      <div className="flex-1 h-1.5 rounded-full bg-[#F1F2F4] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-[11.5px] font-semibold text-[#4B5563]">{label}</span>
    </div>
  );
}

export default function P6ChecklistContent({
  allUnchecked = false,
  serviceAssigned = null,
  checklistReady = false,
  onToggleItem,
  sections,
  onSectionsChange,
  clientName = "Sanjay Mehta",
}) {
  const [sortMode, setSortMode] = useState("blocked");
  const [period, setPeriod] = useState("month");
  const [uploadItem, setUploadItem] = useState(null);

  const visibleSections = allUnchecked
    ? sections.map((s) => ({
        ...s,
        items: s.items.map((item) => dashRow({ ...item, done: false, tone: "gray", files: [] }, ["title", "note", "id", "upload", "idType", "otp"])),
      }))
    : sections;
  const allItems = visibleSections.flatMap((s) => s.items);
  const doneCount = allItems.filter((i) => i.done).length;
  const totalCount = allItems.length;
  const percent = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

  const rows = useMemo(() => {
    const list = [...QUEUE];
    if (sortMode === "blocked") list.sort((a, b) => a.verifiedPct - b.verifiedPct);
    else list.sort((a, b) => b.verifiedPct - a.verifiedPct);
    return list;
  }, [sortMode]);
  const { sorted, sort, toggle } = useTableSort(dashRows(rows, allUnchecked, ["deal", "verifiedPct", "bar"]), { defaultKey: "deal" });

  const handleUploaded = (payload) => {
    if (!uploadItem) return;
    onSectionsChange(applyItemUpload(sections, uploadItem.id, payload));
    toast.success(`${uploadItem.title} verified.`);
    setUploadItem(null);
  };

  return (
    <>
      <SectionCard
        title={`P6 Handover Checklist — ${allUnchecked ? "-" : clientName}`}
        subtitle={
          serviceAssigned
            ? `Handed over to services · ${serviceAssigned.manager}`
            : checklistReady
              ? "Checklist complete — ready for handover to services."
              : "Service assignment stays blocked until every item is verified."
        }
        action={<ProgressMeter label={`${doneCount} / ${totalCount} verified`} percent={percent} color={percent === 100 ? "#16A34A" : "#E8395B"} />}
      >
        {visibleSections.map((section, si) => (
          <div key={section.heading} className={si > 0 ? "mt-5" : ""}>
            <StepLabel n={section.n}>{section.heading}</StepLabel>
            {section.items.map((item, i) => (
              <CheckRow
                key={`${item.id || item.title}-${i}`}
                {...item}
                onToggle={item.upload || allUnchecked ? undefined : () => onToggleItem?.(item.id || item.title)}
                action={
                  item.upload && !allUnchecked ? (
                    <button type="button" onClick={() => setUploadItem(item)} className={ACTION_BTN}>
                      {item.done
                        ? "Replace"
                        : item.upload === "id-card"
                          ? "Verify"
                          : "Upload"}
                    </button>
                  ) : null
                }
              />
            ))}
          </div>
        ))}
      </SectionCard>

      <SectionCard
        title="Handover queue"
        subtitle="Your deals at P6"
        action={
          <>
            <FilterSelect
              value={sortMode}
              onChange={setSortMode}
              options={[
                { value: "blocked", label: "Blocked first" },
                { value: "ready", label: "Ready first" },
              ]}
            />
            <FilterSelect
              value={period}
              onChange={setPeriod}
              options={[
                { value: "month", label: "This month" },
                { value: "quarter", label: "This quarter" },
              ]}
            />
          </>
        }
        footnote="A founder exception can release a deal to Service with items outstanding. Every exception is logged in the audit trail."
      >
        <DeskTable columns={QUEUE_COLUMNS} sort={sort} onSort={toggle}>
          {sorted.map((row, i) => (
            <tr key={`${row.deal}-${i}`} className="border-b border-black/5 last:border-0">
              <Td>{row.deal}</Td>
              <Td strong>{row.client}</Td>
              <Td>{row.pkg}</Td>
              <td className="px-3 py-3 whitespace-nowrap">
                <VerifiedCell pct={row.verifiedPct} label={row.verified} color={row.bar} />
              </td>
              <Td>{row.blocking}</Td>
              <Td>{row.owner}</Td>
              <Td>
                <StatusPill tone={row.tone}>{row.status}</StatusPill>
              </Td>
            </tr>
          ))}
        </DeskTable>
      </SectionCard>

      <P6DocumentUploadModal
        open={Boolean(uploadItem)}
        item={uploadItem}
        onClose={() => setUploadItem(null)}
        onUploaded={handleUploaded}
      />
    </>
  );
}
