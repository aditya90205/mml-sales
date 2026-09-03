import { Check } from "lucide-react";
import StatusPill from "../../../components/pipeline/StatusPill";

const DOCUMENTS = [
  { label: "Aadhaar card — client",    note: "Uploaded 29 Jun · auto-verified via KYC API",             done: true,  status: "Verified",    tone: "green" },
  { label: "PAN card — client",        note: "Uploaded 29 Jun · auto-verified via KYC API",             done: true,  status: "Verified",    tone: "green" },
  { label: "Parent Aadhaar & PAN",     note: "Father received. Mother's PAN outstanding.",              done: false, status: "Partial",     tone: "amber" },
  { label: "Police verification",      note: "Third-party request raised 24 Jul",                       done: false, status: "In Progress", tone: "blue" },
  { label: "House / GPS photo",        note: "Captured at home visit, 02 Jul",                          done: true,  status: "Verified",    tone: "green" },
  { label: "Selfie with client",       note: "Captured at home visit, 02 Jul",                          done: true,  status: "Verified",    tone: "green" },
  { label: "Handwritten contract — OCR", note: "Scan uploaded. Extraction queued for RM validation.",   done: false, status: "Pending",     tone: "gray" },
];

/** Documents & KYC tab — per-document verification checklist. */
export default function DocumentsKycTab() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <h3 className="text-[14px] font-bold text-[#111]">Documents &amp; KYC</h3>
      <p className="text-[12px] text-[#9CA3AF] mt-0.5 mb-4">Aadhaar and PAN auto-verify via KYC API</p>

      <div className="flex flex-col divide-y divide-black/5">
        {DOCUMENTS.map((doc) => (
          <div key={doc.label} className="flex items-center gap-3 py-3.5 flex-wrap sm:flex-nowrap">
            <span
              className={`size-[18px] rounded-full grid place-items-center shrink-0 ${
                doc.done ? "bg-[#16A34A]" : "bg-white border border-black/15"
              }`}
            >
              {doc.done && <Check size={12} className="text-white" strokeWidth={3} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#111]">{doc.label}</p>
              <p className="text-[11.5px] text-[#9CA3AF] mt-0.5">{doc.note}</p>
            </div>
            <StatusPill tone={doc.tone}>{doc.status}</StatusPill>
          </div>
        ))}
      </div>
    </div>
  );
}
