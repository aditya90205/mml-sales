import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";

/**
 * Client Intake Form — a multi-section booklet. The right rail lists all
 * booklet sections with a fill percentage each; the left renders whichever
 * section is selected. Only "Personal details" (section 1) has real fields
 * for now — the rest are placeholders until their fields are defined.
 */
const SECTIONS_META = [
  { key: "personal", label: "Personal details" },
  { key: "education", label: "Education & career" },
  { key: "residency", label: "Residency & previous marriage" },
  { key: "family", label: "Family — father & mother" },
  { key: "siblings", label: "Siblings & family standing" },
  { key: "match", label: "Match desired" },
  { key: "essential", label: "Essential questions for relationship success" },
  { key: "medical", label: "Medical history disclosure" },
  { key: "declaration", label: "Declaration & check list" },
  { key: "communication", label: "Communication, consent & privacy" },
  { key: "casesheet", label: "Case sheet — for official use" },
];

// Static fill % for sections that aren't built out yet.
const PLACEHOLDER_PROGRESS = {
  education: 39,
  residency: 6,
  family: 47,
  siblings: 92,
  match: 55,
  essential: 74,
  medical: 62,
  declaration: 93,
  communication: 0,
  casesheet: 90,
};

const OVERALL_TOTAL_FIELDS = 270;
const OVERALL_FILLED_FIELDS = 145;

const PERSONAL_DETAILS_BLOCKS = [
  {
    title: "Who is this",
    fields: [
      { key: "gender", label: "Gender", required: true, type: "pill", options: ["Male", "Female"] },
      { key: "firstName", label: "First name", required: true, type: "text" },
      { key: "middleName", label: "Middle name", type: "text" },
      { key: "lastName", label: "Last name", required: true, type: "text" },
      { key: "clientType", label: "Client type", required: true, type: "pill", options: ["Classic", "Premium", "Exclusive"] },
      { key: "profileStatus", label: "Profile status", type: "pill", options: ["Draft", "Under review", "Complete"] },
      { key: "maritalStatus", label: "Marital status", required: true, type: "pill", options: ["Never married", "Divorced", "Widow / Widower", "Annulled"] },
      { key: "lookingFor", label: "Looking for", required: true, type: "pill", options: ["Groom", "Bride"] },
      { key: "enquiryBy", label: "Enquiry made by", type: "pill", options: ["Self", "Parent", "Sibling", "Relative"] },
    ],
  },
  {
    title: "Identity & contact",
    fields: [
      { key: "panNo", label: "PAN No", type: "upload", note: "Card image optional — front and back" },
      { key: "aadhaarNo", label: "Aadhaar No", type: "upload", chipsKey: "aadhaarFiles" },
      { key: "mobile", label: "Mobile", required: true, type: "text" },
      { key: "alternateContact", label: "Alternate contact", type: "text" },
      { key: "email", label: "E-mail", required: true, type: "text" },
    ],
  },
  {
    title: "Birth & astrology",
    fields: [
      { key: "dob", label: "Date of birth", required: true, type: "text" },
      { key: "timeOfBirth", label: "Time of birth", type: "text" },
      { key: "placeOfBirth", label: "Place of birth", required: true, type: "text" },
      { key: "nativePlace", label: "Native place", type: "text" },
      { key: "zodiacSign", label: "Zodiac sign", type: "text" },
      { key: "gotra", label: "Gotra", type: "text" },
      { key: "manglik", label: "Astrologically you are", type: "pill", options: ["Non Manglik", "Manglik", "Slightly Manglik", "Don't know"] },
      { key: "nakshatra", label: "Nakshatra", type: "text" },
      { key: "gan", label: "Gan", type: "pill", options: ["Dev", "Manushya", "Rakshas"] },
      { key: "nadi", label: "Nadi", type: "pill", options: ["Aadi", "Madhya", "Antya"] },
      { key: "kundliPoints", label: "Kundli gun points (of 36)", type: "text" },
      { key: "kundliShown", label: "Kundli shown to client", type: "pill", options: ["On request only", "Shared"] },
    ],
  },
  {
    title: "Community",
    fields: [
      { key: "religion", label: "Religion", required: true, type: "pill", options: ["Hindu", "Sikh", "Jain", "Muslim", "Christian", "Other"] },
      { key: "sectCaste", label: "Sect / caste", required: true, type: "text" },
      { key: "subCaste", label: "Sub-caste", type: "text" },
      { key: "motherTongue", label: "Mother tongue", type: "text" },
    ],
  },
  {
    title: "Body & health",
    fields: [
      { key: "height", label: "Height", required: true, type: "text" },
      { key: "weight", label: "Weight (kg)", type: "text" },
      { key: "bodyType", label: "Body type", type: "pill", options: ["Slim", "Average", "Athletic", "Broad build", "Heavy", "Very heavy"] },
      { key: "bloodGroup", label: "Blood group", type: "pill", options: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"] },
      { key: "complexion", label: "Complexion", type: "pill", options: ["Very fair", "Fair", "Wheatish", "Wheatish to dark", "Dark"] },
      { key: "spectacles", label: "Spectacles / contact lenses", type: "pill", options: ["Yes", "No"] },
      { key: "leftEyePower", label: "Left eye power", type: "text" },
      { key: "rightEyePower", label: "Right eye power", type: "text" },
      { key: "disability", label: "Any disability or health issue", type: "pill", options: ["Yes", "No"] },
      { key: "disabilitySpecify", label: "If yes, specify", type: "text" },
      { key: "conditionSince", label: "Condition since (year)", type: "text" },
      { key: "underTreatment", label: "Under treatment", type: "pill", options: ["Yes", "No"] },
    ],
  },
  {
    title: "Habits",
    fields: [
      { key: "drinking", label: "Drinking", type: "pill", options: ["Teetotaller", "Occasionally", "Regularly", "Socially"] },
      { key: "smoking", label: "Smoking", type: "pill", options: ["Non smoker", "Occasionally", "Regular", "Socially", "Hukka"] },
      { key: "eating", label: "Eating", type: "pill", options: ["Vegetarian", "Eggetarian", "Non vegetarian", "Occasionally non-veg", "Socially", "Vegan"] },
      { key: "drinkingNote", label: "Drinking — note", type: "text" },
      { key: "smokingNote", label: "Smoking — note", type: "text" },
      { key: "eatingNote", label: "Eating — note", type: "text" },
    ],
  },
  {
    title: "In the client's words",
    columns: 1,
    fields: [
      { key: "characteristics", label: "Characteristics", type: "textarea" },
      { key: "extraInfo", label: "Extra info (personal)", type: "textarea" },
    ],
  },
];

const DEMO_PERSONAL_VALUES = {
  gender: "Female",
  firstName: "Priya",
  lastName: "Raheja",
  clientType: "Exclusive",
  profileStatus: "Under review",
  maritalStatus: "Never married",
  lookingFor: "Groom",
  enquiryBy: "Parent",
  panNo: "AHXPR••••K",
  aadhaarNo: "•••• •••• 4417",
  aadhaarFiles: ["aadhaar-front.jpg", "aadhaar-back.jpg"],
  mobile: "98••• ••164",
  email: "priya.raheja@gmail.com",
  dob: "14 Jul 1995",
  timeOfBirth: "04:20",
  placeOfBirth: "Delhi",
  nativePlace: "Hisar, Haryana",
  zodiacSign: "Cancer",
  gotra: "Garg",
  manglik: "Non Manglik",
  religion: "Hindu",
  sectCaste: "Agarwal",
  motherTongue: "Hindi",
  height: "5 ft 4 in / 163 cms",
  weight: "56",
  bloodGroup: "B+",
  complexion: "Fair",
  spectacles: "Yes",
  leftEyePower: "-1.25",
  rightEyePower: "-1.00",
  disability: "No",
  drinking: "Teetotaller",
  smoking: "Non smoker",
  eating: "Vegetarian",
};

const INPUT =
  "w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17] bg-white";

function isFilled(value) {
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value && String(value).trim());
}

