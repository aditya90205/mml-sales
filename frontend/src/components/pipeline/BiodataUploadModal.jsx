import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  CloudUpload,
  FileText,
  Loader2,
  Pencil,
  Search,
  UserPlus,
  XCircle,
} from "lucide-react";
import Modal from "../ui/Modal.jsx";
import {
  digitsOnly,
  formatDisplayMobile,
  mockExtractBiodata,
  searchContacts,
} from "../../utils/contactSearch.js";

const RESOLUTIONS = [
  {
    id: "same",
    title: "Same person — update the CRM name",
  },
  {
    id: "relative",
    title: "A relative — file as a new lead, linked to the CRM contact",
  },
  {
    id: "wrong",
    title: "Wrong number on the biodata — flag for review",
  },
];

const INPUT =
  "w-full h-10 px-3.5 rounded-xl bg-white border border-black/12 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/45 transition-colors";

function MatchIcon({ ok, size = 16 }) {
  if (ok === true) {
    return <CheckCircle2 size={size} className="text-[#16A34A] shrink-0" strokeWidth={2.2} />;
  }
  if (ok === false) {
    return <XCircle size={size} className="text-[#E8395B] shrink-0" strokeWidth={2.2} />;
  }
  return <span className="inline-block size-4 rounded-full bg-black/10 shrink-0" style={{ width: size, height: size }} />;
}

function emptySearch() {
  return { name: "", mobile: "", email: "" };
}

/** Normalize Create Lead + biodata values for equality checks. */
function normalizeField(key, value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  if (key === "mobile") return digitsOnly(raw).slice(-10);

  if (key === "email") return raw.toLowerCase();

  if (key === "lookingFor") {
    const v = raw.toLowerCase();
    if (v === "yes" || v.includes("groom")) return "yes";
    if (v === "no" || v.includes("bride")) return "no";
    return v;
  }

  if (key === "relation") {
    const v = raw.toLowerCase();
    if (v.includes("self")) return "self";
    if (v.includes("parent")) return "parent";
    if (v.includes("sibling")) return "sibling";
    if (v.includes("relative")) return "relative";
    if (v.includes("friend")) return "friend";
    return v;
  }

  if (key === "city") {
    return raw.toLowerCase().split(",")[0].trim();
  }

  return raw.toLowerCase();
}

function leadCompareValue(compareWith, key) {
  if (!compareWith || typeof compareWith !== "object") return "";
  return compareWith[key] ?? "";
}

function fieldsMatch(key, biodataValue, leadValue) {
  const leadNorm = normalizeField(key, leadValue);
  if (!leadNorm) return true; // nothing on Create Lead to conflict with
  return normalizeField(key, biodataValue) === leadNorm;
}

