import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { Upload } from "lucide-react";
import {
  SECTIONS_META,
  SECTION_BLOCKS,
  SECTION_TIPS,
  OVERALL_TOTAL_FIELDS,
  OVERALL_FILLED_FIELDS,
  computeSectionPercent,
  countSectionFields,
} from "./intakeFormData";
import { FormBlock } from "./IntakeSectionFields";
import Modal from "../../../../components/ui/Modal";
import DocumentsKycTab from "../DocumentsKycTab";

function SectionHeader({
  index,
  totalSections,
  label,
  filled,
  total,
  tip,
  onOpenDocumentsKyc,
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wide">
          Section {String(index + 1).padStart(2, "0")} of {String(totalSections).padStart(2, "0")}
        </p>
        <div className="flex items-end justify-between gap-3 flex-wrap mt-1">
          <h2 className="text-[26px] font-bold text-[#111] tracking-tight leading-tight">{label}</h2>
          <p className="text-[12.5px] text-[#9CA3AF] shrink-0 pb-1">
            {filled} of {total} filled in this section
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={() => toast.info("Voice note recording coming soon.")}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#374151] hover:bg-[#FAFAFB] transition-colors"
        >
          <span className="size-2.5 rounded-full bg-[#E8395B] shrink-0" />
          Record voice note for this section
        </button>
        <button
          type="button"
          onClick={onOpenDocumentsKyc}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#374151] hover:bg-[#FAFAFB] transition-colors"
        >
          Document & KYC
        </button>
      </div>

      {tip && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-4 py-3">
          <p className="text-[12.5px] text-[#92400E] italic leading-relaxed">{tip}</p>
        </div>
      )}
    </div>
  );
}

