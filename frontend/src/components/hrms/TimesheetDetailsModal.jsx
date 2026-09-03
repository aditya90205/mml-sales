import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Pencil, Plus, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import Modal from "../ui/Modal";

const TIMESHEET = {
  date: "26-08-2026",
  loginTime: "09:00 AM",
  logoutTime: "02:00 PM",
  systemEntries: [
    { start: "09:00:00 AM", end: "10:00:35 AM", module: "Calendar", description: "Meetings with clients", by: "System", hours: "1.00h" },
    { start: "10:00:00 AM", end: "10:30:00 AM", module: "Dashboard", description: "Requirement gathering and analysis", by: "System", hours: "1.50h" },
    { start: "10:30:00 AM", end: "02:00:00 PM", module: "Communication", description: "Sending mails and assigning tasks", by: "System", hours: "3.50h" },
  ],
  manualEntries: [
    {
      start: "03:00 PM",
      end: "06:00 PM",
      module: "Field Work",
      description: "House visit with customer for collection",
      by: "Manual",
      hours: "3.00h",
      status: "Regularization Rejected",
      comment: "We can't give you leave on that particular date.",
    },
  ],
  totalWorking: "9.00h",
  breakHours: "1.00h",
  systemTotal: "6.00h",
};

const emptyManual = () => ({
  start: "",
  end: "",
  module: "",
  description: "",
  by: "Manual",
  hours: "",
  status: "Pending",
  comment: "",
});

function toTimeInput(value) {
  if (!value) return "";
  const raw = String(value).trim();
  if (/^\d{2}:\d{2}$/.test(raw)) return raw;
  const m = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i);
  if (!m) return "";
  let h = Number(m[1]);
  const min = m[2];
  const ap = (m[3] || "").toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}

