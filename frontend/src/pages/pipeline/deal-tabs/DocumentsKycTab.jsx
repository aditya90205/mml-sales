import { useRef, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import ChecklistCheck from "../../../components/common/ChecklistCheck";
import Modal from "../../../components/ui/Modal";

const INITIAL_DOCUMENTS = [
  { id: "doc-1", label: "Aadhaar card — client", fileName: "", done: false, mandatory: true },
  { id: "doc-2", label: "PAN card — client", fileName: "", done: false, mandatory: true },
  { id: "doc-3", label: "Parent Aadhaar & PAN", fileName: "", done: false, mandatory: false },
  { id: "doc-4", label: "Police verification", fileName: "", done: false, mandatory: false },
  { id: "doc-5", label: "House / GPS photo", fileName: "", done: false, mandatory: false },
  { id: "doc-6", label: "Selfie with client", fileName: "", done: false, mandatory: false },
  { id: "doc-7", label: "Handwritten contract — OCR", fileName: "", done: false, mandatory: false },
];

const FIELD =
  "w-full border border-black/12 rounded-xl px-3.5 py-2.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]";

const ACTION_BTN =
  "inline-flex items-center justify-center h-9 px-3.5 rounded-lg bg-white border border-black/15 text-[12.5px] font-semibold text-[#111] hover:bg-[#FAFAFB] transition-colors shrink-0";

const ICON_BTN =
  "inline-flex items-center justify-center size-9 rounded-lg border border-black/10 text-[#6B7280] hover:bg-[#FAFAFB] hover:text-[#111] transition-colors shrink-0";

function MandatoryToggle({ checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-black/10 bg-[#FAFAFB] px-3.5 py-3">
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-[#111]">Mandatory field</p>
        <p className="text-[11.5px] text-[#9CA3AF] mt-0.5">Show a red * next to this document name</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${
          checked ? "bg-[#7A0A17]" : "bg-[#D1D5DB]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

/** Documents & KYC — used as a tab or embedded inside a modal. */
export default function DocumentsKycTab({ empty = false, embedded = false }) {
  const fileInputRef = useRef(null);
  const [docs, setDocs] = useState(INITIAL_DOCUMENTS);
  const [uploadForId, setUploadForId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nameDraft, setNameDraft] = useState("");
  const [mandatoryDraft, setMandatoryDraft] = useState(false);

  const visibleDocs = empty
    ? docs.map((d) => ({ ...d, label: d.label, fileName: "", done: false }))
    : docs;

  const resetDraft = () => {
    setNameDraft("");
    setMandatoryDraft(false);
    setEditId(null);
  };

  const toggleDoc = (id) => {
    setDocs((prev) => prev.map((doc) => (doc.id === id ? { ...doc, done: !doc.done } : doc)));
  };

  const openAddRow = () => {
    resetDraft();
    setAddOpen(true);
  };

  const saveAddRow = (e) => {
    e.preventDefault();
    if (!nameDraft.trim()) {
      toast.error("Please enter a document name.");
      return;
    }
    setDocs((prev) => [
      ...prev,
      {
        id: `doc-${Date.now()}`,
        label: nameDraft.trim(),
        fileName: "",
        done: false,
        mandatory: mandatoryDraft,
      },
    ]);
    toast.success("Document row added.");
    setAddOpen(false);
    resetDraft();
  };

  const openEdit = (doc) => {
    setEditId(doc.id);
    setNameDraft(doc.label);
    setMandatoryDraft(Boolean(doc.mandatory));
    setEditOpen(true);
  };

  const saveEdit = (e) => {
    e.preventDefault();
    if (!nameDraft.trim()) {
      toast.error("Please enter a document name.");
      return;
    }
    setDocs((prev) =>
      prev.map((doc) =>
        doc.id === editId
          ? { ...doc, label: nameDraft.trim(), mandatory: mandatoryDraft }
          : doc
      )
    );
    toast.success("Document updated.");
    setEditOpen(false);
    resetDraft();
  };

  const deleteDoc = (id) => {
    setDocs((prev) => prev.filter((doc) => doc.id !== id));
    toast.success("Document removed.");
  };

  const startUpload = (id) => {
    setUploadForId(id);
    fileInputRef.current?.click();
  };

  const handleFileChosen = (e) => {
    const file = e.target.files?.[0];
    const targetId = uploadForId;
    e.target.value = "";
    setUploadForId(null);
    if (!file || !targetId) return;
    setDocs((prev) =>
      prev.map((doc) =>
        doc.id === targetId
          ? { ...doc, fileName: file.name, done: true }
          : doc
      )
    );
    toast.success(`Attached ${file.name}`);
  };

  const body = (
    <>
      {!embedded && (
        <div className="mb-4">
          <h3 className="text-[14px] font-bold text-[#111]">Documents &amp; KYC</h3>
          <p className="text-[12px] text-[#9CA3AF] mt-0.5">Aadhaar and PAN auto-verify via KYC API</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        className="hidden"
        onChange={handleFileChosen}
      />

      <div className="flex flex-col">
        {visibleDocs.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 py-3 border-b border-black/6 last:border-b-0 flex-wrap sm:flex-nowrap"
          >
            <ChecklistCheck done={doc.done} onClick={() => toggleDoc(doc.id)} label={doc.label} />
            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-semibold text-[#111]">
                {doc.label}
                {doc.mandatory ? <span className="text-[#E8395B]"> *</span> : null}
              </p>
              {doc.fileName ? (
                <p className="text-[11.5px] text-[#16A34A] mt-0.5 truncate">{doc.fileName}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-auto">
              <button type="button" onClick={() => openEdit(doc)} className={ICON_BTN} title="Edit" aria-label="Edit">
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => deleteDoc(doc.id)}
                className={`${ICON_BTN} hover:text-[#DC2626] hover:border-[#FECACA]`}
                title="Delete"
                aria-label="Delete"
              >
                <Trash2 size={14} />
              </button>
              <button type="button" onClick={() => startUpload(doc.id)} className={ACTION_BTN}>
                Attach &amp; Upload
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={openAddRow}
        className="mt-4 inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/12 text-[13px] font-semibold text-[#111] hover:bg-[#FAFAFB] transition-colors"
      >
        <Plus size={15} />
        Add Row
      </button>

      <Modal
        open={addOpen}
        onClose={() => { setAddOpen(false); resetDraft(); }}
        title="Add document"
        subtitle="Enter a name for the new document row"
        width="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => { setAddOpen(false); resetDraft(); }}
              className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-doc-row-form"
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Add
            </button>
          </>
        }
      >
        <form id="add-doc-row-form" onSubmit={saveAddRow} className="flex flex-col gap-4">
          <label className="block text-[13px] font-bold text-[#111]">
            Document name
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="e.g. Marriage certificate"
              className={`${FIELD} mt-1.5`}
            />
          </label>
          <MandatoryToggle checked={mandatoryDraft} onChange={setMandatoryDraft} />
        </form>
      </Modal>

      <Modal
        open={editOpen}
        onClose={() => { setEditOpen(false); resetDraft(); }}
        title="Edit document"
        subtitle="Update the document name"
        width="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => { setEditOpen(false); resetDraft(); }}
              className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-doc-row-form"
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Save
            </button>
          </>
        }
      >
        <form id="edit-doc-row-form" onSubmit={saveEdit} className="flex flex-col gap-4">
          <label className="block text-[13px] font-bold text-[#111]">
            Document name
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              className={`${FIELD} mt-1.5`}
            />
          </label>
          <MandatoryToggle checked={mandatoryDraft} onChange={setMandatoryDraft} />
        </form>
      </Modal>
    </>
  );

  if (embedded) return <div className="min-w-0">{body}</div>;

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      {body}
    </div>
  );
}
