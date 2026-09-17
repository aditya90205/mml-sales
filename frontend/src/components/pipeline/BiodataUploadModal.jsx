import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  CloudUpload,
  FileText,
  Loader2,
  Pencil,
  UserPlus,
  XCircle,
} from "lucide-react";
import Modal from "../ui/Modal.jsx";
import {
  findDuplicatesByMobileOrEmail,
  formatDisplayMobile,
  mockExtractBiodata,
} from "../../utils/contactSearch.js";
import {
  CREATE_LEAD_COMPARE_FIELDS,
  classifyLeadFields,
  contactToLeadFields,
  displayFieldValue,
  FIELD_DUMMY_HINTS,
  FIELD_STATUS_META,
  firstValidationMessage,
  formToLeadFields,
  missingRequiredLabels,
  validateCreateLeadFields,
} from "../../utils/leadFields.js";

const ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.tif,.tiff";

const RESOLUTIONS = [
  { id: "same", title: "Same person — update the CRM record" },
  { id: "relative", title: "A relative — file as a new lead, linked to the CRM contact" },
  { id: "wrong", title: "Wrong number on the biodata — flag for review" },
];

const INPUT =
  "w-full h-10 px-3.5 rounded-xl bg-white border border-black/12 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/45 transition-colors";

const ROW_TONE = {
  match: "bg-[#F0FDF4]",
  mismatch: "bg-[#FFFBEB]",
  new: "bg-[#EFF6FF]",
  missing: "bg-[#FEF2F2]",
  keep: "bg-[#F9FAFB]",
  empty: "bg-white",
};

function MatchIcon({ ok, size = 16 }) {
  if (ok === true) {
    return <CheckCircle2 size={size} className="text-[#16A34A] shrink-0" strokeWidth={2.2} />;
  }
  if (ok === false) {
    return <XCircle size={size} className="text-[#E8395B] shrink-0" strokeWidth={2.2} />;
  }
  return <span className="inline-block rounded-full bg-black/10 shrink-0" style={{ width: size, height: size }} />;
}

function importedFromExtract(data) {
  const values = {};
  for (const f of data?.fields || []) values[f.key] = f.value ?? "";
  return values;
}

function defaultPicks(statuses) {
  const picks = {};
  for (const [key, status] of Object.entries(statuses || {})) {
    if (status === "mismatch") picks[key] = "import";
  }
  return picks;
}

function seedFieldValues(imported, existing, statuses, picks) {
  const values = {};
  for (const field of CREATE_LEAD_COMPARE_FIELDS) {
    const key = field.key;
    const status = statuses[key];
    if (status === "mismatch") {
      values[key] = (picks[key] === "already" ? existing[key] : imported[key]) || "";
    } else if (status === "keep") {
      values[key] = existing[key] || "";
    } else if (status === "match") {
      values[key] = imported[key] || existing[key] || "";
    } else {
      values[key] = imported[key] || "";
    }
  }
  return values;
}

