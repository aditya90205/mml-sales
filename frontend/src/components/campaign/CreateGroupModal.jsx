import { useEffect, useState } from "react";
import { Plus, Sparkles, X } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal.jsx";
import { CLIENTS } from "../../utils/clientsData.js";
import { addSavedGroup } from "../../utils/clientGroups.js";
import {
  FIELD_OPTIONS,
  OPERATOR_OPTIONS,
  makeCondition,
  matchesAll,
  parseDescription,
  usesSelectValue,
  valueOptionsFor,
} from "../../utils/clientQuery.js";

function FieldSelect({ value, onChange, options, placeholder, className = "w-[200px]" }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-11 shrink-0 appearance-none border border-black/12 rounded-lg px-3.5 pr-8 text-[14px] text-[#111] outline-none bg-white bg-[length:12px] bg-[right_12px_center] bg-no-repeat focus:border-[#7A0A17]/40 ${className}`}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function ConditionRow({ index, condition, onChange, onRemove }) {
  const valueOpts = valueOptionsFor(condition.field, CLIENTS);
  const showSelect = usesSelectValue(condition.field, condition.operator) && valueOpts.length > 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      <span className="w-14 shrink-0 text-[13px] font-extrabold text-[#111]">{index === 0 ? "WHERE" : "AND"}</span>

      <FieldSelect
        value={condition.field}
        onChange={(field) => onChange({ ...condition, field, value: "" })}
        options={FIELD_OPTIONS}
        className="w-[180px] sm:w-[200px]"
      />

      <FieldSelect
        value={condition.operator}
        onChange={(operator) => onChange({ ...condition, operator })}
        options={OPERATOR_OPTIONS}
        className="w-[140px] sm:w-[150px]"
      />

      {showSelect ? (
        <FieldSelect
          value={condition.value}
          onChange={(value) => onChange({ ...condition, value })}
          options={valueOpts}
          placeholder="Select"
          className="w-[160px] sm:w-[180px]"
        />
      ) : (
        <input
          value={condition.value}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          placeholder="Value"
          className="h-11 w-[160px] sm:w-[180px] shrink-0 border border-black/12 rounded-lg px-3.5 text-[14px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40"
        />
      )}

      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove condition"
        className="size-9 grid place-items-center rounded-lg text-[#9CA3AF] hover:bg-[#FAFAFB] hover:text-[#DC2626] transition-colors shrink-0"
      >
        <X size={16} />
      </button>
    </div>
  );
}

const DEFAULT_CONDITIONS = [
  { ...makeCondition(), field: "Gender", operator: "is", value: "Female" },
  { ...makeCondition(), field: "Area", operator: "is", value: "Rohini" },
  { ...makeCondition(), field: "Education / College", operator: "contains", value: "IIM" },
];

/**
 * Same Create Group builder fields as CreateGroupPage, shown in a modal
 * with Cancel / Save for campaign (and other) flows.
 */
