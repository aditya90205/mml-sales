import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  snapshotPersonalValues,
  diffPersonalValues,
  SECTION_BLOCKS,
  SECTIONS_META,
  SECTION_DEMO_VALUES,
  diffSectionValues,
  isFilled,
} from "./intake/intakeFormData";
import IntakeFillFormView from "./intake/IntakeFillFormView";
import ClientRecordView from "./intake/ClientRecordView";
import PersonalChangeOtpModal from "./intake/PersonalChangeOtpModal";
import SectionEditModal from "./intake/SectionEditModal";
import { mapBiodataToIntake, mapLeadToIntake, mergeFilledValues, leadPatchFromIntake } from "../../../utils/biodataDraftStore.js";
import { extractBiodata } from "../../../utils/biodataExtract.js";
import { recordLeadActivity } from "../../../utils/leadActivityStore.js";
import { updateLead } from "../../../utils/pipelineStore.js";
import { CONTACT_REQUIRED_MESSAGE, hasValidMobileOrEmail, pairGenderAndLookingFor } from "../../../utils/leadFields.js";

const DUMMY_P2_IDS = new Set(["p2-1", "p2-2"]);

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

function seedIntakeValues(lead) {
  const fromLead = mapLeadToIntake(lead);
  const stored = lead?.intakeValues || {};
  const dummyDemo = DUMMY_P2_IDS.has(lead?.id)
    ? {
        ...SECTION_DEMO_VALUES,
        gender: lead.id === "p2-1" ? "Male" : SECTION_DEMO_VALUES.gender,
        lookingFor: lead.id === "p2-1" ? "Bride" : SECTION_DEMO_VALUES.lookingFor,
        firstName: fromLead.firstName || SECTION_DEMO_VALUES.firstName,
        lastName: fromLead.lastName || SECTION_DEMO_VALUES.lastName,
        mobile: fromLead.mobile || SECTION_DEMO_VALUES.mobile,
        email: fromLead.email || SECTION_DEMO_VALUES.email,
      }
    : {};
  return mergeFilledValues({ ...dummyDemo, ...stored }, fromLead);
}

function leadPrefillKey(lead) {
  const mapped = mapLeadToIntake(lead || {});
  return [
    lead?.id,
    mapped.firstName,
    mapped.lastName,
    mapped.dob,
    mapped.lookingFor,
    mapped.gender,
    mapped.enquiryBy,
    mapped.mobile,
    mapped.email,
    mapped.extraInfo,
    mapped.clientType,
    mapped.occupation,
    mapped.addrCity,
    mapped.nri,
    mapped.city,
    mapped.profession,
    mapped.familyIncomeBand,
    mapped.leadSource,
    mapped.meeting,
  ].join("|");
}

function seedHasValues(values = {}) {
  return Object.values(values).some((value) => isFilled(value) || (Array.isArray(value) && value.some((row) => isFilled(row) || (row && typeof row === "object" && Object.values(row).some(isFilled)))));
}

/**
 * Intake Form tab — toggles between Fill the form and Client record views.
 * Client-record section edits require Send OTP → verify before data updates.
 */
