import { useState } from "react";
import { Pencil } from "lucide-react";
import Modal from "../../../../components/ui/Modal";
import {
  SECTIONS_META,
  SECTION_BLOCKS,
  SECTION_TIPS,
  cloneSectionDraft,
} from "./intakeFormData";
import { FormBlock } from "./IntakeSectionFields";

function SectionEditBody({ sectionKey, values, chips, onClose, onSave }) {
  const meta = SECTIONS_META.find((s) => s.key === sectionKey);
  const blocks = SECTION_BLOCKS[sectionKey] || [];
  const sectionIndex = SECTIONS_META.findIndex((s) => s.key === sectionKey);

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

  const tip = SECTION_TIPS[sectionKey];

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${meta.label}`}
      subtitle={`Section ${String(sectionIndex + 1).padStart(2, "0")} of ${String(SECTIONS_META.length).padStart(2, "0")} — changes save only after client OTP`}
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
            onClick={() => onSave?.({ values: draftValues, chips: draftChips })}
            className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Save &amp; send OTP
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-[#7A0A17]/15 bg-[#FCF5F6] px-4 py-3">
          <p className="text-[13px] font-semibold text-[#7A0A17]">Client OTP required</p>
          <p className="text-[12.5px] text-[#6B7280] mt-0.5">
            After you save, send OTP to the client and enter it to update this section.
          </p>
        </div>

        {tip && (
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-4 py-3">
            <p className="text-[12.5px] text-[#92400E] italic leading-relaxed">{tip}</p>
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
    />
  );
}
