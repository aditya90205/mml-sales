import { useState } from "react";
import {
  SECTION_DEMO_VALUES,
  DEMO_PERSONAL_VALUES,
} from "./intake/intakeFormData";
import IntakeFillFormView from "./intake/IntakeFillFormView";
import ClientRecordView from "./intake/ClientRecordView";

function IntakeViewToggle({ view, onChange }) {
  const options = [
    { id: "fill", label: "Fill the form" },
    { id: "record", label: "Client record" },
  ];

  return (
    <div className="inline-flex items-center p-1 rounded-xl bg-[#F3E8F0] shrink-0">
      {options.map((opt) => {
        const active = view === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`h-9 px-4 rounded-lg text-[13px] font-semibold transition-colors ${
              active
                ? "bg-white text-[#7A0A17] shadow-sm"
                : "text-[#6B7280] hover:text-[#374151]"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Intake Form tab — toggles between Fill the form and Client record views.
 */
export default function IntakeFormTab({ empty = false }) {
  const [view, setView] = useState("fill");
  const [activeKey, setActiveKey] = useState("personal");
  const [values, setValues] = useState(empty ? {} : SECTION_DEMO_VALUES);
  const [chips, setChips] = useState({ aadhaarFiles: empty ? [] : DEMO_PERSONAL_VALUES.aadhaarFiles });

  const setField = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));
  const removeChip = (chipsKey, chip) =>
    setChips((prev) => ({ ...prev, [chipsKey]: (prev[chipsKey] || []).filter((c) => c !== chip) }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end">
        <IntakeViewToggle view={view} onChange={setView} />
      </div>

      {view === "record" ? (
        <ClientRecordView
          values={values}
          chips={chips}
          empty={empty}
          onOpenSection={(key) => {
            setActiveKey(key);
            setView("fill");
          }}
        />
      ) : (
        <IntakeFillFormView
          empty={empty}
          activeKey={activeKey}
          setActiveKey={setActiveKey}
          values={values}
          setField={setField}
          chips={chips}
          removeChip={removeChip}
        />
      )}
    </div>
  );
}
