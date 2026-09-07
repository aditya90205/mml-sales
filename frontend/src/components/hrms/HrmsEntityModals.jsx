import { useEffect, useState } from "react";
import { AlertTriangle, Edit, Eye, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";

const FIELD =
  "w-full border border-black/15 rounded-xl px-3.5 py-2.5 text-[13px] text-[#111] outline-none focus:border-[#7A0A17] bg-white";

function Field({ label, children, full = false }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">{label}</span>
      {children}
    </label>
  );
}

function ReadValue({ children }) {
  return <div className="text-[13px] font-semibold text-[#111] leading-snug">{children || "—"}</div>;
}

function StatusBadge({ status }) {
  const tone =
    status === "Completed" || status === "Completed "
      ? "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/20"
      : status === "In Progress"
      ? "bg-[#E0F2FE] text-[#0284C7] border-[#0284C7]/20"
      : status === "Scheduled"
      ? "bg-[#E0F2FE] text-[#0284C7] border-[#0284C7]/20"
      : "bg-[#F3F4F6] text-[#4B5563] border-black/10";
  return (
    <span className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg border ${tone}`}>{status || "—"}</span>
  );
}

export function ConfirmDeleteModal({ open, onClose, onConfirm, entityLabel, itemName }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete confirmation"
      subtitle="This action cannot be undone."
      icon={<AlertTriangle size={17} />}
      iconBg="#FEE2E2"
      iconColor="#DC2626"
      width="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 px-4 rounded-xl bg-[#DC2626] text-white text-[13px] font-semibold hover:bg-[#B91C1C] transition-colors inline-flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </>
      }
    >
      <p className="text-[13px] text-[#374151] leading-relaxed">
        Are you sure you want to delete this {entityLabel}
        {itemName ? (
          <>
            {" "}
            <span className="font-bold text-[#111]">“{itemName}”</span>
          </>
        ) : null}
        ?
      </p>
    </Modal>
  );
}

export function TrainingViewModal({ open, onClose, training }) {
  if (!training) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Training details"
      subtitle={training.program}
      icon={<Eye size={17} />}
      iconBg="#FEF3C7"
      iconColor="#D97706"
      width="max-w-3xl"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
        >
          Close
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Program">
          <ReadValue>{training.program}</ReadValue>
        </Field>
        <Field label="Track / category">
          <ReadValue>{training.track}</ReadValue>
        </Field>
        <Field label="Date & time" full>
          <ReadValue>{training.dateTime}</ReadValue>
        </Field>
        <Field label="Location">
          <ReadValue>{training.location}</ReadValue>
        </Field>
        <Field label="Location type">
          <ReadValue>{training.locationType}</ReadValue>
        </Field>
        <Field label="Status">
          <StatusBadge status={training.status} />
        </Field>
        <Field label="Attendance">
          <ReadValue>{training.attendance ?? "—"}</ReadValue>
        </Field>
        <Field label="Score">
          <ReadValue>
            {training.status === "Completed" ? `${Number(training.score).toFixed(1)}%` : "—"}
          </ReadValue>
        </Field>
        <Field label="Result">
          <ReadValue>
            {training.status === "Completed" ? training.result || "—" : "—"}
          </ReadValue>
        </Field>
      </div>
    </Modal>
  );
}

export function TrainingEditModal({ open, onClose, training, onSave }) {
  const [draft, setDraft] = useState(training);

  useEffect(() => {
    if (open && training) setDraft({ ...training });
  }, [open, training]);

  if (!draft) return null;

  const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const score = Number(draft.score) || 0;
    const result =
      draft.status === "Completed" ? (score >= 50 ? "Passed" : "Fail") : null;
    onSave?.({
      ...draft,
      score,
      attendance: Number(draft.attendance) || 0,
      result,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit training"
      subtitle={training?.program}
      icon={<Edit size={17} />}
      iconBg="#E0F2FE"
      iconColor="#0284C7"
      width="max-w-3xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="training-edit-form"
            className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Save changes
          </button>
        </>
      }
    >
      <form id="training-edit-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Program">
          <input className={FIELD} value={draft.program} onChange={(e) => set("program", e.target.value)} required />
        </Field>
        <Field label="Track / category">
          <input className={FIELD} value={draft.track} onChange={(e) => set("track", e.target.value)} required />
        </Field>
        <Field label="Date & time" full>
          <input className={FIELD} value={draft.dateTime} onChange={(e) => set("dateTime", e.target.value)} required />
        </Field>
        <Field label="Location">
          <input className={FIELD} value={draft.location} onChange={(e) => set("location", e.target.value)} required />
        </Field>
        <Field label="Location type">
          <select className={FIELD} value={draft.locationType} onChange={(e) => set("locationType", e.target.value)}>
            <option>Physical</option>
            <option>Virtual</option>
          </select>
        </Field>
        <Field label="Status">
          <select className={FIELD} value={draft.status} onChange={(e) => set("status", e.target.value)}>
            <option>Scheduled</option>
            <option>Completed</option>
          </select>
        </Field>
        <Field label="Attendance">
          <input
            type="number"
            min="0"
            className={FIELD}
            value={draft.attendance}
            onChange={(e) => set("attendance", e.target.value)}
          />
        </Field>
        <Field label="Score (%)">
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            className={FIELD}
            value={draft.score}
            onChange={(e) => set("score", e.target.value)}
          />
        </Field>
      </form>
    </Modal>
  );
}

export function GoalViewModal({ open, onClose, goal }) {
  if (!goal) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Goal details"
      subtitle={goal.title}
      icon={<Eye size={17} />}
      iconBg="#FEF3C7"
      iconColor="#D97706"
      width="max-w-3xl"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
        >
          Close
        </button>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Title" full>
          <ReadValue>{goal.title}</ReadValue>
        </Field>
        <Field label="Employee">
          <ReadValue>{goal.employee}</ReadValue>
        </Field>
        <Field label="Goal type">
          <ReadValue>{goal.goalType}</ReadValue>
        </Field>
        <Field label="Start date">
          <ReadValue>{goal.startDate}</ReadValue>
        </Field>
        <Field label="End date">
          <ReadValue>{goal.endDate}</ReadValue>
        </Field>
        <Field label="Progress">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-28 rounded-full bg-[#EDEEF1] overflow-hidden">
              <div className="h-full rounded-full bg-[#16A34A]" style={{ width: `${goal.progress}%` }} />
            </div>
            <span className="text-[13px] font-bold text-[#111]">{goal.progress}%</span>
          </div>
        </Field>
        <Field label="Status">
          <StatusBadge status={goal.status} />
        </Field>
        <Field label="Remarks" full>
          <ReadValue>{goal.remarks}</ReadValue>
        </Field>
      </div>
    </Modal>
  );
}

export function GoalEditModal({ open, onClose, goal, onSave }) {
  const [draft, setDraft] = useState(goal);

  useEffect(() => {
    if (open && goal) setDraft({ ...goal });
  }, [open, goal]);

  if (!draft) return null;

  const set = (key, value) => setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({
      ...draft,
      progress: Math.min(100, Math.max(0, Number(draft.progress) || 0)),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit goal"
      subtitle={goal?.title}
      icon={<Edit size={17} />}
      iconBg="#E0F2FE"
      iconColor="#0284C7"
      width="max-w-3xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="goal-edit-form"
            className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Save changes
          </button>
        </>
      }
    >
      <form id="goal-edit-form" onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Title" full>
          <input className={FIELD} value={draft.title} onChange={(e) => set("title", e.target.value)} required />
        </Field>
        <Field label="Employee">
          <input className={FIELD} value={draft.employee} onChange={(e) => set("employee", e.target.value)} required />
        </Field>
        <Field label="Goal type">
          <input className={FIELD} value={draft.goalType} onChange={(e) => set("goalType", e.target.value)} required />
        </Field>
        <Field label="Start date">
          <input className={FIELD} value={draft.startDate} onChange={(e) => set("startDate", e.target.value)} required />
        </Field>
        <Field label="End date">
          <input className={FIELD} value={draft.endDate} onChange={(e) => set("endDate", e.target.value)} required />
        </Field>
        <Field label="Progress (%)">
          <input
            type="number"
            min="0"
            max="100"
            className={FIELD}
            value={draft.progress}
            onChange={(e) => set("progress", e.target.value)}
          />
        </Field>
        <Field label="Status">
          <select className={FIELD} value={draft.status} onChange={(e) => set("status", e.target.value)}>
            <option>In Progress</option>
            <option>Completed</option>
            <option>On Hold</option>
          </select>
        </Field>
        <Field label="Remarks" full>
          <textarea
            rows={3}
            className={`${FIELD} resize-y min-h-[88px]`}
            value={draft.remarks}
            onChange={(e) => set("remarks", e.target.value)}
          />
        </Field>
      </form>
    </Modal>
  );
}

/** Reserved for Goals graph action — implement when product defines the chart content. */
export function GoalGraphPlaceholder() {
  return null;
}