export default function BiodataUploadModal({ open, onClose, onFillForm, compareWith = null }) {
  const fileRef = useRef(null);
  const [step, setStep] = useState("search"); // search | review
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [search, setSearch] = useState(emptySearch);
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [manualMode, setManualMode] = useState(false);
  const [recheckMobile, setRecheckMobile] = useState("");
  const [resolution, setResolution] = useState("relative");
  const [fieldValues, setFieldValues] = useState({});
  const [mismatchedKeys, setMismatchedKeys] = useState([]);
  const [editingKeys, setEditingKeys] = useState([]);

  const reset = () => {
    setStep("search");
    setDragging(false);
    setFile(null);
    setParsing(false);
    setExtracted(null);
    setSearch(emptySearch());
    setSearched(false);
    setResults([]);
    setSelectedMatch(null);
    setManualMode(false);
    setRecheckMobile("");
    setResolution("relative");
    setFieldValues({});
    setMismatchedKeys([]);
    setEditingKeys([]);
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const runSearch = (override = {}) => {
    const query = {
      name: override.name ?? search.name,
      mobile: override.mobile ?? search.mobile,
      email: override.email ?? search.email,
    };
    const { results: next } = searchContacts(query);
    setResults(next);
    setSearched(true);
    if (next.length === 1) {
      setSelectedMatch(next[0]);
      setManualMode(false);
    } else if (next.length === 0) {
      setSelectedMatch(null);
    }
    return next;
  };

  const applyExtraction = (nextFile, match) => {
    const data = mockExtractBiodata(nextFile);
    setExtracted(data);
    setRecheckMobile(data.senderMobile || "");

    const values = {};
    const mismatches = [];
    for (const f of data.fields) {
      const leadVal = leadCompareValue(compareWith, f.key);
      const ok = fieldsMatch(f.key, f.value, leadVal);
      if (ok) {
        values[f.key] = f.value;
      } else {
        values[f.key] = "";
        mismatches.push(f.key);
      }
    }
    setFieldValues(values);
    setMismatchedKeys(mismatches);
    setEditingKeys([]);

    const autoQuery = {
      name: data.biodataName || "",
      mobile: data.senderMobile || digitsOnly(values.mobile || data.fields.find((x) => x.key === "mobile")?.value) || "",
      email: values.email || data.fields.find((x) => x.key === "email")?.value || "",
    };
    setSearch((prev) => ({
      name: prev.name || autoQuery.name,
      mobile: prev.mobile || autoQuery.mobile,
      email: prev.email || autoQuery.email,
    }));

    const { results: next } = searchContacts({
      name: match ? "" : autoQuery.name,
      mobile: match?.mobile || autoQuery.mobile,
      email: match ? "" : autoQuery.email,
    });
    setResults(next);
    setSearched(true);

    if (match) {
      setSelectedMatch(match);
      setManualMode(false);
    } else if (next[0]) {
      setSelectedMatch(next[0]);
      setManualMode(false);
    } else {
      setSelectedMatch(null);
      setManualMode(true);
    }

    setStep("review");
  };

  const takeFile = (next) => {
    if (!next) return;
    setFile(next);
    setParsing(true);
    window.setTimeout(() => {
      setParsing(false);
      applyExtraction(next, selectedMatch && !manualMode ? selectedMatch : null);
    }, 650);
  };

  const nameMismatch = useMemo(() => {
    if (!extracted || !selectedMatch || manualMode) return false;
    const a = (extracted.biodataName || "").trim().toLowerCase();
    const b = (selectedMatch.name || "").trim().toLowerCase();
    return Boolean(a && b && a !== b);
  }, [extracted, selectedMatch, manualMode]);

  const biodataMobileDiffers = useMemo(() => {
    if (!extracted) return false;
    const inside = digitsOnly(fieldValues.mobile || "");
    const sender = digitsOnly(extracted.senderMobile || recheckMobile);
    return Boolean(inside && sender && inside !== sender);
  }, [extracted, fieldValues.mobile, recheckMobile]);

  const fieldCount = extracted?.fields?.length || 0;

  const handleRecheck = () => {
    const mobile = recheckMobile.trim();
    setSearch((prev) => ({ ...prev, mobile }));
    const next = runSearch({ mobile, name: search.name, email: search.email });
    if (next[0]) {
      setSelectedMatch(next[0]);
      setManualMode(false);
    } else {
      setSelectedMatch(null);
      setManualMode(true);
    }
  };

  const primaryActionLabel = useMemo(() => {
    if (manualMode || !selectedMatch) {
      return `Save · ${fieldCount} field${fieldCount === 1 ? "" : "s"}`;
    }
    if (nameMismatch && resolution === "relative") {
      return `Save linked lead · ${fieldCount} field${fieldCount === 1 ? "" : "s"}`;
    }
    if (nameMismatch && resolution === "wrong") {
      return "Save · flag for review";
    }
    return `Save · ${fieldCount} field${fieldCount === 1 ? "" : "s"}`;
  }, [manualMode, selectedMatch, nameMismatch, resolution, fieldCount]);

  const handleFill = () => {
    if (!extracted) return;
    // Always save every extracted field the same way (no select / unselect gate)
    const picked = {};
    for (const f of extracted.fields) {
      picked[f.key] = fieldValues[f.key] ?? "";
    }
    const isNew =
      manualMode ||
      !selectedMatch ||
      (nameMismatch && resolution === "relative");
    onFillForm?.({
      fileName: extracted.fileName,
      fields: picked,
      alsoRead: extracted.alsoRead,
      match: manualMode ? null : selectedMatch,
      manualMode: Boolean(manualMode || !selectedMatch),
      resolution: !selectedMatch || manualMode ? "new" : nameMismatch ? resolution : "same",
      senderMobile: recheckMobile || extracted.senderMobile,
      createNew: isNew,
    });
    onClose?.();
  };

  const searchDisabled =
    !search.name.trim() && !search.mobile.trim() && !search.email.trim();

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload Biodata"
      subtitle={
        step === "search"
          ? "Search leads / clients, then upload — match or enter manually"
          : compareWith
            ? "Compared with Create Lead — mismatch fields are blank; edit & fill manually"
            : "Review extracted fields, edit if needed, then save"
      }
      icon={<FileText size={18} />}
      iconBg="#E7F8EF"
      iconColor="#16A34A"
      width="max-w-2xl"
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
      {step === "search" && (
        <div className="flex flex-col gap-5">
          <div className="rounded-2xl border border-black/10 bg-[#FAFAFB] p-4">
            <p className="text-[13px] font-semibold text-[#111] mb-3">
              Search leads &amp; clients
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                value={search.name}
                onChange={(e) => setSearch((p) => ({ ...p, name: e.target.value }))}
                placeholder="Name"
                className={INPUT}
              />
              <input
                value={search.mobile}
                onChange={(e) =>
                  setSearch((p) => ({ ...p, mobile: e.target.value.replace(/[^\d\s+]/g, "") }))
                }
                placeholder="Mobile"
                inputMode="numeric"
                className={INPUT}
              />
              <input
                value={search.email}
                onChange={(e) => setSearch((p) => ({ ...p, email: e.target.value }))}
                placeholder="Email"
                className={INPUT}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button
                type="button"
                disabled={searchDisabled}
                onClick={() => runSearch()}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] disabled:opacity-45 transition-colors"
              >
                <Search size={14} />
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedMatch(null);
                  setManualMode(true);
                  setResults([]);
                  setSearched(true);
                }}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-black/12 text-[13px] font-semibold text-[#374151] hover:bg-white transition-colors"
              >
                <UserPlus size={14} />
                No match — manual entry
              </button>
              {extracted && (
                <button
                  type="button"
                  onClick={() => setStep("review")}
                  className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-[#7A0A17]/25 bg-[#FCF5F6] text-[13px] font-semibold text-[#7A0A17] hover:bg-[#F9EDEF] transition-colors ml-auto"
                >
                  Continue to review
                </button>
              )}
            </div>
          </div>

          {searched && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wide">
                  {results.length === 0 ? "No records found" : `${results.length} match${results.length === 1 ? "" : "es"}`}
                </p>
                {manualMode && (
                  <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#7A0A17]">
                    <UserPlus size={13} />
                    Manual entry selected
                  </span>
                )}
              </div>

              {results.length === 0 ? (
                <div className="rounded-xl border border-dashed border-black/12 px-4 py-6 text-center">
                  <div className="inline-flex items-center justify-center gap-2 text-[#E8395B] mb-2">
                    <XCircle size={20} />
                    <span className="text-[14px] font-semibold">No match in leads / clients</span>
                  </div>
                  <p className="text-[12.5px] text-[#6B7280]">
                    Upload the biodata and fill fields manually, or change your search.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-2 max-h-[220px] overflow-y-auto scrollbar-thin">
                  {results.map((row) => {
                    const active = !manualMode && selectedMatch?.id === row.id;
                    return (
                      <li key={row.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMatch(row);
                            setManualMode(false);
                          }}
                          className={`w-full text-left rounded-xl border px-3.5 py-3 transition-colors ${
                            active
                              ? "border-[#7A0A17]/35 bg-[#FCF5F6]"
                              : "border-black/10 bg-white hover:bg-[#FAFAFB]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-[13.5px] font-semibold text-[#111] truncate">
                                  {row.name}
                                </p>
                                <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-black/5 text-[#6B7280]">
                                  {row.type}
                                </span>
                                {row.mmlId ? (
                                  <span className="text-[11px] text-[#9CA3AF] truncate">{row.mmlId}</span>
                                ) : null}
                              </div>
                              <p className="text-[12px] text-[#6B7280] mt-0.5 truncate">
                                {formatDisplayMobile(row.mobile)}
                                {row.email ? ` · ${row.email}` : ""}
                                {row.owner ? ` · Owner: ${row.owner}` : ""}
                              </p>
                            </div>
                            <div className="flex items-center gap-2.5 shrink-0 pt-0.5">
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#6B7280]" title="Name">
                                <MatchIcon ok={row.nameOk} size={14} />
                                Name
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#6B7280]" title="Mobile">
                                <MatchIcon ok={row.mobileOk} size={14} />
                                Mobile
                              </span>
                              <span className="inline-flex items-center gap-1 text-[11px] text-[#6B7280]" title="Email">
                                <MatchIcon ok={row.emailOk} size={14} />
                                Email
                              </span>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

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
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => takeFile(e.target.files?.[0])}
            />
            {parsing ? (
              <div className="inline-flex items-center gap-2 text-[#7A0A17] text-[13px] font-semibold">
                <Loader2 size={18} className="animate-spin" />
                Reading biodata…
              </div>
            ) : extracted && file ? (
              <>
                <FileText size={28} className="mx-auto text-[#16A34A] mb-2" />
                <p className="text-[14px] font-semibold text-[#111]">{file.name || extracted.fileName}</p>
                <p className="text-[12px] text-[#9CA3AF] mt-1">
                  Already extracted — change match above, then continue to review
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setStep("review")}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
                  >
                    Continue to review
                  </button>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-black/12 text-[13px] font-semibold text-[#374151] hover:bg-white transition-colors"
                  >
                    Replace file
                  </button>
                </div>
              </>
            ) : (
              <>
                <CloudUpload size={28} className="mx-auto text-[#7A0A17] mb-2" />
                <p className="text-[14px] font-semibold text-[#111]">
                  {file ? file.name : "Drop biodata PDF here"}
                </p>
                <p className="text-[12px] text-[#9CA3AF] mt-1">
                  {selectedMatch && !manualMode
                    ? `Will link / compare with ${selectedMatch.name}`
                    : manualMode
                      ? "Manual entry — no CRM link"
                      : "Optional: search first, or upload and we will auto-match"}
                </p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-4 inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
                >
                  Select file
                </button>
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
                <span className="text-[#7A0A17]">{digitsOnly(recheckMobile) || extracted.senderMobile}</span>
              </p>
              <p className="text-[12.5px] text-[#6B7280] mt-0.5">
                name inside the biodata:{" "}
                <span className="font-semibold text-[#111]">{extracted.biodataName}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                value={recheckMobile}
                onChange={(e) => setRecheckMobile(e.target.value.replace(/[^\d\s+]/g, ""))}
                className={`${INPUT} w-[140px]`}
                placeholder="Mobile"
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
                  CRM match
                </p>
                {manualMode || !selectedMatch ? (
                  <div className="flex items-center gap-2 mt-1">
                    <XCircle size={18} className="text-[#E8395B]" />
                    <p className="text-[13.5px] font-semibold text-[#111]">
                      No match — salesperson will enter manually
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 size={18} className="text-[#16A34A]" />
                    <p className="text-[13.5px] font-semibold text-[#111]">
                      {selectedMatch.name}
                      <span className="font-normal text-[#6B7280]">
                        {" "}
                        · {selectedMatch.type} · {selectedMatch.mmlId || selectedMatch.id}
                      </span>
                    </p>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => setStep("search")}
                className="text-[12.5px] font-semibold text-[#7A0A17] hover:underline"
              >
                Change match
              </button>
            </div>

            {!manualMode && selectedMatch && (
              <div className="flex flex-wrap gap-3 mt-2.5 pt-2.5 border-t border-black/8">
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#374151]">
                  <MatchIcon ok={selectedMatch.nameOk} size={15} />
                  Name
                </span>
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#374151]">
                  <MatchIcon ok={selectedMatch.mobileOk} size={15} />
                  Mobile
                </span>
                <span className="inline-flex items-center gap-1.5 text-[12px] text-[#374151]">
                  <MatchIcon ok={selectedMatch.emailOk} size={15} />
                  Email
                </span>
              </div>
            )}
          </div>

          {nameMismatch && selectedMatch && (
            <div className="rounded-xl border border-[#F5D78E] bg-[#FFF8E8] px-4 py-3.5">
              <p className="text-[13.5px] font-bold text-[#92400E]">
                Mismatch — this number is on file under a different name
              </p>
              <p className="text-[12.5px] text-[#78350F]/90 mt-1.5 leading-relaxed">
                Sender {formatDisplayMobile(recheckMobile || extracted.senderMobile)} is already on
                file as <span className="font-semibold">{selectedMatch.name}</span>
                {selectedMatch.owner ? (
                  <>
                    {" "}
                    (owner: <span className="font-semibold">{selectedMatch.owner}</span>)
                  </>
                ) : null}
                , but the biodata name is{" "}
                <span className="font-semibold">{extracted.biodataName}</span>.
                {biodataMobileDiffers ? (
                  <>
                    {" "}
                    Heads up: number inside the biodata (
                    {digitsOnly(fieldValues.mobile)}) is different from the number it was sent from.
                  </>
                ) : null}
              </p>
              <div className="flex flex-col gap-2 mt-3">
                {RESOLUTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex items-start gap-2.5 cursor-pointer text-[13px] text-[#78350F]"
                  >
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

          <div>
            <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
              <div className="min-w-0">
                <p className="text-[13.5px] font-bold text-[#111]">Extracted fields</p>
                <p className="text-[11.5px] text-[#9CA3AF] mt-0.5 truncate">
                  from {extracted.fileName} · {extracted.sizeLabel} · {extracted.pages} pages
                  {extracted.hasTextLayer ? " · text layer found" : ""}
                  {mismatchedKeys.length > 0
                    ? ` · ${mismatchedKeys.length} mismatch — fill manually`
                    : ""}
                </p>
              </div>
            </div>

            <ul className="rounded-xl border border-black/10 divide-y divide-black/6 overflow-hidden">
              {extracted.fields.map((field) => {
                const isMismatch = mismatchedKeys.includes(field.key);
                const isEditing = editingKeys.includes(field.key);
                const canEdit = !isMismatch || isEditing;
                return (
                  <li
                    key={field.key}
                    className={`flex items-center gap-3 px-3.5 py-2.5 ${
                      isMismatch && !isEditing ? "bg-[#FEF2F2]" : "bg-white hover:bg-[#FAFAFB]"
                    }`}
                  >
                    {isMismatch ? (
                      <XCircle size={18} className="text-[#E8395B] shrink-0" strokeWidth={2.2} />
                    ) : (
                      <CheckCircle2 size={18} className="text-[#16A34A] shrink-0" strokeWidth={2.2} />
                    )}
                    <span className="w-[34%] sm:w-[30%] text-[12.5px] text-[#6B7280] shrink-0">
                      {field.label}
                    </span>
                    <input
                      value={fieldValues[field.key] ?? ""}
                      onChange={(e) =>
                        setFieldValues((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      readOnly={!canEdit}
                      placeholder={isMismatch ? "Fill manually" : ""}
                      className={`flex-1 min-w-0 h-8 px-2 rounded-lg outline-none text-[13px] font-medium ${
                        canEdit
                          ? "border border-black/10 focus:border-[#7A0A17]/40 text-[#111] bg-white"
                          : "border border-transparent text-[#111] bg-transparent"
                      } ${isMismatch && !fieldValues[field.key] ? "placeholder:text-[#E8395B]/70" : ""}`}
                    />
                    {isMismatch ? (
                      <button
                        type="button"
                        onClick={() =>
                          setEditingKeys((prev) =>
                            prev.includes(field.key) ? prev : [...prev, field.key]
                          )
                        }
                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-black/10 text-[12px] font-semibold text-[#7A0A17] hover:bg-[#FCF5F6] shrink-0"
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
                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg border border-transparent text-[12px] font-semibold text-[#6B7280] hover:border-black/10 hover:bg-[#FAFAFB] shrink-0"
                      >
                        <Pencil size={12} />
                        Edit
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {extracted.alsoRead?.length > 0 && (
            <div>
              <p className="text-[12px] font-semibold text-[#6B7280] mb-2">
                Also read{" "}
                <span className="font-normal text-[#9CA3AF]">
                  (kept on the profile, not form fields)
                </span>
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
