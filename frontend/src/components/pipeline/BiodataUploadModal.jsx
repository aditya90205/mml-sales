import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, CloudUpload, FileText, Loader2 } from "lucide-react";
import Modal from "../ui/Modal.jsx";
import SearchField from "../common/SearchField.jsx";
import {
  findDuplicatesByMobileOrEmail,
  formatDisplayId,
  formatDisplayMobile,
  searchContactsByQuery,
} from "../../utils/contactSearch.js";
import { extractBiodata } from "../../utils/biodataExtract.js";
import {
  classifyLeadFields,
  contactToLeadFields,
  formToLeadFields,
  isValidEmail,
} from "../../utils/leadFields.js";

const ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.tif,.tiff";

function importedFromExtract(data) {
  const values = {};
  for (const f of data?.fields || []) values[f.key] = f.value ?? "";
  return values;
}

function seedFieldValues(imported, existing) {
  const values = { ...(imported || {}) };
  for (const [key, value] of Object.entries(existing || {})) {
    if (String(value || "").trim()) values[key] = value;
  }
  return values;
}

function queryAsContact(query = "") {
  const raw = String(query || "").trim();
  const digits = raw.replace(/\D/g, "").slice(-10);
  const email = isValidEmail(raw) ? raw : "";
  return {
    mobile: digits.length === 10 ? digits : "",
    email,
  };
}

function ContactMeta({ row, compact = false }) {
  const mobile = row?.mobile ? formatDisplayMobile(row.mobile) : "";
  const email = String(row?.email || "").trim();
  const line = [mobile, email].filter(Boolean).join(" · ");
  return (
    <p className={`text-[#6B7280] truncate ${compact ? "text-[11.5px] mt-0.5" : "text-[12.5px] mt-1"}`}>
      {line || "No mobile or email on file"}
    </p>
  );
}

