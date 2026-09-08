import { useRef, useState } from "react";
import {
  BarChart3,
  Calendar,
  FileText,
  Info,
  Mail,
  MessageSquare,
  Reply,
  User,
} from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";
import SendEmailModal from "../common/SendEmailModal.jsx";
import SendMessageModal from "../common/SendMessageModal.jsx";
import { USER } from "../layout/TopBar";

const INPUT =
  "w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] outline-none focus:border-[#7A0A17]/40 bg-white placeholder:text-[#9CA3AF]";

const DEMO_TERMINATION = {
  employeeName: USER.name || "Rahul Sharma",
  initials: (USER.name || "RS")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(),
  status: "Planned",
  terminationType: "Retirement",
  noticePeriod: "Immediate",
  noticeDate: "11-02-2026",
  terminationDate: "11-02-2026",
  reason: "Department Closure",
  description:
    "Employee's department was closed due to strategic business decisions and operational changes.",
  documents: [],
};

const SELF_EMPLOYEE = USER.name || "Ankur Sharma";

const ACTION_BTN =
  "inline-flex items-center gap-2 h-9 px-3.5 rounded-xl bg-white border border-black/10 text-[12.5px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors";

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[13px] font-bold text-[#111] mb-1.5">
      {children}
      {required ? <span className="text-[#E8395B]"> *</span> : null}
    </label>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <span className="size-9 rounded-xl bg-[#F3F4F6] text-[#6B7280] grid place-items-center shrink-0">
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
        <p className="text-[14px] font-bold text-[#111] mt-1 break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

function StatusBadge({ label }) {
  const styles = {
    Planned: "bg-[#FEF3C7] text-[#D97706] border-[#D97706]/20",
    Submitted: "bg-[#EEF0FE] text-[#6366F1] border-[#6366F1]/20",
    Approved: "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/20",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${
        styles[label] || "bg-[#F3F4F6] text-[#4B5563] border-black/10"
      }`}
    >
      {label}
    </span>
  );
}

function emptyResignationForm() {
  return {
    employee: SELF_EMPLOYEE,
    resignationDate: "",
    reason: "",
    description: "",
    documentName: "",
  };
}

/**
 * Exit tab — demo flow for Termination (read-only record) + Resignation (submit form).
 * Both can appear together for client walkthrough only.
 */
export default function ExitTab() {
  const fileInputRef = useRef(null);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageTitle, setMessageTitle] = useState("Send Message");
  const [emailOpen, setEmailOpen] = useState(false);
  const [resignOpen, setResignOpen] = useState(false);
  const [form, setForm] = useState(emptyResignationForm);
  const [resignation, setResignation] = useState(null);

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const openMessage = (title) => {
    setMessageTitle(title);
    setMessageOpen(true);
  };

  const handleBrowse = () => fileInputRef.current?.click();

  const handleFileChosen = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, documentName: file.name }));
    e.target.value = "";
  };

  const closeResign = () => {
    setResignOpen(false);
    setForm(emptyResignationForm());
  };

  const handleSaveResignation = (e) => {
    e.preventDefault();
    if (!form.resignationDate) {
      toast.error("Please select a resignation date.");
      return;
    }
    if (!form.reason.trim()) {
      toast.error("Please enter a reason.");
      return;
    }

    const saved = {
      ...form,
      status: "Submitted",
      submittedAt: new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setResignation(saved);
    toast.success("Resignation submitted successfully.");
    closeResign();
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-[18px] font-extrabold text-[#111827]">Exit</h2>
          <p className="text-[13px] text-[#6B7280] mt-1">
            Termination record and resignation request — shown together for demo walkthrough.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setResignOpen(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors shrink-0"
        >
          Resignation
        </button>
      </div>

      {/* Termination details */}
      <section className="bg-white border border-black/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/8 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <span className="size-9 rounded-xl bg-[#E7F8EF] text-[#16A34A] grid place-items-center shrink-0">
              <BarChart3 size={16} />
            </span>
            <div className="min-w-0">
              <h3 className="text-[15px] font-extrabold text-[#111827]">Termination Details</h3>
              <p className="text-[12px] text-[#9CA3AF]">Official termination record for this employee</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={() => openMessage("Reply to Termination")}
              className={ACTION_BTN}
            >
              <Reply size={14} className="text-[#7A0A17]" />
              Reply
            </button>
            <button
              type="button"
              onClick={() => openMessage("Termination Conversation")}
              className={ACTION_BTN}
              aria-label="Open conversation about termination"
            >
              <MessageSquare size={14} className="text-[#7A0A17]" />
              Conversation
            </button>
          </div>
        </div>

        <div className="p-5 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <span className="size-12 rounded-full bg-[#7A0A17] text-white grid place-items-center text-[14px] font-bold shrink-0">
                {DEMO_TERMINATION.initials}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-[#9CA3AF]">Employee</p>
                <p className="text-[15px] font-extrabold text-[#111]">{DEMO_TERMINATION.employeeName}</p>
              </div>
            </div>
            <StatusBadge label={DEMO_TERMINATION.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
            <DetailItem icon={Info} label="Termination Type" value={DEMO_TERMINATION.terminationType} />
            <DetailItem icon={FileText} label="Notice Period" value={DEMO_TERMINATION.noticePeriod} />
            <DetailItem icon={Calendar} label="Notice Date" value={DEMO_TERMINATION.noticeDate} />
            <DetailItem icon={Calendar} label="Termination Date" value={DEMO_TERMINATION.terminationDate} />
          </div>

          <div>
            <p className="text-[12px] font-semibold text-[#9CA3AF] mb-2">Documents</p>
            <div className="min-h-[120px] rounded-xl bg-[#F3F4F6] border border-black/6 grid place-items-center px-4">
              {DEMO_TERMINATION.documents.length ? (
                <ul className="text-[13px] font-medium text-[#374151]">
                  {DEMO_TERMINATION.documents.map((doc) => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-[#9CA3AF]">No documents attached</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-start gap-2.5">
              <FileText size={14} className="text-[#9CA3AF] mt-1 shrink-0" />
              <div>
                <p className="text-[12px] font-semibold text-[#9CA3AF]">Reason</p>
                <p className="text-[14px] font-bold text-[#111] mt-0.5">{DEMO_TERMINATION.reason}</p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <FileText size={14} className="text-[#9CA3AF] mt-1 shrink-0" />
              <div>
                <p className="text-[12px] font-semibold text-[#9CA3AF]">Description</p>
                <p className="text-[13px] font-medium text-[#374151] mt-0.5 leading-relaxed">
                  {DEMO_TERMINATION.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resignation record after submit */}
      {resignation && (
        <section className="bg-white border border-black/10 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/8 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <span className="size-9 rounded-xl bg-[#EEF0FE] text-[#6366F1] grid place-items-center shrink-0">
                <User size={16} />
              </span>
              <div className="min-w-0">
                <h3 className="text-[15px] font-extrabold text-[#111827]">Resignation Details</h3>
                <p className="text-[12px] text-[#9CA3AF]">Submitted {resignation.submittedAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <StatusBadge label={resignation.status} />
              <button type="button" onClick={() => setEmailOpen(true)} className={ACTION_BTN}>
                <Mail size={14} className="text-[#2563EB]" />
                Email
              </button>
              <button
                type="button"
                onClick={() => openMessage("Resignation Follow-up Message")}
                className={ACTION_BTN}
              >
                <MessageSquare size={14} className="text-[#F59E0B]" />
                Message
              </button>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              <DetailItem icon={User} label="Employee" value={resignation.employee} />
              <DetailItem icon={Calendar} label="Resignation Date" value={resignation.resignationDate} />
              <DetailItem icon={FileText} label="Reason" value={resignation.reason} />
              <DetailItem
                icon={FileText}
                label="Documents"
                value={resignation.documentName || "No document attached"}
              />
            </div>
            {resignation.description ? (
              <div className="flex items-start gap-2.5">
                <FileText size={14} className="text-[#9CA3AF] mt-1 shrink-0" />
                <div>
                  <p className="text-[12px] font-semibold text-[#9CA3AF]">Description</p>
                  <p className="text-[13px] font-medium text-[#374151] mt-0.5 leading-relaxed">
                    {resignation.description}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* Add New Resignation modal */}
      <Modal
        open={resignOpen}
        onClose={closeResign}
        title="Add New Resignation"
        subtitle="Submit a resignation request for demo walkthrough"
        width="max-w-lg"
        footer={
          <>
            <button
              type="button"
              onClick={closeResign}
              className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="add-resignation-form"
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Save
            </button>
          </>
        }
      >
        <form id="add-resignation-form" onSubmit={handleSaveResignation} className="flex flex-col gap-4">
          <div>
            <FieldLabel required>Employee</FieldLabel>
            <input
              type="text"
              value={form.employee}
              readOnly
              className={`${INPUT} bg-[#F9FAFB] text-[#6B7280] cursor-not-allowed`}
            />
          </div>

          <div>
            <FieldLabel required>Resignation Date</FieldLabel>
            <input
              type="date"
              value={form.resignationDate}
              onChange={set("resignationDate")}
              className={INPUT}
              required
            />
          </div>

          <div>
            <FieldLabel required>Reason</FieldLabel>
            <input
              type="text"
              value={form.reason}
              onChange={set("reason")}
              placeholder="e.g. Personal reasons"
              className={INPUT}
              required
            />
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea
              rows={3}
              value={form.description}
              onChange={set("description")}
              placeholder="e.g. Additional details about resignation"
              className={`${INPUT} h-auto py-2.5 resize-none`}
            />
          </div>

          <div>
            <FieldLabel>Documents</FieldLabel>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChosen}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            />
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={form.documentName}
                placeholder="Select document file..."
                className={`${INPUT} flex-1`}
                onClick={handleBrowse}
              />
              <button
                type="button"
                onClick={handleBrowse}
                className="h-11 px-4 rounded-xl border border-black/12 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors shrink-0"
              >
                Browse
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Resignation follow-up email */}
      <SendEmailModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        recipientName={resignation?.employee || SELF_EMPLOYEE}
      />

      <SendMessageModal
        open={messageOpen}
        onClose={() => setMessageOpen(false)}
        title={messageTitle}
      />
    </div>
  );
}
