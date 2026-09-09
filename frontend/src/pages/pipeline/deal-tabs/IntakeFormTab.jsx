import { useState } from "react";
import { toast } from "react-toastify";
import {
  SECTION_DEMO_VALUES,
  DEMO_PERSONAL_VALUES,
  snapshotPersonalValues,
  diffPersonalValues,
  SECTION_BLOCKS,
  SECTIONS_META,
  diffSectionValues,
} from "./intake/intakeFormData";
import IntakeFillFormView from "./intake/IntakeFillFormView";
import ClientRecordView from "./intake/ClientRecordView";
import PersonalChangeOtpModal from "./intake/PersonalChangeOtpModal";
import SectionEditModal from "./intake/SectionEditModal";

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

function formatChangeAt(date = new Date()) {
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Dummy history so Change summary shows sample OTP-verified edits. */
const DEMO_CHANGE_LOG = [
  {
    id: "demo-mobile-1",
    fieldKey: "mobile",
    label: "Mobile",
    from: "98••• ••771",
    to: "98••• ••164",
    at: "07 Sep 2026, 11:24 am",
    by: "Neha Sharma",
    via: "OTP verified",
  },
  {
    id: "demo-email-1",
    fieldKey: "email",
    label: "E-mail",
    from: "priya.r@outlook.com",
    to: "priya.raheja@gmail.com",
    at: "05 Sep 2026, 04:12 pm",
    by: "Neha Sharma",
    via: "OTP verified",
  },
  {
    id: "demo-height-1",
    fieldKey: "height",
    label: "Height",
    from: "5 ft 3 in / 160 cms",
    to: "5 ft 4 in / 163 cms",
    at: "02 Sep 2026, 10:05 am",
    by: "Rohit Khanna",
    via: "OTP verified",
  },
  {
    id: "demo-marital-1",
    fieldKey: "maritalStatus",
    label: "Marital status",
    from: "Draft — pending confirm",
    to: "Never married",
    at: "28 Aug 2026, 03:40 pm",
    by: "Neha Sharma",
    via: "OTP verified",
  },
];

/**
 * Intake Form tab — toggles between Fill the form and Client record views.
 * Client-record section edits require Send OTP → verify before data updates.
 */
export default function IntakeFormTab({ empty = false }) {
  const [view, setView] = useState("fill");
  const [activeKey, setActiveKey] = useState("personal");
  const [values, setValues] = useState(empty ? {} : SECTION_DEMO_VALUES);
  const [chips, setChips] = useState({ aadhaarFiles: empty ? [] : DEMO_PERSONAL_VALUES.aadhaarFiles });
  const [personalBaseline, setPersonalBaseline] = useState(() =>
    snapshotPersonalValues(empty ? {} : SECTION_DEMO_VALUES)
  );
  const [personalUnlocked, setPersonalUnlocked] = useState(true);
  const [changeLog, setChangeLog] = useState(() => (empty ? [] : DEMO_CHANGE_LOG));
  const [otpState, setOtpState] = useState({
    open: false,
    mode: "unlock",
    changes: [],
    sectionLabel: "",
  });
  const [editSectionKey, setEditSectionKey] = useState(null);
  const [pendingSectionDraft, setPendingSectionDraft] = useState(null);

  const setField = (key, value) => setValues((prev) => ({ ...prev, [key]: value }));
  const removeChip = (chipsKey, chip) =>
    setChips((prev) => ({ ...prev, [chipsKey]: (prev[chipsKey] || []).filter((c) => c !== chip) }));

  const applySectionDraft = (draftValues, draftChips) => {
    setValues((prev) => ({ ...prev, ...draftValues }));
    setChips((prev) => ({ ...prev, ...draftChips }));
  };

  const closeOtp = () => setOtpState((prev) => ({ ...prev, open: false }));

  const closeEditSection = () => {
    setEditSectionKey(null);
    setPendingSectionDraft(null);
  };

  const requestPersonalUnlock = () => {
    setOtpState({ open: true, mode: "unlock", changes: [], sectionLabel: "" });
  };

  const requestPersonalSave = ({ onSuccess }) => {
    const current = snapshotPersonalValues(values);
    const changes = diffPersonalValues(personalBaseline, current);
    if (!changes.length) {
      setPersonalUnlocked(false);
      onSuccess?.();
      return;
    }
    setOtpState({
      open: true,
      mode: "commit",
      changes,
      sectionLabel: "Personal details",
      onSuccess,
    });
  };

  const handleEditSectionSave = ({ values: draftValues, chips: draftChips }) => {
    const label = SECTIONS_META.find((s) => s.key === editSectionKey)?.label || "Section";
    const blocks = SECTION_BLOCKS[editSectionKey] || [];
    const before = cloneBeforeValues(blocks, values);
    const changes = diffSectionValues(blocks, before, draftValues);

    if (!changes.length) {
      toast.info("No changes to save in this section.");
      return;
    }

    setPendingSectionDraft({ values: draftValues, chips: draftChips, changes });
    setOtpState({
      open: true,
      mode: "commit",
      changes,
      sectionLabel: label,
      onSuccess: () => {
        closeEditSection();
      },
    });
  };

  const handleOtpVerified = () => {
    if (otpState.mode === "unlock") {
      setPersonalUnlocked(true);
      closeOtp();
      toast.success("Personal details unlocked for editing.");
      return;
    }

    const pendingChanges = pendingSectionDraft?.changes || otpState.changes || [];
    const nextValues = pendingSectionDraft
      ? { ...values, ...pendingSectionDraft.values }
      : values;

    if (pendingSectionDraft) {
      applySectionDraft(pendingSectionDraft.values, pendingSectionDraft.chips);
      setPendingSectionDraft(null);
    }

    const current = snapshotPersonalValues(nextValues);
    const at = formatChangeAt();
    const logEntries = (pendingChanges.length
      ? pendingChanges
      : diffPersonalValues(personalBaseline, current)
    ).map((c) => ({
      id: `${c.key}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fieldKey: c.key,
      label: c.label,
      from: c.from,
      to: c.to,
      at,
      by: "Neha Sharma",
      via: "OTP verified",
    }));

    if (logEntries.length) {
      setChangeLog((prev) => [...logEntries, ...prev]);
    }
    setPersonalBaseline(current);
    setPersonalUnlocked(false);
    closeOtp();
    toast.success(
      logEntries.length === 1
        ? "Change saved after OTP. Client data updated."
        : `${logEntries.length} changes saved after OTP. Client data updated.`
    );
    otpState.onSuccess?.();
  };

  const handleSetActiveKey = (key) => {
    if (activeKey === "personal" && key !== "personal" && personalUnlocked) {
      const current = snapshotPersonalValues(values);
      const changes = diffPersonalValues(personalBaseline, current);
      if (changes.length) {
        requestPersonalSave({
          onSuccess: () => {
            setActiveKey(key);
          },
        });
        return;
      }
      setPersonalUnlocked(false);
    }
    setActiveKey(key);
  };

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
          changeLog={changeLog}
          onEditSection={(key) => setEditSectionKey(key)}
        />
      ) : (
        <IntakeFillFormView
          empty={empty}
          activeKey={activeKey}
          setActiveKey={handleSetActiveKey}
          values={values}
          setField={setField}
          chips={chips}
          removeChip={removeChip}
          personalUnlocked={personalUnlocked}
          onRequestPersonalUnlock={requestPersonalUnlock}
          onRequestPersonalSave={requestPersonalSave}
          onFinishToRecord={() => setView("record")}
        />
      )}

      <SectionEditModal
        open={Boolean(editSectionKey)}
        sectionKey={editSectionKey}
        values={values}
        chips={chips}
        onClose={closeEditSection}
        onSave={handleEditSectionSave}
      />

      <PersonalChangeOtpModal
        open={otpState.open}
        mode={otpState.mode}
        changes={otpState.changes}
        sectionLabel={otpState.sectionLabel}
        onClose={() => {
          closeOtp();
          setPendingSectionDraft(null);
        }}
        onVerified={handleOtpVerified}
      />
    </div>
  );
}

function cloneBeforeValues(blocks, values) {
  const before = {};
  for (const block of blocks || []) {
    for (const field of block.fields) {
      const raw = values[field.key];
      if (raw == null) {
        before[field.key] = field.type === "checklist" || field.type === "rows" ? [] : "";
      } else {
        before[field.key] = JSON.parse(JSON.stringify(raw));
      }
    }
  }
  return before;
}