function FieldLabel({ label, required }) {
  return (
    <label className="block text-[13px] text-[#374151] mb-1.5">
      {label}
      {required && <span className="text-[#E8395B]"> *</span>}
    </label>
  );
}

function Pill({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 px-3.5 rounded-xl text-[12.5px] font-semibold transition-colors whitespace-nowrap ${
        selected ? "bg-[#7A0A17] text-white" : "bg-white border border-black/12 text-[#374151] hover:bg-[#FAFAFB]"
      }`}
    >
      {children}
    </button>
  );
}

function IntakeField({ def, value, chips, onChange, onRemoveChip }) {
  if (def.type === "pill") {
    return (
      <div>
        <FieldLabel label={def.label} required={def.required} />
        <div className="flex flex-wrap gap-2">
          {def.options.map((opt) => (
            <Pill key={opt} selected={value === opt} onClick={() => onChange(opt === value ? "" : opt)}>
              {opt}
            </Pill>
          ))}
        </div>
      </div>
    );
  }

  if (def.type === "textarea") {
    return (
      <div>
        <FieldLabel label={def.label} required={def.required} />
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write here"
          rows={4}
          className={`${INPUT} h-auto py-2.5 resize-none`}
        />
      </div>
    );
  }

  if (def.type === "upload") {
    return (
      <div>
        <FieldLabel label={def.label} required={def.required} />
        <div className="flex items-center gap-2">
          <input value={value || ""} onChange={(e) => onChange(e.target.value)} className={INPUT} />
          <button
            type="button"
            onClick={() => toast.info("Upload coming soon.")}
            className="h-11 px-4 rounded-xl border border-black/12 text-[12.5px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors shrink-0 whitespace-nowrap"
          >
            Upload
          </button>
        </div>
        {def.note && <p className="text-[11px] text-[#9CA3AF] mt-1.5">{def.note}</p>}
        {def.chipsKey && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(chips || []).map((chip) => (
              <span
                key={chip}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4B5563] bg-[#F3F4F6] rounded-md px-2 py-1"
              >
                {chip}
                <button type="button" onClick={() => onRemoveChip(chip)} className="hover:text-[#111]">
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <FieldLabel label={def.label} required={def.required} />
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} className={INPUT} />
    </div>
  );
}

function FormBlock({ block, values, chipValues, onFieldChange, onRemoveChip }) {
  const filled = block.fields.filter((f) => isFilled(values[f.key])).length;
  const total = block.fields.length;
  const colClass = block.columns === 1 ? "" : block.columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3";

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-[11px] font-bold text-[#7A0A17] uppercase tracking-wide">{block.title}</h3>
        <span className="text-[11px] text-[#9CA3AF] shrink-0">
          {filled} of {total} filled
        </span>
      </div>
      <div className={`grid grid-cols-1 ${colClass} gap-x-6 gap-y-4`}>
        {block.fields.map((f) => (
          <IntakeField
            key={f.key}
            def={f}
            value={values[f.key]}
            chips={f.chipsKey ? chipValues[f.chipsKey] : undefined}
            onChange={(v) => onFieldChange(f.key, v)}
            onRemoveChip={f.chipsKey ? (chip) => onRemoveChip(f.chipsKey, chip) : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function FormFilledCard({ percent, filled, total }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">Form filled</p>
      <p className="text-[32px] font-extrabold text-[#7A0A17] mt-1 leading-none">{percent}%</p>
      <p className="text-[11.5px] text-[#9CA3AF] mt-1.5">
        {filled} of {total} fields
      </p>
      <div className="h-1.5 rounded-full bg-[#F1F2F4] overflow-hidden mt-3">
        <div className="h-full rounded-full bg-[#7A0A17]" style={{ width: `${percent}%` }} />
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

export default function IntakeFormTab({ empty = false }) {
  const [activeKey, setActiveKey] = useState("personal");
  const [values, setValues] = useState(empty ? {} : DEMO_PERSONAL_VALUES);
  const [chips, setChips] = useState({ aadhaarFiles: empty ? [] : DEMO_PERSONAL_VALUES.aadhaarFiles });

  const setField = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));
  const removeChip = (chipsKey, chip) =>
    setChips((prev) => ({ ...prev, [chipsKey]: (prev[chipsKey] || []).filter((c) => c !== chip) }));

  const activeIndex = SECTIONS_META.findIndex((s) => s.key === activeKey);

  const personalTotal = PERSONAL_DETAILS_BLOCKS.reduce((sum, b) => sum + b.fields.length, 0);
  const personalFilled = PERSONAL_DETAILS_BLOCKS.reduce(
    (sum, b) => sum + b.fields.filter((f) => (f.chipsKey ? chips[f.chipsKey]?.length : isFilled(values[f.key]))).length,
    0
  );
  const personalPercent = personalTotal ? Math.round((personalFilled / personalTotal) * 100) : 0;

  const sections = SECTIONS_META.map((s) =>
    s.key === "personal"
      ? { ...s, percent: personalPercent }
      : { ...s, percent: empty ? 0 : PLACEHOLDER_PROGRESS[s.key] ?? 0 }
  );

  const overallPercent = empty ? 0 : Math.round((OVERALL_FILLED_FIELDS / OVERALL_TOTAL_FIELDS) * 100);

  const handleNext = () => {
    const next = SECTIONS_META[activeIndex + 1];
    if (next) {
      toast.success(`Saved. Continuing to ${next.label}.`);
      setActiveKey(next.key);
    } else {
      toast.success("Intake form saved.");
    }
  };
  const handlePrev = () => {
    const prev = SECTIONS_META[activeIndex - 1];
    if (prev) setActiveKey(prev.key);
  };

  const nextLabel =
    activeIndex < SECTIONS_META.length - 1
      ? `Save and continue to ${SECTIONS_META[activeIndex + 1].label}`
      : "Save intake form";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 items-start">
      <div className="flex flex-col gap-5 min-w-0">
        {activeKey === "personal" ? (
          PERSONAL_DETAILS_BLOCKS.map((block) => (
            <FormBlock
              key={block.title}
              block={block}
              values={values}
              chipValues={chips}
              onFieldChange={setField}
              onRemoveChip={removeChip}
            />
          ))
        ) : (
          <div className="bg-white border border-black/8 rounded-2xl p-8 text-center">
            <p className="text-[14px] font-bold text-[#111]">{SECTIONS_META[activeIndex].label}</p>
            <p className="text-[12.5px] text-[#9CA3AF] mt-1.5">This section's fields haven't been added yet.</p>
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
      </div>
    </div>
  );
}