function toTimeDisplay(value) {
  if (!value) return "";
  const raw = String(value).trim();
  if (/AM|PM/i.test(raw)) {
    const m = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i);
    if (!m) return raw;
    return `${String(Number(m[1])).padStart(2, "0")}:${m[2]} ${m[3].toUpperCase()}`;
  }
  const m = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return raw;
  let h = Number(m[1]);
  const min = m[2];
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${min} ${ap}`;
}

function calcHours(start, end) {
  const a = toTimeInput(start);
  const b = toTimeInput(end);
  if (!a || !b) return "";
  const [ah, am] = a.split(":").map(Number);
  const [bh, bm] = b.split(":").map(Number);
  const mins = bh * 60 + bm - (ah * 60 + am);
  if (mins <= 0) return "";
  return `${(mins / 60).toFixed(2)}h`;
}

function statusTone(status) {
  if (!status) return "";
  if (/approved/i.test(status)) return "text-[#16A34A]";
  if (/rejected/i.test(status)) return "text-[#DC2626]";
  if (/pending/i.test(status)) return "text-[#D97706]";
  return "text-[#6B7280]";
}

function ManualEntryForm({ initial, onSave, onCancel, submitLabel }) {
  const [form, setForm] = useState(() => ({
    ...emptyManual(),
    ...initial,
    by: "Manual",
    start: toTimeInput(initial?.start),
    end: toTimeInput(initial?.end),
  }));
  const set = (f) => (v) => setForm((s) => ({ ...s, [f]: v }));

  useEffect(() => {
    setForm({
      ...emptyManual(),
      ...initial,
      by: "Manual",
      start: toTimeInput(initial?.start),
      end: toTimeInput(initial?.end),
    });
  }, [initial]);

  useEffect(() => {
    const hours = calcHours(form.start, form.end);
    if (hours && hours !== form.hours) setForm((s) => ({ ...s, hours }));
  }, [form.start, form.end, form.hours]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave({
          ...form,
          by: "Manual",
          start: toTimeDisplay(form.start),
          end: toTimeDisplay(form.end),
          hours: calcHours(form.start, form.end) || form.hours,
          status: form.status || "Pending",
        });
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-[13px] font-semibold text-[#111]">Start Time <span className="text-[#DC2626]">*</span></p>
          <input type="time" value={form.start} onChange={(e) => set("start")(e.target.value)} className="border border-black/10 rounded-xl h-11 px-3 text-sm outline-none focus:border-[#7A0A17]/40 w-full" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[13px] font-semibold text-[#111]">End Time <span className="text-[#DC2626]">*</span></p>
          <input type="time" value={form.end} onChange={(e) => set("end")(e.target.value)} className="border border-black/10 rounded-xl h-11 px-3 text-sm outline-none focus:border-[#7A0A17]/40 w-full" required />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-semibold text-[#111]">Project / Module <span className="text-[#DC2626]">*</span></p>
        <input value={form.module} onChange={(e) => set("module")(e.target.value)} placeholder="e.g. Field Work" className="border border-black/10 rounded-xl h-11 px-3 text-sm outline-none focus:border-[#7A0A17]/40 w-full" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-semibold text-[#111]">Description <span className="text-[#DC2626]">*</span></p>
        <input value={form.description} onChange={(e) => set("description")(e.target.value)} placeholder="e.g. House visit with customer" className="border border-black/10 rounded-xl h-11 px-3 text-sm outline-none focus:border-[#7A0A17]/40 w-full" required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <p className="text-[13px] font-semibold text-[#111]">By</p>
          <input value="Manual" readOnly className="border border-black/10 rounded-xl h-11 px-3 text-sm bg-[#F7F8FA] text-[#6B7280] w-full cursor-not-allowed" />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[13px] font-semibold text-[#111]">Hours</p>
          <input value={form.hours} readOnly placeholder="Auto" className="border border-black/10 rounded-xl h-11 px-3 text-sm bg-[#F7F8FA] text-[#3B82F6] font-semibold w-full cursor-not-allowed" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="h-9 px-5 rounded-xl border border-black/10 text-[13px] font-semibold text-[#111]">Cancel</button>
        <button type="submit" className="h-9 px-6 rounded-xl bg-[#7A0A17] text-[13px] font-semibold text-white">{submitLabel}</button>
      </div>
    </form>
  );
}

function IconBtn({ title, className, children, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={`size-7 rounded-lg border grid place-items-center transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export default function TimesheetDetailsModal({ open, onClose, employee, mode = "edit" }) {
  const [canEdit, setCanEdit] = useState(mode === "edit");
  const [manualEntries, setManualEntries] = useState(TIMESHEET.manualEntries);
  const [entryForm, setEntryForm] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [rejectComment, setRejectComment] = useState("");

  useEffect(() => {
    if (open) {
      setCanEdit(mode === "edit");
      setManualEntries(TIMESHEET.manualEntries.map((e) => ({ ...e })));
      setEntryForm(null);
      setRejecting(null);
      setRejectComment("");
    }
  }, [open, mode]);

  const manualTotal = useMemo(() => {
    const total = manualEntries.reduce((sum, e) => {
      const n = parseFloat(String(e.hours || "").replace(/h$/i, ""));
      return sum + (Number.isFinite(n) ? n : 0);
    }, 0);
    return `${total.toFixed(2)}h`;
  }, [manualEntries]);

  const saveEntry = (form) => {
    const entry = { ...form, by: "Manual" };
    if (entryForm?.mode === "edit") {
      setManualEntries((prev) => prev.map((e, i) => (i === entryForm.index ? { ...e, ...entry } : e)));
      toast.success("Manual entry updated.");
    } else {
      setManualEntries((prev) => [...prev, { ...entry, status: entry.status || "Pending" }]);
      toast.success("Manual entry added.");
    }
    setEntryForm(null);
  };

  const deleteEntry = (index) => {
    setManualEntries((prev) => prev.filter((_, i) => i !== index));
    toast.success("Manual entry deleted.");
  };

  const approveEntry = (index) => {
    setManualEntries((prev) =>
      prev.map((e, i) =>
        i === index ? { ...e, status: "Regularization Approved", comment: /reject/i.test(e.status || "") ? "" : e.comment } : e
      )
    );
    toast.success("Manual entry approved.");
  };

  const confirmReject = () => {
    if (rejecting == null) return;
    setManualEntries((prev) =>
      prev.map((e, i) =>
        i === rejecting
          ? { ...e, status: "Regularization Rejected", comment: rejectComment.trim() || "Rejected by admin." }
          : e
      )
    );
    toast.success("Manual entry rejected.");
    setRejecting(null);
    setRejectComment("");
  };

  const th = "px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide text-[#9CA3AF] whitespace-nowrap";
  const td = "px-4 py-3 text-[13px] text-[#6B7280]";

  return (
    <>
      <Modal open={open} onClose={onClose} title="Timesheet Details" width="max-w-[960px]">
        {employee && (
          <div className="flex flex-col gap-5">
            <div className="border border-black/8 rounded-2xl p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <img src={employee.avatar} alt={employee.name} className="size-12 rounded-full object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="text-[14px] font-bold text-[#111] truncate">{employee.name}</p>
                  <p className="text-[12px] text-[#6B7280] truncate">{employee.role}</p>
                  <span className="text-[11px] font-medium bg-[#EEF0FE] text-[#6366F1] rounded-lg px-2 py-0.5 mt-1 inline-block">{employee.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-6 sm:gap-8">
                <div>
                  <p className="text-[11px] text-[#9CA3AF]">Date</p>
                  <p className="text-[13px] font-bold text-[#111]">{TIMESHEET.date}</p>
                </div>
                <div className="h-8 w-px bg-black/10" />
                <div>
                  <p className="text-[11px] text-[#9CA3AF]">Login Time</p>
                  <p className="text-[13px] font-bold text-[#16A34A]">{TIMESHEET.loginTime}</p>
                </div>
                <div className="h-8 w-px bg-black/10" />
                <div>
                  <p className="text-[11px] text-[#9CA3AF]">Logout Time</p>
                  <p className="text-[13px] font-bold text-[#DC2626]">{TIMESHEET.logoutTime}</p>
                </div>
                {!canEdit && (
                  <button
                    type="button"
                    onClick={() => setCanEdit(true)}
                    className="ml-2 inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[12px] font-semibold hover:bg-[#640712]"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                )}
              </div>
            </div>

            <div>
              <div className="bg-[#F3F4F6] rounded-t-xl px-4 py-2.5">
                <h3 className="text-[14px] font-bold text-[#111]">Hourly Work Details</h3>
              </div>
              <div className="border border-black/8 border-t-0 rounded-b-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left">
                    <thead>
                      <tr className="border-b border-black/8">
                        <th className={th}>Start Time</th>
                        <th className={th}>End Time</th>
                        <th className={th}>Project/Module</th>
                        <th className={th}>Description</th>
                        <th className={th}>By</th>
                        <th className={`${th} text-right`}>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {TIMESHEET.systemEntries.map((e, i) => (
                        <tr key={i} className="border-b border-black/6">
                          <td className={`${td} whitespace-nowrap`}>{e.start}</td>
                          <td className={`${td} whitespace-nowrap`}>{e.end}</td>
                          <td className="px-4 py-3 text-[13px] font-semibold text-[#111]">{e.module}</td>
                          <td className={td}>{e.description}</td>
                          <td className={`${td} whitespace-nowrap`}>{e.by}</td>
                          <td className="px-4 py-3 text-[13px] font-bold text-[#3B82F6] text-right whitespace-nowrap">{e.hours}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-[#E8F2FE]">
                        <td colSpan={5} className="px-4 py-3 text-[13px] font-bold text-[#3B82F6]">Total Hours Calculated by System</td>
                        <td className="px-4 py-3 text-[13px] font-bold text-[#3B82F6] text-right">{TIMESHEET.systemTotal}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
              <button
                type="button"
                onClick={() => canEdit && setEntryForm({ mode: "add", initial: emptyManual() })}
                className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl border border-[#3B82F6] text-[#3B82F6] text-[13px] font-semibold w-full sm:w-auto hover:bg-[#E8F2FE]"
              >
                <Plus size={14} /> Add Row (Manual Entry)
              </button>
              <p className="text-[12px] text-[#DC2626] sm:text-right">Note: All manual entries will require regularization or approval.</p>
            </div>

            <div className="border border-black/8 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead>
                    <tr className="border-b border-black/8">
                      <th className={th}>Start Time</th>
                      <th className={th}>End Time</th>
                      <th className={th}>Project/Module</th>
                      <th className={th}>Description</th>
                      <th className={th}>By</th>
                      <th className={`${th} text-right`}>Hours</th>
                      <th className={`${th} text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualEntries.map((e, i) => (
                      <tr key={i} className="border-b border-black/6 align-top">
                        <td className={`${td} whitespace-nowrap`}>{e.start}</td>
                        <td className={`${td} whitespace-nowrap`}>{e.end}</td>
                        <td className="px-4 py-3 text-[13px] font-semibold text-[#111]">{e.module}</td>
                        <td className={td}>
                          {e.description}
                          {e.comment && (
                            <p className="mt-2 text-[12px]">
                              <span className="font-semibold text-[#3B82F6]">Comment: </span>
                              <span className="text-[#6B7280]">{e.comment}</span>
                            </p>
                          )}
                        </td>
                        <td className={`${td} whitespace-nowrap`}>
                          {e.by}
                          {e.status && <p className={`mt-2 text-[12px] font-bold ${statusTone(e.status)}`}>{e.status}</p>}
                        </td>
                        <td className="px-4 py-3 text-[13px] font-bold text-[#3B82F6] text-right whitespace-nowrap">{e.hours}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <IconBtn title="Approve" className="border-[#16A34A]/30 text-[#16A34A] hover:bg-[#E7F8EF]" onClick={() => canEdit && approveEntry(i)}>
                              <CheckCircle2 size={14} />
                            </IconBtn>
                            <IconBtn title="Reject" className="border-[#DC2626]/30 text-[#DC2626] hover:bg-[#FEE2E2]" onClick={() => canEdit && (setRejecting(i), setRejectComment(e.comment || ""))}>
                              <XCircle size={14} />
                            </IconBtn>
                            <IconBtn title="Edit" className="border-[#3B82F6]/30 text-[#3B82F6] hover:bg-[#E8F2FE]" onClick={() => canEdit && setEntryForm({ mode: "edit", index: i, initial: { ...e, by: "Manual" } })}>
                              <Pencil size={13} />
                            </IconBtn>
                            <IconBtn title="Delete" className="border-[#DC2626]/30 text-[#DC2626] hover:bg-[#FEE2E2]" onClick={() => canEdit && deleteEntry(i)}>
                              <Trash2 size={13} />
                            </IconBtn>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {manualEntries.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-6 text-center text-[13px] text-[#9CA3AF]">No manual entries yet.</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#E8F2FE]">
                      <td colSpan={5} className="px-4 py-3 text-[13px] font-bold text-[#3B82F6]">Total Hours Calculated by Manual</td>
                      <td className="px-4 py-3 text-[13px] font-bold text-[#3B82F6] text-right">{manualTotal}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div>
              <div className="bg-[#F3F4F6] rounded-t-xl px-4 py-2.5">
                <h3 className="text-[14px] font-bold text-[#111]">Hourly Work Details</h3>
              </div>
              <div className="border border-black/8 border-t-0 rounded-b-xl grid grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Total Working Hours", value: TIMESHEET.totalWorking, color: "text-[#3B82F6]" },
                  { label: "Break Hours", value: TIMESHEET.breakHours, color: "text-[#D97706]" },
                  { label: "System Calculated", value: TIMESHEET.systemTotal, color: "text-[#3B82F6]" },
                  { label: "Manual Calculated", value: manualTotal, color: "text-[#3B82F6]" },
                ].map((s, i) => (
                  <div key={s.label} className={`px-4 py-4 ${i > 0 ? "lg:border-l border-black/8" : ""} ${i % 2 === 1 ? "border-l border-black/8 lg:border-l" : ""}`}>
                    <p className="text-[11px] text-[#9CA3AF]">{s.label}</p>
                    <p className={`text-[18px] font-bold mt-1 ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!entryForm} onClose={() => setEntryForm(null)} title={entryForm?.mode === "edit" ? "Edit Manual Entry" : "Add Manual Entry"} width="max-w-[520px]">
        {entryForm && (
          <ManualEntryForm
            initial={entryForm.initial}
            onSave={saveEntry}
            onCancel={() => setEntryForm(null)}
            submitLabel={entryForm.mode === "edit" ? "Save & Update" : "Save"}
          />
        )}
      </Modal>

      <Modal
        open={rejecting != null}
        onClose={() => { setRejecting(null); setRejectComment(""); }}
        title="Reject Manual Entry"
        width="max-w-[440px]"
      >
        <div className="flex flex-col gap-4">
          <p className="text-[13px] text-[#6B7280]">Add a comment for this rejection. It will show under the entry.</p>
          <textarea
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            rows={3}
            placeholder="e.g. We can't approve this time entry..."
            className="border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#7A0A17]/40 resize-none w-full"
          />
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => { setRejecting(null); setRejectComment(""); }} className="h-9 px-5 rounded-xl border border-black/10 text-[13px] font-semibold text-[#111]">Cancel</button>
            <button type="button" onClick={confirmReject} className="h-9 px-6 rounded-xl bg-[#DC2626] text-[13px] font-semibold text-white">Reject</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
