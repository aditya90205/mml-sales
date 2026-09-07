import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../../../../components/ui/Modal";
import {
  SECTIONS_META,
  SECTION_BLOCKS,
  SECTION_TIPS,
  cloneSectionDraft,
} from "./intakeFormData";
import { FormBlock } from "./IntakeSectionFields";

function SectionEditBody({
  sectionKey,
  values,
  chips,
  onClose,
  onSave,
  personalUnlocked,
  onRequestPersonalUnlock,
}) {
  const meta = SECTIONS_META.find((s) => s.key === sectionKey);
  const blocks = SECTION_BLOCKS[sectionKey] || [];
  const sectionIndex = SECTIONS_META.findIndex((s) => s.key === sectionKey);
  const isPersonal = sectionKey === "personal";
  const personalLocked = isPersonal && !personalUnlocked;

  const initial = cloneSectionDraft(blocks, values, chips);
  const [draftValues, setDraftValues] = useState(initial.draftValues);
  const [draftChips, setDraftChips] = useState(initial.draftChips);

  if (!meta) return null;

  const setField = (key, value) => setDraftValues((prev) => ({ ...prev, [key]: value }));
  const removeChip = (chipsKey, chip) =>
    setDraftChips((prev) => ({
      ...prev,
      [chipsKey]: (prev[chipsKey] || []).filter((c) => c !== chip),
    }));

  const handleSave = () => {
    if (isPersonal && personalLocked) {
      toast.info("Verify OTP before editing personal details.");
      return;
    }
    onSave?.({ values: draftValues, chips: draftChips });
  };

  const tip = SECTION_TIPS[sectionKey];

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${meta.label}`}
      subtitle={`Section ${String(sectionIndex + 1).padStart(2, "0")} of ${String(SECTIONS_META.length).padStart(2, "0")} — update fields in this section only`}
      icon={<Pencil size={18} />}
      iconBg="#F3E8F0"
      iconColor="#7A0A17"
      width="max-w-4xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={personalLocked}
            className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save section
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {tip && (
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-4 py-3">
            <p className="text-[12.5px] text-[#92400E] italic leading-relaxed">{tip}</p>
          </div>
        )}

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
                  ? "Verify OTP before changing any field."
                  : "Edit freely, then save — OTP will confirm before changes are committed."}
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

        {blocks.length ? (
          blocks.map((block) => (
            <FormBlock
              key={block.title}
              block={block}
              values={draftValues}
              chipValues={draftChips}
              onFieldChange={setField}
              onRemoveChip={removeChip}
              locked={personalLocked}
            />
          ))
        ) : (
          <p className="text-[13px] text-[#6B7280] text-center py-8">
            This section&apos;s fields haven&apos;t been added yet.
          </p>
        )}
      </div>
    </Modal>
  );
}

/**
 * Edit a single intake booklet section in a modal (Client record → Edit).
 * Remounts body when section opens so draft state initializes cleanly.
 */
export default function SectionEditModal({
  open,
  sectionKey,
  values,
  chips,
  onClose,
  onSave,
  personalUnlocked = false,
  onRequestPersonalUnlock,
}) {
  if (!open || !sectionKey) return null;

  return (
    <SectionEditBody
      key={sectionKey}
      sectionKey={sectionKey}
      values={values}
      chips={chips}
      onClose={onClose}
      onSave={onSave}
      personalUnlocked={personalUnlocked}
      onRequestPersonalUnlock={onRequestPersonalUnlock}
    />
  );
}
