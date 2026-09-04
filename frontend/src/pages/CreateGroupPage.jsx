import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, MessageSquare, Phone, Plus, Sparkles, X } from "lucide-react";
import { toast } from "react-toastify";
import ClientStatusBadge from "../components/common/ClientStatusBadge.jsx";
import Modal from "../components/ui/Modal.jsx";
import { CLIENTS } from "../utils/clientsData.js";
import { addSavedGroup } from "../utils/clientGroups.js";
import {
  FIELD_OPTIONS,
  OPERATOR_OPTIONS,
  makeCondition,
  matchesAll,
  parseDescription,
  usesSelectValue,
  valueOptionsFor,
} from "../utils/clientQuery.js";

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
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-[13px] font-extrabold text-[#111]">{index === 0 ? "WHERE" : "AND"}</span>

      <FieldSelect
        value={condition.field}
        onChange={(field) => onChange({ ...condition, field, value: "" })}
        options={FIELD_OPTIONS}
        className="w-[220px]"
      />

      <FieldSelect
        value={condition.operator}
        onChange={(operator) => onChange({ ...condition, operator })}
        options={OPERATOR_OPTIONS}
        className="w-[160px]"
      />

      {showSelect ? (
        <FieldSelect
          value={condition.value}
          onChange={(value) => onChange({ ...condition, value })}
          options={valueOpts}
          placeholder="Select"
          className="w-[200px]"
        />
      ) : (
        <input
          value={condition.value}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
          placeholder="Value"
          className="h-11 w-[200px] shrink-0 border border-black/12 rounded-lg px-3.5 text-[14px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40"
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

export default function CreateGroupPage() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("girls from Rohini who studied at IIM");
  const [matchMode, setMatchMode] = useState("ALL");
  const [conditions, setConditions] = useState([
    { ...makeCondition(), field: "Gender", operator: "is", value: "Female" },
    { ...makeCondition(), field: "Area", operator: "is", value: "Rohini" },
    { ...makeCondition(), field: "Education / College", operator: "contains", value: "IIM" },
  ]);
  const [results, setResults] = useState(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [groupName, setGroupName] = useState("");

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
    setResults(null);
    setDescription("");
  };

  const runBuildQuery = () => {
    let activeConditions = conditions;

    if (description.trim()) {
      const parsed = parseDescription(description);
      if (parsed.length > 0) {
        activeConditions = parsed;
        setConditions(parsed);
      }
    }

    const matched = CLIENTS.filter((c) => matchesAll(c, activeConditions, matchMode));
    setResults(matched);
    toast.success(`${matched.length} matching client${matched.length === 1 ? "" : "s"} found.`);
  };

  const handleSaveGroup = () => {
    if (!groupName.trim()) {
      toast.error("Please name this group.");
      return;
    }
    addSavedGroup({
      name: groupName.trim(),
      conditions,
      matchMode,
    });
    toast.success(`"${groupName.trim()}" saved to your groups.`);
    setSaveOpen(false);
    navigate("/clients");
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pt-5 pb-8 flex flex-col gap-8 min-w-0 w-full">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-[26px] font-bold text-[#111] tracking-tight">Create Group</h1>
          <button
            type="button"
            onClick={() => toast.info("Exporting results...")}
            className="inline-flex items-center h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors shrink-0"
          >
            Export results
          </button>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <p className="text-[14px] text-[#6B7280]">Describe who you're looking for</p>
          <div className="flex items-center gap-3 w-full min-w-0">
            <div className="flex-1 min-w-0 flex items-center gap-2.5 h-12 border border-black/12 rounded-lg px-4 bg-white">
              <Sparkles size={16} className="text-[#F59E0B] shrink-0" />
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runBuildQuery()}
                placeholder="e.g. girls from Rohini who studied at IIM"
                className="flex-1 min-w-0 bg-transparent text-[15px] text-[#111] placeholder:text-[#9CA3AF] outline-none"
              />
            </div>
            <button
              type="button"
              onClick={runBuildQuery}
              className="h-12 px-6 rounded-lg bg-[#7A0A17] text-white text-[14px] font-bold hover:bg-[#640712] transition-colors shrink-0"
            >
              Build query
            </button>
          </div>
        </div>

        <p className="text-center text-[13px] font-bold text-[#111] tracking-wide">OR</p>

        <div className="flex flex-col gap-5 w-full">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
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
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="text-[13px] font-bold text-[#7A0A17] hover:underline"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-col gap-3 items-start">
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

        {results && (
          <div className="border-t border-black/8 pt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-[18px] font-bold text-[#111]">
                Matching Clients <span className="text-[#9CA3AF] font-medium">({results.length})</span>
              </h2>
              <button
                type="button"
                disabled={results.length === 0}
                onClick={() => setSaveOpen(true)}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Group
              </button>
            </div>

            <div className="overflow-x-auto border border-black/8 rounded-xl bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-black/8 bg-[#FAFAFB] text-[#9CA3AF] uppercase text-[10px] font-extrabold tracking-wide">
                    <th className="px-4 py-3 whitespace-nowrap">Client Name</th>
                    <th className="px-4 py-3 whitespace-nowrap">Gender</th>
                    <th className="px-4 py-3 whitespace-nowrap">Area</th>
                    <th className="px-4 py-3 whitespace-nowrap">Education</th>
                    <th className="px-4 py-3 whitespace-nowrap">Branch</th>
                    <th className="px-4 py-3 whitespace-nowrap text-center">Status</th>
                    <th className="px-4 py-3 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-[13px] text-[#9CA3AF] font-medium">
                        No clients match these conditions.
                      </td>
                    </tr>
                  ) : (
                    results.map((c) => (
                      <tr key={c.id} className="border-b border-black/8 last:border-0 hover:bg-[#FAFAFB] transition-colors">
                        <td className="px-4 py-3 text-[13px] font-bold text-[#111] whitespace-nowrap">{c.name}</td>
                        <td className="px-4 py-3 text-[13px] font-medium text-[#374151] whitespace-nowrap">{c.gender}</td>
                        <td className="px-4 py-3 text-[13px] font-medium text-[#374151] whitespace-nowrap">{c.area}</td>
                        <td className="px-4 py-3 text-[13px] font-medium text-[#374151] whitespace-nowrap">{c.education}</td>
                        <td className="px-4 py-3 text-[13px] font-medium text-[#374151] whitespace-nowrap">{c.branch}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-center">
                            <ClientStatusBadge status={c.status} married={c.married} />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-0.5">
                            <button type="button" onClick={() => toast.info(`Calling ${c.name}...`)} className="size-7 grid place-items-center rounded-lg hover:bg-black/4 transition-colors" aria-label={`Call ${c.name}`}>
                              <Phone size={14} className="text-[#16A34A]" />
                            </button>
                            <button type="button" onClick={() => toast.info(`Messaging ${c.name}...`)} className="size-7 grid place-items-center rounded-lg hover:bg-black/4 transition-colors" aria-label={`Message ${c.name}`}>
                              <MessageSquare size={14} className="text-[#D97706]" />
                            </button>
                            <button type="button" onClick={() => toast.info(`Emailing ${c.name}...`)} className="size-7 grid place-items-center rounded-lg hover:bg-black/4 transition-colors" aria-label={`Email ${c.name}`}>
                              <Mail size={14} className="text-[#2563EB]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={saveOpen}
        onClose={() => setSaveOpen(false)}
        title="Save Group"
        subtitle="Give this client group a name to find it later."
        footer={
          <>
            <button
              type="button"
              onClick={() => setSaveOpen(false)}
              className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveGroup}
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Save Group
            </button>
          </>
        }
      >
        <label className="block text-[13px] font-bold text-[#111] mb-1.5">Group Name</label>
        <input
          autoFocus
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSaveGroup()}
          placeholder="e.g. Female IIM Alumni"
          className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40"
        />
      </Modal>
    </div>
  );
}