export default function CreateGroupModal({ open, onClose, onSaved }) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("girls from Rohini who studied at IIM");
  const [matchMode, setMatchMode] = useState("ALL");
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS.map((c) => ({ ...c, id: makeCondition().id })));

  useEffect(() => {
    if (!open) return;
    setGroupName("");
    setDescription("girls from Rohini who studied at IIM");
    setMatchMode("ALL");
    setConditions([
      { ...makeCondition(), field: "Gender", operator: "is", value: "Female" },
      { ...makeCondition(), field: "Area", operator: "is", value: "Rohini" },
      { ...makeCondition(), field: "Education / College", operator: "contains", value: "IIM" },
    ]);
  }, [open]);

  const updateCondition = (id, next) => {
    setConditions((prev) => prev.map((c) => (c.id === id ? next : c)));
  };

  const removeCondition = (id) => {
    setConditions((prev) => (prev.length === 1 ? prev : prev.filter((c) => c.id !== id)));
  };

  const addCondition = () => {
    setConditions((prev) => [...prev, makeCondition()]);
  };

  const clearAll = () => {
    setConditions([makeCondition()]);
    setDescription("");
  };

  const resolveConditions = () => {
    if (description.trim()) {
      const parsed = parseDescription(description);
      if (parsed.length > 0) {
        setConditions(parsed);
        return parsed;
      }
    }
    return conditions;
  };

  const runBuildQuery = () => {
    const active = resolveConditions();
    const matched = CLIENTS.filter((c) => matchesAll(c, active, matchMode));
    toast.success(`${matched.length} matching client${matched.length === 1 ? "" : "s"} found.`);
  };

  const runManualQuery = () => {
    const matched = CLIENTS.filter((c) => matchesAll(c, conditions, matchMode));
    toast.success(`${matched.length} matching client${matched.length === 1 ? "" : "s"} found.`);
  };

  const handleSave = () => {
    const name = groupName.trim() || description.trim() || "New Group";
    const activeConditions = resolveConditions();
    const matched = CLIENTS.filter((c) => matchesAll(c, activeConditions, matchMode));
    const created = addSavedGroup({
      name,
      conditions: activeConditions,
      matchMode,
      clientIds: matched.map((c) => c.id),
    });
    toast.success(`"${created.name}" saved with ${matched.length} client${matched.length === 1 ? "" : "s"}.`);
    onSaved?.(created);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Group"
      subtitle="Describe who you're looking for, or build conditions manually."
      width="max-w-4xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Save
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">
            Group Name <span className="text-[#E8395B]">*</span>
          </label>
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g. Female IIM Alumni"
            className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[14px] text-[#6B7280]">Describe who you're looking for</p>
          <div className="flex items-center gap-3 w-full min-w-0 flex-wrap sm:flex-nowrap">
            <div className="flex-1 min-w-0 flex items-center gap-2.5 h-11 border border-black/12 rounded-xl px-4 bg-white">
              <Sparkles size={16} className="text-[#F59E0B] shrink-0" />
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runBuildQuery()}
                placeholder="e.g. girls from Rohini who studied at IIM"
                className="flex-1 min-w-0 bg-transparent text-[14px] text-[#111] placeholder:text-[#9CA3AF] outline-none"
              />
            </div>
            <button
              type="button"
              onClick={runBuildQuery}
              className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors shrink-0"
            >
              Build query
            </button>
          </div>
        </div>

        <p className="text-center text-[13px] font-bold text-[#111] tracking-wide">OR</p>

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[14px] font-semibold text-[#111]">Match</span>
              <div className="flex items-center rounded-lg overflow-hidden">
                {["ALL", "ANY"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMatchMode(m)}
                    className={`h-8 px-3.5 text-[12px] font-extrabold tracking-wide transition-colors ${
                      matchMode === m ? "bg-[#7A0A17] text-white" : "bg-[#F3F4F6] text-[#9CA3AF] hover:text-[#6B7280]"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <span className="text-[14px] text-[#9CA3AF]">of these conditions</span>
              <button
                type="button"
                onClick={runManualQuery}
                className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors shrink-0"
              >
                Run manual query
              </button>
            </div>
            <button type="button" onClick={clearAll} className="text-[13px] font-bold text-[#7A0A17] hover:underline">
              Clear all
            </button>
          </div>

          <div className="flex flex-col gap-3 items-start overflow-x-auto">
            {conditions.map((c, i) => (
              <ConditionRow
                key={c.id}
                index={i}
                condition={c}
                onChange={(next) => updateCondition(c.id, next)}
                onRemove={() => removeCondition(c.id)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={addCondition}
            className="self-start inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white border border-[#7A0A17]/35 text-[13px] font-bold text-[#7A0A17] hover:bg-[#FCF5F6] transition-colors"
          >
            <Plus size={15} /> Add condition
          </button>
        </div>
      </div>
    </Modal>
  );
}
