import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, CloudUpload, FileText, Loader2, Search } from "lucide-react";
import Modal from "../ui/Modal.jsx";
import {
  findDuplicatesByMobileOrEmail,
  formatDisplayMobile,
} from "../../utils/contactSearch.js";
import { extractBiodata } from "../../utils/biodataExtract.js";
import {
  classifyLeadFields,
  contactToLeadFields,
  formToLeadFields,
  hasValidMobileOrEmail,
  isValidEmail,
} from "../../utils/leadFields.js";

const CONTACT_UPLOAD_ERROR = "Enter at least one valid mobile or email, then upload the biodata.";

const ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.webp,.tif,.tiff";
const INPUT =
  "w-full h-10 px-3.5 rounded-xl bg-white border border-black/12 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/45 transition-colors";

function importedFromExtract(data) {
  const values = {};
  for (const f of data?.fields || []) values[f.key] = f.value ?? "";
  return values;
}

function seedFieldValues(imported, existing) {
  const values = { ...existing };
  for (const [key, value] of Object.entries(imported || {})) {
    if (String(value || "").trim()) values[key] = value;
  }
  return values;
}

export default function BiodataUploadModal({ open, onClose, onFillForm, compareWith = null }) {
  const fileRef = useRef(null);
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [match, setMatch] = useState(null);
  const [searched, setSearched] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setMobile("");
    setEmail("");
    setMatch(null);
    setSearched(false);
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
    if (snap.mobile) setMobile(String(snap.mobile).replace(/\D/g, "").slice(-10));
    if (snap.email) setEmail(String(snap.email).trim());
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const digits = useMemo(() => String(mobile || "").replace(/\D/g, "").slice(-10), [mobile]);
  const emailTrimmed = String(email || "").trim();
  const canSearch = digits.length === 10 || Boolean(emailTrimmed);
  const canUpload = digits.length === 10 || isValidEmail(emailTrimmed);

  const contactUploadError = () => {
    if (digits.length && digits.length !== 10) return "Enter a valid 10-digit mobile, or a valid email.";
    if (emailTrimmed && !isValidEmail(emailTrimmed)) return "Enter a valid email, or a 10-digit mobile.";
    return CONTACT_UPLOAD_ERROR;
  };

  const runSearch = (nextMobile = mobile, nextEmail = email) => {
    const hits = findDuplicatesByMobileOrEmail({
      mobile: String(nextMobile || "").replace(/\D/g, "").slice(-10),
      email: String(nextEmail || "").trim(),
    });
    setMatch(hits[0] || null);
    setSearched(true);
    setError("");
    return hits[0] || null;
  };

  const emitFill = (data, prospect) => {
    const imported = importedFromExtract(data);
    if (digits) imported.mobile = digits;
    if (emailTrimmed) imported.email = emailTrimmed;
    if (!imported.lookingFor && data.intake?.lookingFor) imported.lookingFor = data.intake.lookingFor;
    if (!imported.city && data.intake?.addrCity) imported.city = data.intake.addrCity;
    if (!imported.area && data.intake?.addrAreaLocality) imported.area = data.intake.addrAreaLocality;
    if (!imported.relation && data.intake?.enquiryBy) imported.relation = data.intake.enquiryBy;
    if (!imported.relation) imported.relation = "Self / Prospect";

    const crmExisting = prospect ? contactToLeadFields(prospect) : {};
    const formExisting = formToLeadFields(compareWith);
    const existing = { ...formExisting, ...crmExisting };
    const values = seedFieldValues(imported, existing);
    const nextStatuses = classifyLeadFields(imported, crmExisting);

    onFillForm?.({
      fileName: data.fileName,
      fields: values,
      importedFields: imported,
      alsoRead: data.alsoRead,
      intake: data.intake || {},
      match: prospect || null,
      senderMatch: null,
      matchKind: prospect ? "prospect" : "none",
      manualMode: !prospect,
      resolution: prospect ? "same" : "new",
      senderMobile: digits,
      senderEmail: emailTrimmed,
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
    if (!canUpload) {
      setError(contactUploadError());
      return;
    }
    setFile(next);
    setParsing(true);
    setError("");
    window.setTimeout(async () => {
      try {
        const prospect = searched ? match : runSearch();
        const data = await extractBiodata(next);
        const imported = importedFromExtract(data);
        const profileContact = {
          mobile: digits || imported.mobile || data.intake?.mobile || "",
          email: emailTrimmed || imported.email || data.intake?.email || "",
        };
        if (!hasValidMobileOrEmail(profileContact)) {
          setError("This profile needs at least one valid mobile or email.");
          setParsing(false);
          return;
        }
        emitFill(data, prospect);
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
      subtitle="Enter at least one of mobile or email, then upload."
      icon={<FileText size={18} />}
      iconBg="#E7F8EF"
      iconColor="#16A34A"
      width="max-w-xl"
      zClass="z-[70]"
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-black/10 bg-[#FAFAFB] px-4 py-4">
          <p className="text-[12px] font-semibold text-[#6B7280] uppercase tracking-wide">
            1. Mobile or email (at least one)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-[12.5px] font-semibold text-[#111]">
                Mobile{!isValidEmail(emailTrimmed) ? " *" : ""}
              </label>
              <input
                value={mobile}
                onChange={(e) => {
                  setMobile(e.target.value.replace(/[^\d]/g, "").slice(0, 10));
                  setSearched(false);
                  setMatch(null);
                  setError("");
                }}
                className={`${INPUT} mt-1`}
                placeholder="9876543210"
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="text-[12.5px] font-semibold text-[#111]">
                Email{digits.length !== 10 ? " *" : ""}
              </label>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSearched(false);
                  setMatch(null);
                  setError("");
                }}
                className={`${INPUT} mt-1`}
                placeholder="name@email.com"
                type="email"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!canSearch) {
                setError("Enter mobile or email to search.");
                return;
              }
              if (digits.length && digits.length !== 10) {
                setError("Enter a valid 10-digit mobile, or search by email.");
                return;
              }
              if (emailTrimmed && !isValidEmail(emailTrimmed)) {
                setError("Enter a valid email, or search by mobile.");
                return;
              }
              runSearch();
            }}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-black/12 text-[13px] font-semibold text-[#374151] hover:bg-white mt-3"
          >
            <Search size={14} />
            Search existing client
          </button>

          {searched ? (
            match ? (
              <div className="flex items-start gap-2 mt-3 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] px-3 py-2.5">
                <CheckCircle2 size={16} className="text-[#16A34A] mt-0.5 shrink-0" />
                <p className="text-[13px] text-[#166534]">
                  Already in the system: <span className="font-semibold">{match.name}</span>
                  {match.mobile ? ` · ${formatDisplayMobile(match.mobile)}` : ""}
                  {match.email ? ` · ${match.email}` : ""}. Extra biodata will go to this client&apos;s Profile (P2).
                </p>
              </div>
            ) : (
              <p className="text-[13px] text-[#6B7280] mt-3">
                No existing client for this number / email. We will create a new lead after upload.
              </p>
            )
          ) : (
            <p className="text-[12.5px] text-[#9CA3AF] mt-3">
              Search first so we know if this person is already a client. At least one of mobile or email is required to upload.
            </p>
          )}
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (canUpload) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            takeFile(e.dataTransfer.files?.[0]);
          }}
          className={`rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragging ? "border-[#7A0A17] bg-[#FCF5F6]" : "border-black/12 bg-[#FAFAFB]"
          } ${!canUpload ? "opacity-70" : ""}`}
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
                  if (!canUpload) {
                    setError(contactUploadError());
                    return;
                  }
                  fileRef.current?.click();
                }}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors mt-4"
              >
                Select file
              </button>
              {/* <p className="text-[11.5px] text-[#9CA3AF] mt-3">
                Create Lead gets name, city, and contact. Extra details save in Sales Pipeline → Profile Create (P2).
              </p> */}
            </>
          )}
        </div>

        {error ? <p className="text-[12.5px] font-semibold text-[#E8395B] -mt-2">{error}</p> : null}
      </div>
    </Modal>
  );
}