function FormFilledCard({ percent, filled, total }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">Form filled</p>
      <div className="flex items-end gap-2.5 mt-1 flex-wrap">
        <p className="text-[32px] font-extrabold text-[#7A0A17] leading-none">{percent}%</p>
        <p className="text-[11.5px] text-[#9CA3AF] pb-1">
          {filled} of {total} fields
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-[#F1F2F4] overflow-hidden mt-3">
        <div className="h-full rounded-full bg-[#E8395B]/70" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function SectionsSidebar({ sections, activeKey, onSelect }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
      <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide px-5 pt-4 pb-3">Booklet sections</p>
      <div className="flex flex-col">
        {sections.map((s, i) => {
          const active = s.key === activeKey;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onSelect(s.key)}
              className={`flex items-center justify-between gap-3 px-5 py-3 text-left border-l-[3px] transition-colors ${
                active ? "border-[#7A0A17] bg-[#FCF5F6]" : "border-transparent hover:bg-[#FAFAFB]"
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className={`text-[11px] font-bold shrink-0 ${active ? "text-[#7A0A17]" : "text-[#9CA3AF]"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className={`text-[12.5px] leading-snug ${active ? "font-bold text-[#7A0A17]" : "text-[#374151]"}`}>
                  {s.label}
                </span>
              </span>
              <span className="text-[11px] text-[#9CA3AF] shrink-0">{s.percent}%</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SelectedDocumentsCard({ documents }) {
  if (!documents?.length) return null;

  return (
    <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-5 pt-4 pb-3">
        <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">Selected documents</p>
        <span className="text-[11px] font-semibold text-[#7A0A17]">{documents.length}</span>
      </div>
      <div className="flex flex-col border-t border-black/6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-start gap-2.5 px-5 py-3 border-b border-black/5 last:border-0"
          >
            <span className="mt-0.5 size-4 rounded border border-[#16A34A] bg-[#E7F8EF] grid place-items-center shrink-0">
              <span className="text-[9px] font-bold text-[#16A34A]">✓</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12.5px] font-semibold text-[#111] leading-snug">
                {doc.label}
                {doc.mandatory ? <span className="text-[#E8395B]"> *</span> : null}
              </p>
              {doc.fileName ? (
                <p className="text-[11px] text-[#16A34A] mt-0.5 truncate">{doc.fileName}</p>
              ) : (
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">Selected · file pending</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * "Fill the form" view — section header, field blocks, progress rail.
 */
export default function IntakeFillFormView({
  empty,
  activeKey,
  setActiveKey,
  values,
  setField,
  chips,
  removeChip,
  personalUnlocked = false,
  onRequestPersonalUnlock,
  onRequestPersonalSave,
  onFinishToRecord,
}) {
  const [documentsKycOpen, setDocumentsKycOpen] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const biodataInputRef = useRef(null);
  const documentsKycRef = useRef(null);

  const handleBiodataUpload = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    toast.success(`Biodata uploaded: ${file.name}`);
  };

  const handleDocumentsKycDone = () => {
    const selected = documentsKycRef.current?.getSelectedDocs?.() || [];
    setSelectedDocuments(selected);
    setDocumentsKycOpen(false);
    if (selected.length) {
      toast.success(`${selected.length} document${selected.length === 1 ? "" : "s"} saved.`);
    } else {
      toast.info("No documents selected.");
    }
  };

  const activeIndex = SECTIONS_META.findIndex((s) => s.key === activeKey);
  const activeBlocks = SECTION_BLOCKS[activeKey];
  const activeCounts = empty
    ? { filled: 0, total: activeBlocks?.reduce((sum, b) => sum + b.fields.length, 0) || 0 }
    : countSectionFields(activeBlocks, values, chips);

  const sections = SECTIONS_META.map((s) => ({
    ...s,
    percent: empty ? 0 : computeSectionPercent(SECTION_BLOCKS[s.key], values, chips),
  }));

  const overallPercent = empty ? 0 : Math.round((OVERALL_FILLED_FIELDS / OVERALL_TOTAL_FIELDS) * 100);
  const isPersonal = activeKey === "personal";
  const personalLocked = isPersonal && !personalUnlocked;

  const handleNext = () => {
    if (isPersonal) {
      onRequestPersonalSave?.({
        onSuccess: () => {
          const next = SECTIONS_META[activeIndex + 1];
          if (next) {
            toast.success(`Saved. Continuing to ${next.label}.`);
            setActiveKey(next.key);
          } else {
            toast.success("Intake form saved.");
            onFinishToRecord?.();
          }
        },
      });
      return;
    }

    const next = SECTIONS_META[activeIndex + 1];
    if (next) {
      toast.success(`Saved. Continuing to ${next.label}.`);
      setActiveKey(next.key);
    } else {
      toast.success("Intake form saved.");
      onFinishToRecord?.();
    }
  };

  const handlePrev = () => {
    const prev = SECTIONS_META[activeIndex - 1];
    if (prev) setActiveKey(prev.key);
  };

  const nextLabel =
    activeIndex < SECTIONS_META.length - 1
      ? `Save and continue to ${SECTIONS_META[activeIndex + 1].label}`
      : "Finish and open the client record";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)] gap-5 items-start">
      <div className="flex flex-col gap-5 min-w-0">
        <SectionHeader
          index={activeIndex}
          totalSections={SECTIONS_META.length}
          label={SECTIONS_META[activeIndex].label}
          filled={activeCounts.filled}
          total={activeCounts.total}
          tip={SECTION_TIPS[activeKey]}
          onOpenDocumentsKyc={() => setDocumentsKycOpen(true)}
        />

        {isPersonal && (
          <div
            className={`rounded-xl border px-4 py-3 flex items-start justify-between gap-3 flex-wrap ${
              personalLocked
                ? "bg-[#FFFBEB] border-[#FDE68A]"
                : "bg-[#E7F8EF] border-[#BBF7D0]"
            }`}
          >
            <div className="min-w-0">
              <p
                className={`text-[13px] font-semibold ${
                  personalLocked ? "text-[#92400E]" : "text-[#166534]"
                }`}
              >
                {personalLocked
                  ? "Personal details are locked"
                  : "Personal details unlocked for editing"}
              </p>
              <p
                className={`text-[12.5px] mt-0.5 ${
                  personalLocked ? "text-[#92400E]/90" : "text-[#166534]/90"
                }`}
              >
                {personalLocked
                  ? "Verify OTP before changing any field. Saved changes appear in the client-record summary."
                  : "Edit freely, then save — OTP will confirm before changes are committed to the summary."}
              </p>
            </div>
            {personalLocked ? (
              <button
                type="button"
                onClick={onRequestPersonalUnlock}
                className="h-9 px-3.5 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors shrink-0"
              >
                Verify OTP to edit
              </button>
            ) : (
              <span className="inline-flex items-center h-9 px-3 rounded-full bg-white/80 text-[12px] font-semibold text-[#166534] shrink-0">
                Editing unlocked
              </span>
            )}
          </div>
        )}

        {activeBlocks ? (
          activeBlocks.map((block) => (
            <FormBlock
              key={block.title}
              block={block}
              values={values}
              chipValues={chips}
              onFieldChange={setField}
              onRemoveChip={removeChip}
              locked={personalLocked}
            />
          ))
        ) : (
          <div className="bg-white border border-black/8 rounded-2xl p-8 text-center">
            <p className="text-[14px] font-bold text-[#111]">{SECTIONS_META[activeIndex].label}</p>
            <p className="text-[12.5px] text-[#9CA3AF] mt-1.5">This section&apos;s fields haven&apos;t been added yet.</p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 bg-white border border-black/8 rounded-2xl px-5 py-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="h-10 px-4 rounded-xl border border-black/12 text-[13px] font-semibold text-[#374151] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FAFAFB] transition-colors"
          >
            Previous section
          </button>
          <span className="text-[12.5px] text-[#9CA3AF]">
            Section {activeIndex + 1} of {SECTIONS_META.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            {nextLabel}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <FormFilledCard percent={overallPercent} filled={empty ? 0 : OVERALL_FILLED_FIELDS} total={OVERALL_TOTAL_FIELDS} />
        <SectionsSidebar sections={sections} activeKey={activeKey} onSelect={setActiveKey} />
        <SelectedDocumentsCard documents={selectedDocuments} />
      </div>

      <Modal
        open={documentsKycOpen}
        onClose={() => setDocumentsKycOpen(false)}
        title="Documents & KYC"
        subtitle="Aadhaar and PAN auto-verify via KYC API"
        width="max-w-2xl"
        headerActions={
          <>
            <input
              ref={biodataInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={handleBiodataUpload}
            />
            <button
              type="button"
              onClick={() => biodataInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-black/12 text-[12.5px] font-semibold text-[#111] hover:bg-[#FAFAFB] transition-colors"
            >
              <Upload size={14} />
              Upload Biodata
            </button>
          </>
        }
        footer={
          <button
            type="button"
            onClick={handleDocumentsKycDone}
            className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Done
          </button>
        }
      >
        <DocumentsKycTab ref={documentsKycRef} empty={empty} embedded />
      </Modal>
    </div>
  );
}
