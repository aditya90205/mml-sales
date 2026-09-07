import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, LogOut, Shield, Undo2 } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";
import {
  CLEARANCE_ITEMS,
  NOTICE_PERIOD_OPTIONS,
  REASON_OPTIONS,
  RESIGNATION_STAGES,
  getActiveResignationFor,
  submitResignation,
  suggestLastWorkingDay,
  withdrawResignation,
} from "../../utils/resignations";

const STATUS_STYLES = {
  Submitted: { bg: "#EEF0FE", color: "#6366F1" },
  "Under Review": { bg: "#FFF3E4", color: "#D97706" },
  Approved: { bg: "#E8F2FE", color: "#2563EB" },
  "Notice Period": { bg: "#FDECEE", color: "#7A0A17" },
  Clearance: { bg: "#F3E8FF", color: "#9333EA" },
  Completed: { bg: "#E7F8EF", color: "#16A34A" },
  Withdrawn: { bg: "#F3F4F6", color: "#6B7280" },
  Rejected: { bg: "#FEE2E2", color: "#DC2626" },
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Submitted;
  return (
    <span
      className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-md"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function ResignationStepper({ status }) {
  const isTerminalClosed = status === "Withdrawn" || status === "Rejected";
  const activeIndex = RESIGNATION_STAGES.indexOf(status);

  return (
    <div className="flex items-center w-full overflow-x-auto scrollbar-thin py-1">
      {RESIGNATION_STAGES.map((stage, i) => {
        const done = !isTerminalClosed && i < activeIndex;
        const current = !isTerminalClosed && i === activeIndex;
        return (
          <div key={stage} className="flex items-center shrink-0 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 min-w-[92px]">
              <span
                className={`size-7 rounded-full grid place-items-center text-[11px] font-bold border-2 transition-colors ${
                  done
                    ? "bg-[#16A34A] border-[#16A34A] text-white"
                    : current
                      ? "bg-[#7A0A17] border-[#7A0A17] text-white"
                      : "bg-white border-black/15 text-[#9CA3AF]"
                }`}
              >
                {done ? <CheckCircle2 size={14} /> : i + 1}
              </span>
              <span className={`text-[10.5px] font-semibold text-center leading-tight ${current ? "text-[#111]" : "text-[#9CA3AF]"}`}>
                {stage}
              </span>
            </div>
            {i < RESIGNATION_STAGES.length - 1 && (
              <span className={`h-[2px] w-8 shrink-0 mx-0.5 ${done ? "bg-[#16A34A]" : "bg-black/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SubmitResignationModal({ open, onClose, onSubmitted, employee }) {
  const [noticePeriodDays, setNoticePeriodDays] = useState(30);
  const [lastDay, setLastDay] = useState(suggestLastWorkingDay(30));
  const [reason, setReason] = useState(REASON_OPTIONS[0]);
  const [details, setDetails] = useState("");

  const changeNotice = (days) => {
    setNoticePeriodDays(days);
    setLastDay(suggestLastWorkingDay(days));
  };

  const handleSubmit = () => {
    if (!lastDay) {
      toast.error("Please select your preferred last working day.");
      return;
    }
    submitResignation({
      employeeName: employee.name,
      employeeId: employee.id,
      department: employee.department,
      designation: employee.designation,
      requestedLastDay: lastDay,
      noticePeriodDays,
      reason,
      reasonDetails: details,
    });
    toast.success("Resignation submitted. HR has been notified.");
    onSubmitted();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Submit Resignation"
      subtitle="This will be sent to HR for review. You can withdraw it anytime before it's completed."
      icon={<LogOut size={16} />}
      iconBg="#FCF5F6"
      iconColor="#7A0A17"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Submit Resignation
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">Notice period</label>
          <select
            value={noticePeriodDays}
            onChange={(e) => changeNotice(Number(e.target.value))}
            className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] outline-none focus:border-[#7A0A17]/40 bg-white"
          >
            {NOTICE_PERIOD_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d} days
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">Preferred last working day</label>
          <input
            type="date"
            value={lastDay}
            onChange={(e) => setLastDay(e.target.value)}
            className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] outline-none focus:border-[#7A0A17]/40"
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">Reason for leaving</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] outline-none focus:border-[#7A0A17]/40 bg-white"
          >
            {REASON_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">Additional comments (optional)</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            placeholder="Anything you'd like HR to know..."
            className="w-full border border-black/12 rounded-xl px-3.5 py-2.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40 resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}

export default function ResignationSection({ employee }) {
  const [submitOpen, setSubmitOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshKey forces a re-read from storage
  const active = useMemo(() => getActiveResignationFor(employee.name), [employee.name, refreshKey]);

  const handleWithdraw = () => {
    if (!active) return;
    withdrawResignation(active.id);
    toast.info("Resignation withdrawn.");
    setRefreshKey((k) => k + 1);
  };

  if (!active) {
    return (
      <div className="flex flex-col gap-5">
        <div className="bg-white border border-black/10 rounded-2xl p-8 text-center shadow-sm">
          <div className="size-14 rounded-2xl bg-[#FCF5F6] border border-[#7A0A17]/15 text-[#7A0A17] grid place-items-center mx-auto mb-4">
            <LogOut size={24} />
          </div>
          <h3 className="text-base font-extrabold text-[#111827]">Planning to move on?</h3>
          <p className="text-[13px] text-[#6B7280] mt-1.5 max-w-sm mx-auto leading-relaxed">
            Submit your resignation here. HR will review it, confirm your last working day, and guide you
            through a smooth exit.
          </p>
          <button
            type="button"
            onClick={() => setSubmitOpen(true)}
            className="mt-5 h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-bold hover:bg-[#640712] transition-colors"
          >
            Submit Resignation
          </button>
        </div>

        <Link
          to="/hrms/resignations"
          className="self-center text-[12.5px] font-semibold text-[#7A0A17] hover:underline"
        >
          HR / Admin: manage all resignation requests →
        </Link>

        <SubmitResignationModal
          open={submitOpen}
          onClose={() => setSubmitOpen(false)}
          employee={employee}
          onSubmitted={() => {
            setSubmitOpen(false);
            setRefreshKey((k) => k + 1);
          }}
        />
      </div>
    );
  }

  const canWithdraw = active.status !== "Completed";

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">Status</p>
          <div className="mt-1.5">
            <StatusPill status={active.status} />
          </div>
          <p className="text-[12.5px] text-[#6B7280] mt-2">Submitted on {active.submittedOn}</p>
        </div>
        <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">Last working day</p>
          <p className="text-xl font-extrabold text-[#111827] mt-1.5">
            {active.approvedLastDay || active.requestedLastDay}
          </p>
          <p className="text-[12.5px] text-[#6B7280] mt-1">
            {active.approvedLastDay ? "Confirmed by HR" : "Requested · pending confirmation"}
          </p>
        </div>
        <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">Clearance</p>
          <p className="text-xl font-extrabold text-[#111827] mt-1.5">
            {Object.values(active.clearance).filter(Boolean).length} of {CLEARANCE_ITEMS.length}
          </p>
          <p className="text-[12.5px] text-[#6B7280] mt-1">Checklist items done</p>
        </div>
      </div>

      <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
          <div className="flex items-center gap-2.5">
            <span className="size-9 rounded-full bg-[#FCF5F6] text-[#7A0A17] grid place-items-center">
              <LogOut size={16} />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-[#111827]">Resignation progress</h3>
              <p className="text-[12.5px] text-[#6B7280]">{active.reason}</p>
            </div>
          </div>
          {canWithdraw && (
            <button
              type="button"
              onClick={handleWithdraw}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-black/12 text-[#4B5563] text-xs font-bold hover:bg-[#FAFAFB] transition-colors"
            >
              <Undo2 size={13} /> Withdraw request
            </button>
          )}
        </div>

        {active.status !== "Withdrawn" && active.status !== "Rejected" && (
          <div className="mb-5 pb-5 border-b border-black/8">
            <ResignationStepper status={active.status} />
          </div>
        )}

        {active.reasonDetails && (
          <p className="text-[12.5px] text-[#374151] bg-[#FAFAFB] border border-black/8 rounded-xl px-4 py-3 mb-5">
            “{active.reasonDetails}”
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <h4 className="text-[12px] font-extrabold text-[#111827] uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <Shield size={13} className="text-[#7A0A17]" /> Clearance checklist
            </h4>
            <div className="flex flex-col gap-2">
              {CLEARANCE_ITEMS.map((item) => (
                <div key={item.key} className="flex items-center gap-2.5 text-[13px]">
                  <span
                    className={`size-4.5 rounded-md grid place-items-center shrink-0 ${
                      active.clearance[item.key] ? "bg-[#16A34A] text-white" : "bg-[#F3F4F6] text-transparent"
                    }`}
                    style={{ width: 18, height: 18 }}
                  >
                    <CheckCircle2 size={12} />
                  </span>
                  <span className={active.clearance[item.key] ? "text-[#111]" : "text-[#9CA3AF]"}>{item.label}</span>
                </div>
              ))}
            </div>
            {active.hrNote && (
              <p className="text-[12px] text-[#6B7280] mt-3 bg-[#FAFAFB] border border-black/8 rounded-lg px-3 py-2">
                <span className="font-bold text-[#374151]">HR note: </span>
                {active.hrNote}
              </p>
            )}
          </div>

          <div>
            <h4 className="text-[12px] font-extrabold text-[#111827] uppercase tracking-wide mb-3">Timeline</h4>
            <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto scrollbar-thin pr-1">
              {[...active.timeline].reverse().map((t, i) => (
                <div key={i} className="flex gap-3">
                  <span className="size-2 rounded-full bg-[#7A0A17] mt-1.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-bold text-[#111]">{t.status}</p>
                    <p className="text-[12px] text-[#6B7280] leading-snug">{t.note}</p>
                    <p className="text-[10.5px] text-[#9CA3AF] mt-0.5">
                      {t.date}
                      {t.by ? ` · ${t.by}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Link
        to="/hrms/resignations"
        className="self-center text-[12.5px] font-semibold text-[#7A0A17] hover:underline"
      >
        HR / Admin: manage all resignation requests →
      </Link>
    </div>
  );
}
