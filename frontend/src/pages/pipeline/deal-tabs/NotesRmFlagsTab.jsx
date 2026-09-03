import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import StatusPill from "../../../components/common/StatusPill";
import TabHeaderButton from "../../../components/pipeline/TabHeaderButton";
import Modal from "../../../components/ui/Modal";

const INITIAL_NOTES = [
  {
    title: "Family dynamics",
    note: "Father is the decision maker and the payer. Client defers on budget but is firm on profession fit.",
    tag: "RM note", tone: "blue",
  },
  {
    title: "Preference mismatch",
    note: "Client wants a doctor in NCR, parents will consider Punjab. Flagged for the service team.",
    tag: "Flag", tone: "amber",
  },
  {
    title: "High-demand criteria",
    note: "Clinical specialisation requested is thin in the paid database. Cross-branch search likely.",
    tag: "Flag", tone: "amber", alert: true,
  },
  {
    title: "Photography coaching",
    note: "Current photos are poor quality. Reshoot suggested before profiles go out.",
    tag: "RM note", tone: "blue",
  },
  {
    title: "Counselling",
    note: "Parent questionnaire completed 14 Jul. Candidate questionnaire still pending.",
    tag: "RM note", tone: "blue",
  },
];

const FIELD =
  "w-full border border-black/12 rounded-xl px-3.5 py-2.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]";

/** Notes & RM Flags tab — qualitative context that carries into service handover. */
export default function NotesRmFlagsTab() {
  const [notes, setNotes] = useState(INITIAL_NOTES);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState("RM note");

  const reset = () => {
    setTitle("");
    setBody("");
    setKind("RM note");
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Please add a title and note.");
      return;
    }
    const isFlag = kind === "Flag";
    setNotes((prev) => [
      {
        title: title.trim(),
        note: body.trim(),
        tag: kind,
        tone: isFlag ? "amber" : "blue",
        alert: isFlag,
      },
      ...prev,
    ]);
    toast.success("Note added.");
    reset();
    setOpen(false);
  };

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold text-[#111]">Notes &amp; RM Flags</h3>
          <p className="text-[12px] text-[#9CA3AF] mt-0.5">Qualitative context that carries into service</p>
        </div>
        <TabHeaderButton onClick={() => setOpen(true)}>Add note</TabHeaderButton>
      </div>

      <div className="flex flex-col divide-y divide-black/5">
        {notes.map((n, i) => (
          <div key={`${n.title}-${i}`} className="flex items-start gap-3 py-3.5 flex-wrap sm:flex-nowrap">
            <span
              className={`size-[18px] rounded-full grid place-items-center shrink-0 mt-0.5 ${
                n.alert ? "bg-[#E8395B]" : "bg-white border border-black/15"
              }`}
            >
              {n.alert && <AlertTriangle size={11} className="text-white" strokeWidth={2.5} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#111]">{n.title}</p>
              <p className="text-[11.5px] text-[#9CA3AF] mt-0.5 leading-relaxed">{n.note}</p>
            </div>
            <StatusPill tone={n.tone}>{n.tag}</StatusPill>
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => { reset(); setOpen(false); }}
        title="Add note"
        subtitle="Visible to the RM and service team"
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
              form="add-note-form"
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Save note
            </button>
          </>
        }
      >
        <form id="add-note-form" onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Family dynamics" className={FIELD} />
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Type</label>
            <select value={kind} onChange={(e) => setKind(e.target.value)} className={FIELD}>
              <option>RM note</option>
              <option>Flag</option>
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Note</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Write the note…"
              className={`${FIELD} resize-none`}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