function StatusChip({ status }) {
  const meta = FIELD_STATUS_META[status];
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center h-5 px-1.5 rounded-md border text-[10px] font-bold uppercase tracking-wide ${meta.className}`}>
      {meta.label}
    </span>
  );
}

export default function BiodataUploadModal({ open, onClose, onFillForm, compareWith = null }) {
  const fileRef = useRef(null);
  const [step, setStep] = useState("upload");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [senderMatch, setSenderMatch] = useState(null);
  const [matchKind, setMatchKind] = useState("none"); // prospect | sender | none
  const [manualMode, setManualMode] = useState(false);
  const [recheckMobile, setRecheckMobile] = useState("");
  const [recheckEmail, setRecheckEmail] = useState("");
  const [resolution, setResolution] = useState("same");
  const [importedValues, setImportedValues] = useState({});
  const [existingValues, setExistingValues] = useState({});
  const [statuses, setStatuses] = useState({});
  const [picks, setPicks] = useState({});
  const [fieldValues, setFieldValues] = useState({});
  const [editingKeys, setEditingKeys] = useState([]);
  const [reviewError, setReviewError] = useState("");

  const reset = () => {
    setStep("upload");
    setDragging(false);
    setFile(null);
    setParsing(false);
    setExtracted(null);
    setSelectedMatch(null);
    setSenderMatch(null);
    setMatchKind("none");
    setManualMode(false);
    setRecheckMobile("");
    setRecheckEmail("");
    setResolution("same");
    setImportedValues({});
    setExistingValues({});
    setStatuses({});
    setPicks({});
    setFieldValues({});
    setEditingKeys([]);
    setReviewError("");
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const emitFill = ({
    data,
    values,
    kind,
    prospect,
    sender,
    isNew,
    nextStatuses,
    nextPicks,
    existingValues: existing,
    senderMobile,
    senderEmail,
    nextResolution,
  }) => {
    if (!data) return;
    onFillForm?.({
      fileName: data.fileName,
      fields: values,
      alsoRead: data.alsoRead,
      match: kind === "prospect" ? prospect : null,
      senderMatch: sender || null,
      matchKind: kind,
      manualMode: Boolean(isNew),
      resolution: nextResolution,
      senderMobile: senderMobile || data.senderMobile,
      senderEmail: senderEmail || data.senderEmail,
      createNew: Boolean(isNew),
      fieldMeta: nextStatuses,
      picks: nextPicks,
      existingValues: existing || {},
      biodataName: data.biodataName,
    });
    onClose?.();
  };

  const applyExtraction = (nextFile, preselected) => {
    const data = mockExtractBiodata(nextFile);
    const imported = importedFromExtract(data);

    const prospectHits = findDuplicatesByMobileOrEmail({
      mobile: imported.mobile,
      email: imported.email,
    });
    const senderHits = findDuplicatesByMobileOrEmail({
      mobile: data.senderMobile,
      email: data.senderEmail,
    });

    let kind = "none";
    let prospect = null;
    const sender = senderHits[0] || null;

    if (preselected && !manualMode) {
      kind = "prospect";
      prospect = preselected;
    } else if (prospectHits[0]) {
      kind = "prospect";
      prospect = prospectHits[0];
    } else if (sender) {
      kind = "sender";
    }

    const crmExisting =
      kind === "prospect" && prospect ? contactToLeadFields(prospect) : {};
    const formExisting = formToLeadFields(compareWith);
    const nextStatuses = classifyLeadFields(imported, crmExisting);
    const nextPicks = defaultPicks(nextStatuses);
    const nextValues = seedFieldValues(
      imported,
      { ...formExisting, ...crmExisting },
      nextStatuses,
      nextPicks
    );
    for (const field of CREATE_LEAD_COMPARE_FIELDS) {
      if (!String(nextValues[field.key] || "").trim() && formExisting[field.key]) {
        nextValues[field.key] = formExisting[field.key];
      }
    }
    const isNew = kind !== "prospect" || !prospect;
    const namesDiffer =
      Boolean(prospect?.name) &&
      Boolean(data.biodataName) &&
      String(data.biodataName).trim().toLowerCase() !== String(prospect.name).trim().toLowerCase();

    // Always fill Create Lead — that modal shows Existing / New / Blank on each field.
    emitFill({
      data,
      values: nextValues,
      kind,
      prospect: isNew ? null : prospect,
      sender,
      isNew,
      nextStatuses,
      nextPicks,
      existingValues: crmExisting,
      senderMobile: data.senderMobile,
      senderEmail: data.senderEmail,
      nextResolution: isNew ? (kind === "sender" ? "sender" : "new") : namesDiffer ? "same" : "same",
    });
  };

  const takeFile = (next) => {
    if (!next) return;
    setFile(next);
    setParsing(true);
    window.setTimeout(() => {
      setParsing(false);
      applyExtraction(next);
    }, 650);
  };

  const loadDummyFile = async (name = "dummy-biodata.pdf") => {
    const type = name.endsWith(".jpg") ? "image/jpeg" : "application/pdf";
    setParsing(true);
    try {
      const res = await fetch(`/samples/${name}`);
      const blob = await res.blob();
      takeFile(new File([blob], name, { type }));
    } catch {
      setParsing(false);
    }
  };

  const nameMismatch = useMemo(() => {
    if (!extracted || !selectedMatch || matchKind !== "prospect") return false;
    const a = (extracted.biodataName || "").trim().toLowerCase();
    const b = (selectedMatch.name || "").trim().toLowerCase();
    return Boolean(a && b && a !== b);
  }, [extracted, selectedMatch, matchKind]);

  const missingLabels = useMemo(() => missingRequiredLabels(fieldValues), [fieldValues]);
  const missingFields = useMemo(
    () => CREATE_LEAD_COMPARE_FIELDS.filter((f) => statuses[f.key] === "missing"),
    [statuses]
  );
  const fieldErrors = useMemo(() => validateCreateLeadFields(fieldValues), [fieldValues]);

  const statusCounts = useMemo(() => {
    const counts = { match: 0, mismatch: 0, new: 0, missing: 0 };
    for (const status of Object.values(statuses)) {
      if (status in counts) counts[status] += 1;
    }
    return counts;
  }, [statuses]);

  const handleRecheck = () => {
    const senderHits = findDuplicatesByMobileOrEmail({
      mobile: recheckMobile,
      email: recheckEmail,
    });
    const sender = senderHits[0] || null;
    setSenderMatch(sender);
    if (matchKind === "prospect") return;
    if (sender) {
      setMatchKind("sender");
      setManualMode(true);
      setSelectedMatch(null);
    } else {
      setMatchKind("none");
      setManualMode(true);
      setSelectedMatch(null);
    }
  };

  const setPick = (key, which) => {
    setPicks((prev) => ({ ...prev, [key]: which }));
    setFieldValues((prev) => ({
      ...prev,
      [key]: which === "already" ? existingValues[key] || "" : importedValues[key] || "",
    }));
    setReviewError("");
  };

  const createNew =
    matchKind !== "prospect" ||
    !selectedMatch ||
    (nameMismatch && resolution === "relative");

  const primaryActionLabel = useMemo(() => {
    if (createNew) return "Continue · create lead";
    return "Continue · update lead";
  }, [createNew]);

  const handleFill = () => {
    if (!extracted) return;
    const errors = validateCreateLeadFields(fieldValues);
    const msg = firstValidationMessage(errors);
    if (msg) {
      setReviewError(msg);
      return;
    }
    emitFill({
      data: extracted,
      values: { ...fieldValues },
      kind: matchKind,
      prospect: matchKind === "prospect" ? selectedMatch : null,
      sender: senderMatch,
      isNew: createNew,
      nextStatuses: statuses,
      nextPicks: picks,
      senderMobile: recheckMobile || extracted.senderMobile,
      senderEmail: recheckEmail || extracted.senderEmail,
      nextResolution: createNew
        ? matchKind === "sender"
          ? "sender"
          : nameMismatch
            ? resolution
            : "new"
        : nameMismatch
          ? resolution
          : "same",
    });
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload Biodata"
      subtitle={
        step === "upload"
          ? "PDF, Word, or scanned image — extract, then fill missing fields in Create Lead"
          : "Already in system — pick Import vs Already, then continue to Create Lead"
      }
      icon={<FileText size={18} />}
      iconBg="#E7F8EF"
      iconColor="#16A34A"
      width="max-w-3xl"
      zClass="z-[70]"
      footer={
        step === "review" ? (
          <>
            <button
              type="button"
              onClick={reset}
              className="h-10 px-4 rounded-xl border border-black/12 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors"
            >
              Another file
            </button>
            <button
              type="button"
              onClick={handleFill}
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              {primaryActionLabel}
            </button>
          </>
        ) : null
      }
    >
      {step === "upload" && (
        <div className="flex flex-col gap-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              takeFile(e.dataTransfer.files?.[0]);
            }}
            className={`rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
              dragging ? "border-[#7A0A17] bg-[#FCF5F6]" : "border-black/12 bg-[#FAFAFB]"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => takeFile(e.target.files?.[0])}
            />
            {parsing ? (
              <div className="inline-flex items-center gap-2 text-[#7A0A17] text-[13px] font-semibold">
                <Loader2 size={18} className="animate-spin" />
                Reading biodata…
              </div>
            ) : (
              <>
                <CloudUpload size={28} className="mx-auto text-[#7A0A17] mb-2" />
                <p className="text-[14px] font-semibold text-[#111]">
                  {file ? file.name : "Drop biodata here"}
                </p>
                <p className="text-[12px] text-[#9CA3AF] mt-1">
                  PDF, DOC, DOCX, or scanned image (JPG / PNG)
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
                  >
                    Select file
                  </button>
                  <button
                    type="button"
                    onClick={() => loadDummyFile("dummy-biodata.pdf")}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-[#7A0A17]/30 bg-white text-[13px] font-semibold text-[#7A0A17] hover:bg-[#FCF5F6] transition-colors"
                  >
                    Use dummy biodata
                  </button>
                  <button
                    type="button"
                    onClick={() => loadDummyFile("dummy-biodata.jpg")}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-black/12 bg-white text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors"
                  >
                    Use new dummy
                  </button>
                </div>
                <p className="text-[11.5px] text-[#9CA3AF] mt-3">
                  Or download and upload yourself:{" "}
                  <a href="/samples/dummy-biodata.pdf" download className="text-[#7A0A17] font-semibold hover:underline">
                    dummy-biodata.pdf
                  </a>
                  {" · "}
                  <a href="/samples/dummy-biodata.jpg" download className="text-[#7A0A17] font-semibold hover:underline">
                    dummy-biodata.jpg
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {step === "review" && extracted && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[15px] font-bold text-[#111]">
                Received from{" "}
                <span className="text-[#7A0A17]">
                  {formatDisplayMobile(recheckMobile || extracted.senderMobile)}
                </span>
                {recheckEmail || extracted.senderEmail ? (
                  <span className="font-medium text-[#6B7280]">
                    {" "}
                    · {recheckEmail || extracted.senderEmail}
                  </span>
                ) : null}
              </p>
              <p className="text-[12.5px] text-[#6B7280] mt-0.5">
                Name inside the biodata:{" "}
                <span className="font-semibold text-[#111]">{extracted.biodataName}</span>
                {" · "}
                {extracted.fileName}
                {extracted.hasTextLayer ? "" : " · scanned image"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <input
                value={recheckMobile}
                onChange={(e) => setRecheckMobile(e.target.value.replace(/[^\d\s+]/g, ""))}
                className={`${INPUT} w-[130px]`}
                placeholder="Sender mobile"
              />
              <input
                value={recheckEmail}
                onChange={(e) => setRecheckEmail(e.target.value)}
                className={`${INPUT} w-[180px]`}
                placeholder="Sender email"
              />
              <button
                type="button"
                onClick={handleRecheck}
                className="h-10 px-3.5 rounded-xl border border-black/12 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors"
              >
                Re-check
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-black/10 bg-[#FAFAFB] px-3.5 py-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wide">
                  Duplicate check · mobile &amp; email
                </p>
                {matchKind === "prospect" && selectedMatch ? (
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 size={18} className="text-[#16A34A]" />
                    <p className="text-[13.5px] font-semibold text-[#111]">
                      Already in system — {selectedMatch.name}
                      <span className="font-normal text-[#6B7280]">
                        {" "}
                        · {selectedMatch.type} · {selectedMatch.mmlId || selectedMatch.id}
                      </span>
                    </p>
                  </div>
                ) : matchKind === "sender" && senderMatch ? (
                  <div className="flex items-center gap-2 mt-1">
                    <UserPlus size={18} className="text-[#1D4ED8]" />
                    <p className="text-[13.5px] font-semibold text-[#111]">
                      Prospect not in system. Sender is registered as {senderMatch.name}
                      <span className="font-normal text-[#6B7280]"> — continue as a new lead</span>
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <XCircle size={18} className="text-[#E8395B]" />
                    <p className="text-[13.5px] font-semibold text-[#111]">
                      No mobile / email match — create a new lead
                    </p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setStep("upload")}
                className="text-[12.5px] font-semibold text-[#7A0A17] hover:underline"
              >
                Change file
              </button>
            </div>

            {matchKind === "prospect" && selectedMatch && (
              <div className="flex flex-wrap gap-3 mt-2.5 pt-2.5 border-t border-black/8">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#374151]">
                  <MatchIcon ok={selectedMatch.mobileOk} size={15} />
                  Mobile {formatDisplayMobile(selectedMatch.mobile)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#374151]">
                  <MatchIcon ok={selectedMatch.emailOk} size={15} />
                  Email {selectedMatch.email || "—"}
                </span>
              </div>
            )}
          </div>

          {nameMismatch && selectedMatch && (
            <div className="rounded-xl border border-[#F5D78E] bg-[#FFF8E8] px-4 py-3.5">
              <p className="text-[13.5px] font-bold text-[#92400E]">
                This number / email is on file under a different name
              </p>
              <p className="text-[12.5px] text-[#78350F]/90 mt-1.5 leading-relaxed">
                System has <span className="font-semibold">{selectedMatch.name}</span>, biodata name is{" "}
                <span className="font-semibold">{extracted.biodataName}</span>.
              </p>
              <div className="flex flex-col gap-2 mt-3">
                {RESOLUTIONS.map((opt) => (
                  <label key={opt.id} className="flex items-start gap-2.5 cursor-pointer text-[13px] text-[#78350F]">
                    <input
                      type="radio"
                      name="biodata-resolution"
                      checked={resolution === opt.id}
                      onChange={() => setResolution(opt.id)}
                      className="mt-0.5 accent-[#7A0A17]"
                    />
                    <span className={resolution === opt.id ? "font-semibold" : ""}>{opt.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {["match", "mismatch", "new", "missing"].map((key) => (
              <span
                key={key}
                className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-[11.5px] font-semibold ${FIELD_STATUS_META[key].className}`}
              >
                {FIELD_STATUS_META[key].label}
                {statusCounts[key] ? ` · ${statusCounts[key]}` : ""}
              </span>
            ))}
          </div>

          {missingFields.length > 0 && (
            <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-3">
              <p className="text-[13px] font-bold text-[#B91C1C]">
                Missing in biodata — fill these
              </p>
              <ul className="mt-2 flex flex-col gap-1.5">
                {missingFields.map((field) => (
                  <li key={field.key} className="text-[12.5px] text-[#7F1D1D]">
                    <span className="font-semibold">{field.label}</span>
                    {field.required ? " *" : ""}
                    <span className="text-[#9B1C1C]/80">
                      {" "}
                      — not captured. {FIELD_DUMMY_HINTS[field.key] || "Fill manually"}
                    </span>
                  </li>
                ))}
              </ul>
              {missingLabels.length > 0 ? (
                <p className="text-[12px] font-semibold text-[#B91C1C] mt-2">
                  Required before save: {missingLabels.join(", ")}
                </p>
              ) : null}
            </div>
          )}

          {matchKind === "prospect" && selectedMatch && (
            <div className="rounded-xl border border-black/10 px-3.5 py-3">
              <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
                System data
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[12.5px]">
                {CREATE_LEAD_COMPARE_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-baseline justify-between gap-3">
                    <span className="text-[#6B7280]">{field.label}</span>
                    <span className="font-medium text-[#111] text-right">
                      {displayFieldValue(field.key, existingValues[field.key])}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[13.5px] font-bold text-[#111] mb-2">Compare &amp; fill</p>
            <ul className="rounded-xl border border-black/10 divide-y divide-black/6 overflow-hidden">
              {CREATE_LEAD_COMPARE_FIELDS.map((field) => {
                const status = statuses[field.key] || "empty";
                const isEditing = editingKeys.includes(field.key);
                const error = fieldErrors[field.key];
                return (
                  <li key={field.key} className={`px-3.5 py-2.5 ${ROW_TONE[status] || "bg-white"}`}>
                    <div className="flex items-center gap-3">
                      <span className="w-[28%] sm:w-[22%] text-[12.5px] text-[#6B7280] shrink-0">
                        {field.label}
                        {field.required ? <span className="text-[#E8395B]"> *</span> : null}
                      </span>
                      <div className="flex-1 min-w-0">
                        {status === "mismatch" && !isEditing ? (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <button
                              type="button"
                              onClick={() => setPick(field.key, "import")}
                              className={`flex-1 text-left rounded-lg border px-2.5 py-1.5 text-[12.5px] transition-colors ${
                                picks[field.key] === "import"
                                  ? "border-[#2563EB] bg-white text-[#1D4ED8] font-semibold"
                                  : "border-black/10 bg-white/70 text-[#374151] hover:border-[#93C5FD]"
                              }`}
                            >
                              <span className="block text-[10px] font-bold uppercase tracking-wide text-[#2563EB]">
                                Import
                              </span>
                              {displayFieldValue(field.key, importedValues[field.key])}
                            </button>
                            <button
                              type="button"
                              onClick={() => setPick(field.key, "already")}
                              className={`flex-1 text-left rounded-lg border px-2.5 py-1.5 text-[12.5px] transition-colors ${
                                picks[field.key] === "already"
                                  ? "border-[#D97706] bg-white text-[#92400E] font-semibold"
                                  : "border-black/10 bg-white/70 text-[#374151] hover:border-[#FCD34D]"
                              }`}
                            >
                              <span className="block text-[10px] font-bold uppercase tracking-wide text-[#D97706]">
                                Already
                              </span>
                              {displayFieldValue(field.key, existingValues[field.key])}
                            </button>
                          </div>
                        ) : (
                          <input
                            value={fieldValues[field.key] ?? ""}
                            onChange={(e) => {
                              setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }));
                              setReviewError("");
                            }}
                            readOnly={status !== "missing" && status !== "new" && !isEditing}
                            placeholder={
                              status === "missing"
                                ? FIELD_DUMMY_HINTS[field.key] || "Fill this field"
                                : ""
                            }
                            className={`w-full h-8 px-2 rounded-lg outline-none text-[13px] font-medium ${
                              status === "missing" || status === "new" || isEditing
                                ? "border border-black/10 focus:border-[#7A0A17]/40 text-[#111] bg-white"
                                : "border border-transparent text-[#111] bg-transparent"
                            } ${status === "missing" && !fieldValues[field.key] ? "placeholder:text-[#E8395B]/70" : ""}`}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <StatusChip status={status} />
                        {status !== "mismatch" || isEditing ? (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingKeys((prev) =>
                                prev.includes(field.key) ? prev : [...prev, field.key]
                              )
                            }
                            className="inline-flex items-center gap-1 h-8 px-2 rounded-lg border border-transparent text-[12px] font-semibold text-[#6B7280] hover:border-black/10 hover:bg-white/80"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setEditingKeys((prev) =>
                                prev.includes(field.key) ? prev : [...prev, field.key]
                              )
                            }
                            className="inline-flex items-center gap-1 h-8 px-2 rounded-lg border border-black/10 text-[12px] font-semibold text-[#7A0A17] hover:bg-white"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                    {error ? (
                      <p className="text-[11.5px] font-semibold text-[#E8395B] mt-1 ml-[28%] sm:ml-[22%]">
                        {error}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>

          {reviewError ? (
            <p className="text-[12.5px] font-semibold text-[#E8395B]">{reviewError}</p>
          ) : null}

          {extracted.alsoRead?.length > 0 && (
            <div>
              <p className="text-[12px] font-semibold text-[#6B7280] mb-2">
                Also read{" "}
                <span className="font-normal text-[#9CA3AF]">(kept on the profile, not form fields)</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {extracted.alsoRead.map((chip) => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-[#F3F4F6] text-[11.5px] text-[#374151]"
                  >
                    <span className="font-semibold text-[#6B7280]">{chip.label}</span>
                    <span className="font-medium">{chip.value}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