export default function BiodataUploadModal({ open, onClose, onFillForm, compareWith = null }) {
  const fileRef = useRef(null);
  const [query, setQuery] = useState("");
  const [match, setMatch] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setQuery("");
    setMatch(null);
    setDragging(false);
    setFile(null);
    setParsing(false);
    setError("");
  };

  useEffect(() => {
    if (!open) {
      reset();
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const snap = compareWith || {};
    const seed = String(snap.mobile || snap.email || snap.name || "").trim();
    if (seed) {
      setQuery(seed);
      const hits = searchContactsByQuery(seed).results;
      if (hits[0]) setMatch(hits[0]);
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const { hasQuery, results } = useMemo(() => searchContactsByQuery(query), [query]);
  const typedContact = useMemo(() => queryAsContact(query), [query]);
  const listOpen = hasQuery && !match;
  const digits = String(match?.mobile || typedContact.mobile || "").replace(/\D/g, "").slice(-10);
  const emailTrimmed = String(match?.email || typedContact.email || "").trim();

  const emitFill = (data, prospect, identity = {}) => {
    const imported = importedFromExtract(data);
    const idMobile = String(identity.mobile || "").replace(/\D/g, "").slice(-10);
    const idEmail = String(identity.email || "").trim();
    if (!imported.mobile && idMobile) imported.mobile = idMobile;
    if (!imported.email && idEmail) imported.email = idEmail;
    if (!imported.lookingFor && data.intake?.lookingFor) imported.lookingFor = data.intake.lookingFor;
    if (!imported.city && data.intake?.addrCity) imported.city = data.intake.addrCity;
    if (!imported.area && data.intake?.addrAreaLocality) imported.area = data.intake.addrAreaLocality;
    if (!imported.relation && data.intake?.enquiryBy) imported.relation = data.intake.enquiryBy;
    if (!imported.relation) imported.relation = "Self";

    const crmExisting = prospect ? contactToLeadFields(prospect) : {};
    const formExisting = formToLeadFields(compareWith);
    const existing = prospect ? { ...formExisting, ...crmExisting } : {};
    const values = seedFieldValues(imported, existing);
    const nextStatuses = classifyLeadFields(imported, crmExisting);

    onFillForm?.({
      fileName: data.fileName,
      file: identity.file || null,
      fields: values,
      importedFields: imported,
      alsoRead: data.alsoRead,
      intake: data.intake || {},
      match: prospect || null,
      senderMatch: null,
      matchKind: prospect ? "prospect" : "none",
      manualMode: !prospect,
      resolution: prospect ? "same" : "new",
      senderMobile: imported.mobile || idMobile,
      senderEmail: imported.email || idEmail,
      createNew: !prospect,
      fieldMeta: nextStatuses,
      picks: {},
      existingValues: prospect ? crmExisting : {},
      biodataName: data.biodataName,
    });
    onClose?.();
  };

  const takeFile = (next) => {
    if (!next) return;
    setFile(next);
    setParsing(true);
    setError("");
    window.setTimeout(async () => {
      try {
        const data = await extractBiodata(next);
        const imported = importedFromExtract(data);
        const extractedMobile = String(imported.mobile || data.intake?.mobile || "")
          .replace(/\D/g, "")
          .slice(-10);
        const extractedEmail = String(imported.email || data.intake?.email || "").trim();
        const mobile = digits.length === 10 ? digits : extractedMobile;
        const email = emailTrimmed || extractedEmail;
        const selected = match || null;
        const dupes = selected
          ? []
          : findDuplicatesByMobileOrEmail({ mobile, email });
        const prospect = selected || dupes[0] || null;
        emitFill(data, prospect, { mobile, email, file: next });
      } catch {
        setError("Could not read this file. Try a PDF with selectable text.");
      } finally {
        setParsing(false);
      }
    }, 250);
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload Biodata"
      subtitle="Search an existing client to update, or upload a new biodata to create a profile."
      icon={<FileText size={18} />}
      iconBg="#E7F8EF"
      iconColor="#16A34A"
      width="max-w-xl"
      zClass="z-[70]"
    >
      <div className="relative flex flex-col gap-5">
        <div className="relative z-20 rounded-2xl border border-black/10 bg-[#FAFAFB] px-4 py-4">
          <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wide">
            1. Search existing client (optional)
          </p>
          <div className="relative mt-3">
            <SearchField
              value={query}
              onChange={(value) => {
                setQuery(value);
                setMatch(null);
                setError("");
              }}
              placeholder="Name, mobile, or email"
              className="w-full"
            />
            {listOpen && results.length > 0 ? (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 rounded-xl border border-black/10 bg-white shadow-[0_12px_32px_rgba(0,0,0,0.12)] overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  {results.slice(0, 12).map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => {
                        setMatch(row);
                        setQuery(row.name || query);
                        setError("");
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-[#FCF5F6] border-b border-black/5 last:border-b-0"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-[13px] font-semibold text-[#111] truncate">{row.name || "Unnamed"}</p>
                        <span className="text-[11px] font-semibold text-[#7A0A17] shrink-0 tabular-nums">
                          {formatDisplayId(row)}
                        </span>
                      </div>
                      <ContactMeta row={row} compact />
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {match ? (
            <div className="flex items-start gap-2.5 mt-3 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] px-3 py-2.5">
              <CheckCircle2 size={16} className="text-[#16A34A] mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[13px] font-semibold text-[#166534] truncate">{match.name}</p>
                  <span className="text-[11px] font-semibold text-[#166534] shrink-0 tabular-nums">
                    {formatDisplayId(match)}
                  </span>
                </div>
                <ContactMeta row={match} />
              </div>
            </div>
          ) : (
            <p className="text-[12.5px] text-[#9CA3AF] mt-3">
              {listOpen && results.length === 0
                ? "No existing client for this search. Upload the biodata to create a new profile."
                : listOpen && results.length > 0
                  ? "Select a client to update, or skip selection and upload to create a new profile."
                  : "Type a name, mobile, or email to update someone, or upload a new biodata."}
            </p>
          )}
        </div>

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
                {file ? file.name : "2. Drop biodata PDF here"}
              </p>
              <p className="text-[12px] text-[#9CA3AF] mt-1">PDF, DOC, DOCX, or scanned image (JPG / PNG)</p>
              <button
                type="button"
                onClick={() => {
                  fileRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors mt-4"
              >
                Select file
              </button>
            </>
          )}
        </div>

        <p className="text-[12.5px] font-semibold text-[#E8395B] min-h-[18px] -mt-2">{error || "\u00a0"}</p>
      </div>
    </Modal>
  );
}
