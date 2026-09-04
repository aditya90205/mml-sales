import { useRef, useState } from "react";
import { toast } from "react-toastify";
import ChecklistCheck from "../../../components/common/ChecklistCheck";
import StatusPill from "../../../components/common/StatusPill";
import TabHeaderButton from "../../../components/pipeline/TabHeaderButton";
import Modal from "../../../components/ui/Modal";
import { dashRows, EMPTY } from "./stageContent.jsx";

const INITIAL_DOCUMENTS = [
  { label: "Aadhaar card — client",    note: "Uploaded 29 Jun · auto-verified via KYC API",             done: true,  status: "Verified",    tone: "green" },
  { label: "PAN card — client",        note: "Uploaded 29 Jun · auto-verified via KYC API",             done: true,  status: "Verified",    tone: "green" },
  { label: "Parent Aadhaar & PAN",     note: "Father received. Mother's PAN outstanding.",              done: false, status: "Partial",     tone: "amber" },
  { label: "Police verification",      note: "Third-party request raised 24 Jul",                       done: false, status: "In Progress", tone: "blue" },
  { label: "House / GPS photo",        note: "Captured at home visit, 02 Jul",                          done: true,  status: "Verified",    tone: "green" },
  { label: "Selfie with client",       note: "Captured at home visit, 02 Jul",                          done: true,  status: "Verified",    tone: "green" },
  { label: "Handwritten contract — OCR", note: "Scan uploaded. Extraction queued for RM validation.",   done: false, status: "Pending",     tone: "gray" },
];

const FIELD =
  "w-full border border-black/12 rounded-xl px-3.5 py-2.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]";

/** Documents & KYC tab — per-document verification checklist. */
export default function DocumentsKycTab({ empty = false }) {
  const fileRef = useRef(null);
  const [docs, setDocs] = useState(INITIAL_DOCUMENTS);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [file, setFile] = useState(null);

  const reset = () => {
    setLabel("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!label.trim() || !file) {
      toast.error("Please add a document name and file.");
      return;
    }
    setDocs((prev) => [
      {
        label: label.trim(),
        note: `Uploaded just now · ${file.name}`,
        done: false,
        status: "Pending",
        tone: "gray",
      },
      ...prev,
    ]);
    toast.success("Document uploaded.");
    reset();
    setOpen(false);
  };

  const toggleDoc = (index) => {
    setDocs((prev) =>
      prev.map((doc, i) => {
        if (i !== index) return doc;
        const done = !doc.done;
        return { ...doc, done, status: done ? "Verified" : "Pending", tone: done ? "green" : "gray" };
      })
    );
  };

  const visibleDocs = dashRows(docs, empty, ["label"]);

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold text-[#111]">Documents &amp; KYC</h3>
          <p className="text-[12px] text-[#9CA3AF] mt-0.5">Aadhaar and PAN auto-verify via KYC API</p>
        </div>
        <TabHeaderButton onClick={() => setOpen(true)}>Upload document</TabHeaderButton>
      </div>

      <div className="flex flex-col divide-y divide-black/5">
        {visibleDocs.map((doc, i) => (
          <div key={`${doc.label}-${i}`} className="flex items-center gap-3 py-3.5 flex-wrap sm:flex-nowrap">
            <ChecklistCheck done={doc.done} onClick={() => toggleDoc(i)} label={doc.label} />
            <button type="button" onClick={() => toggleDoc(i)} className="min-w-0 flex-1 text-left">
              <p className="text-[13px] font-semibold text-[#111]">{doc.label}</p>
              <p className="text-[11.5px] text-[#9CA3AF] mt-0.5">{doc.note}</p>
            </button>
            <button type="button" onClick={() => toggleDoc(i)}>
              {doc.status === EMPTY ? (
                <span className="text-[12px] text-[#9CA3AF]">-</span>
              ) : (
                <StatusPill tone={doc.tone}>{doc.status}</StatusPill>
              )}
            </button>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => { reset(); setOpen(false); }}
        title="Upload document"
        subtitle="KYC files are auto-verified where possible"
        footer={
          <>
            <button
              type="button"
              onClick={() => { reset(); setOpen(false); }}
              className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="upload-doc-form"
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Upload
            </button>
          </>
        }
      >
        <form id="upload-doc-form" onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Document name</label>
            <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Aadhaar card — parent" className={FIELD} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">File</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={file?.name || ""}
                placeholder="PDF, JPG or PNG"
                className={`${FIELD} bg-white`}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="shrink-0 h-11 px-4 rounded-xl bg-white border border-black/12 text-[13px] font-semibold text-[#111] hover:bg-[#FAFAFB] transition-colors"
              >
                Browse
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