export default function IntakeFormTab({ empty = false, lead = null }) {
  const [view, setView] = useState("fill");
  const [activeKey, setActiveKey] = useState("personal");
  const [values, setValues] = useState(() => seedIntakeValues(lead));
  const [chips, setChips] = useState({ aadhaarFiles: [] });
  const [personalBaseline, setPersonalBaseline] = useState(() =>
    snapshotPersonalValues(seedIntakeValues(lead))
  );
  const [personalUnlocked, setPersonalUnlocked] = useState(true);
  const [changeLog, setChangeLog] = useState([]);
  const [otpState, setOtpState] = useState({
    open: false,
    mode: "unlock",
    changes: [],
    sectionLabel: "",
  });
  const [editSectionKey, setEditSectionKey] = useState(null);
  const [pendingSectionDraft, setPendingSectionDraft] = useState(null);

  const persistIntake = (nextValues) => {
    if (!lead?.id) return;
    updateLead(lead.id, {
      intakeValues: nextValues,
      ...leadPatchFromIntake(nextValues),
    });
  };

  const prefillKey = leadPrefillKey(lead);

  useEffect(() => {
    const next = seedIntakeValues(lead);
    setValues(next);
    setPersonalBaseline(snapshotPersonalValues(next));
    setChips({ aadhaarFiles: [] });
    setChangeLog([]);
    setView("fill");
    setActiveKey("personal");
    if (
      lead?.id &&
      !DUMMY_P2_IDS.has(lead.id) &&
      seedHasValues(next) &&
      (!lead.intakeValues || !Object.keys(lead.intakeValues).length)
    ) {
      updateLead(lead.id, { intakeValues: next });
    }
  }, [lead?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const fromLead = mapLeadToIntake(lead);
    setValues((prev) => mergeFilledValues(prev, fromLead));
  }, [prefillKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const formEmpty = empty && !seedHasValues(values);

  const setField = (key, value) =>
    setValues((prev) => {
      const next = pairGenderAndLookingFor(prev, key, value);
      if (key === "nri") {
        return { ...next, nri: value, country: value === "No" ? "India" : next.country };
      }
      return next;
    });
  const removeChip = (chipsKey, chip) =>
    setChips((prev) => ({ ...prev, [chipsKey]: (prev[chipsKey] || []).filter((c) => c !== chip) }));

  const handleBiodataFile = async (file) => {
    if (!file) return;
    const data = await extractBiodata(file);
    const mapped = mapBiodataToIntake(data);
    const next = { ...values, ...mapped };
    if (!hasValidMobileOrEmail(next)) {
      toast.error(CONTACT_REQUIRED_MESSAGE);
      return;
    }
    setValues(next);
    persistIntake(next);
    if (lead?.id) {
      updateLead(lead.id, { biodataFile: file.name });
    }
    toast.success(`Biodata applied to Profile Create: ${file.name}`);
  };

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
    if (!hasValidMobileOrEmail(values)) {
      toast.error(CONTACT_REQUIRED_MESSAGE);
      return;
    }
    const current = snapshotPersonalValues(values);
    const changes = diffPersonalValues(personalBaseline, current);
    if (!changes.length) {
      setPersonalUnlocked(false);
      persistIntake(values);
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
    if (editSectionKey === "personal") {
      const merged = { ...values, ...draftValues };
      if (!hasValidMobileOrEmail(merged)) {
        toast.error(CONTACT_REQUIRED_MESSAGE);
        return;
      }
    }
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
    persistIntake(nextValues);
    closeOtp();
    toast.success(
      logEntries.length === 1
        ? "Change saved after OTP. Client data updated."
        : `${logEntries.length} changes saved after OTP. Client data updated.`
    );
    if (logEntries.length) {
      recordLeadActivity(lead, "P2", {
        type: "details",
        title:
          logEntries.length === 1
            ? `Intake updated: ${logEntries[0].label}`
            : `Intake updated (${logEntries.length} fields)`,
        stage: "P2",
      });
    }
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
      persistIntake(values);
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
          empty={formEmpty}
          changeLog={changeLog}
          onEditSection={(key) => setEditSectionKey(key)}
        />
      ) : (
        <IntakeFillFormView
          empty={formEmpty}
          activeKey={activeKey}
          setActiveKey={handleSetActiveKey}
          values={values}
          setField={setField}
          chips={chips}
          removeChip={removeChip}
          personalUnlocked={personalUnlocked}
          onRequestPersonalUnlock={requestPersonalUnlock}
          onRequestPersonalSave={requestPersonalSave}
          onFinishToRecord={() => {
            persistIntake(values);
            setView("record");
          }}
          onBiodataFile={handleBiodataFile}
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
