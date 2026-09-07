import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  LogOut,
  Shield,
  Undo2,
} from "lucide-react";
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

function formatShortDate(iso) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function ExitStepper({ status, timeline = [] }) {
  const isTerminalClosed = status === "Withdrawn" || status === "Rejected";
  const activeIndex = RESIGNATION_STAGES.indexOf(status);
  const dateByStage = Object.fromEntries(timeline.map((t) => [t.status, t.date]));

  return (
    <div className="w-full overflow-x-auto scrollbar-thin py-2">
      <div className="flex items-start min-w-[640px]">
        {RESIGNATION_STAGES.map((stage, i) => {
          const done = !isTerminalClosed && i < activeIndex;
          const current = !isTerminalClosed && i === activeIndex;
          const stageDate = dateByStage[stage];

          return (
            <div key={stage} className="flex items-start flex-1 last:flex-none last:w-auto">
              <div className="flex flex-col items-center gap-1.5 min-w-[88px] px-1">
                <span
                  className={`size-8 rounded-full grid place-items-center text-[11px] font-bold border-2 transition-colors shadow-sm ${
                    done
                      ? "bg-[#16A34A] border-[#16A34A] text-white"
                      : current
                        ? "bg-[#7A0A17] border-[#7A0A17] text-white ring-4 ring-[#7A0A17]/12"
                        : "bg-white border-black/12 text-[#9CA3AF]"
                  }`}
                >
                  {done ? <CheckCircle2 size={15} /> : i + 1}
                </span>
                <span
                  className={`text-[11px] font-bold text-center leading-tight ${
                    current ? "text-[#7A0A17]" : done ? "text-[#111827]" : "text-[#9CA3AF]"
                  }`}
                >
                  {stage}
                </span>
                <span className={`text-[10px] font-medium ${stageDate ? "text-[#6B7280]" : "text-transparent"}`}>
                  {stageDate ? formatShortDate(stageDate) : "·"}
                </span>
              </div>
              {i < RESIGNATION_STAGES.length - 1 && (
                <div className="flex-1 h-8 flex items-center min-w-[20px] -mx-1">
                  <span
                    className={`block h-[3px] w-full rounded-full ${
                      done ? "bg-[#16A34A]" : current ? "bg-[#7A0A17]/25" : "bg-black/8"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SubmitExitModal({ open, onClose, onSubmitted, employee }) {
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
    toast.success("Exit request submitted. Your manager has been notified.");
    onSubmitted();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Submit Exit Request"
      subtitle="Your manager will review this request. You can withdraw anytime before it is completed."
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
            Submit Exit Request
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
            placeholder="Anything you'd like your manager to know..."
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
    toast.info("Exit request withdrawn.");
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
            Submit your exit request here. Your manager will review it, confirm your last working day, and
            guide you through a smooth handover.
          </p>
          <button
            type="button"
            onClick={() => setSubmitOpen(true)}
            className="mt-5 h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-bold hover:bg-[#640712] transition-colors"
          >
            Submit Exit Request
          </button>
        </div>

        <SubmitExitModal
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
  const clearedCount = Object.values(active.clearance).filter(Boolean).length;
  const stageIndex = Math.max(0, RESIGNATION_STAGES.indexOf(active.status));
  const progressPct = Math.round(((stageIndex + 1) / RESIGNATION_STAGES.length) * 100);
  const daysLeft = (() => {
    const last = active.approvedLastDay || active.requestedLastDay;
    if (!last) return null;
    const diff = Math.ceil((new Date(`${last}T00:00:00`) - new Date()) / 86400000);
    return diff;
  })();

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">Status</p>
          <div className="mt-1.5">
            <StatusPill status={active.status} />
          </div>
          <p className="text-[12.5px] text-[#6B7280] mt-2">Submitted on {active.submittedOn}</p>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide flex items-center gap-1.5">
            <CalendarDays size={12} /> Last working day
          </p>
          <p className="text-xl font-extrabold text-[#111827] mt-1.5">
            {active.approvedLastDay || active.requestedLastDay}
          </p>
          <p className="text-[12.5px] text-[#6B7280] mt-1">
            {active.approvedLastDay ? "Confirmed by manager" : "Requested · pending confirmation"}
          </p>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide flex items-center gap-1.5">
            <Shield size={12} /> Clearance
          </p>
          <p className="text-xl font-extrabold text-[#111827] mt-1.5">
            {clearedCount} of {CLEARANCE_ITEMS.length}
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-[#F3F4F6] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#16A34A] transition-all"
              style={{ width: `${(clearedCount / CLEARANCE_ITEMS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide flex items-center gap-1.5">
            <Clock3 size={12} /> Progress
          </p>
          <p className="text-xl font-extrabold text-[#111827] mt-1.5">{progressPct}%</p>
          <p className="text-[12.5px] text-[#6B7280] mt-1">
            {daysLeft == null
              ? "Track every exit step"
              : daysLeft > 0
                ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in notice`
                : daysLeft === 0
                  ? "Last working day is today"
                  : "Past last working day"}
          </p>
        </div>
      </div>

      <div className="bg-white border border-black/10 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-3 flex-wrap border-b border-black/6 bg-gradient-to-r from-[#FCF5F6] to-white">
          <div className="flex items-center gap-2.5">
            <span className="size-10 rounded-xl bg-white border border-[#7A0A17]/15 text-[#7A0A17] grid place-items-center shadow-sm">
              <LogOut size={17} />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-[#111827]">Exit progress</h3>
              <p className="text-[12.5px] text-[#6B7280]">
                {active.reason}
                {active.noticePeriodDays ? ` · ${active.noticePeriodDays}-day notice` : ""}
              </p>
            </div>
          </div>
          {canWithdraw && (
            <button
              type="button"
              onClick={handleWithdraw}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl border border-black/12 bg-white text-[#4B5563] text-xs font-bold hover:bg-[#FAFAFB] transition-colors"
            >
              <Undo2 size={13} /> Withdraw request
            </button>
          )}
        </div>

        <div className="px-5 py-5">
          {active.status !== "Withdrawn" && active.status !== "Rejected" && (
            <div className="mb-5 pb-5 border-b border-black/8">
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-[11px] font-extrabold text-[#6B7280] uppercase tracking-wide">
                  End-to-end tracking
                </p>
                <p className="text-[11px] font-semibold text-[#7A0A17]">
                  Step {stageIndex + 1} of {RESIGNATION_STAGES.length} · {active.status}
                </p>
              </div>
              <ExitStepper status={active.status} timeline={active.timeline} />
            </div>
          )}

          {active.reasonDetails && (
            <p className="text-[12.5px] text-[#374151] bg-[#FAFAFB] border border-black/8 rounded-xl px-4 py-3 mb-5 leading-relaxed">
              “{active.reasonDetails}”
            </p>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-[12px] font-extrabold text-[#111827] uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Shield size={13} className="text-[#7A0A17]" /> Clearance checklist
                <span className="ml-auto normal-case tracking-normal font-semibold text-[#6B7280]">
                  {clearedCount}/{CLEARANCE_ITEMS.length} done
                </span>
              </h4>
              <div className="flex flex-col gap-2.5">
                {CLEARANCE_ITEMS.map((item) => {
                  const done = !!active.clearance[item.key];
                  return (
                    <div
                      key={item.key}
                      className={`flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
                        done ? "bg-[#F0FDF4] border-[#16A34A]/25" : "bg-white border-black/8"
                      }`}
                    >
                      <span
                        className={`mt-0.5 size-[18px] rounded-md grid place-items-center shrink-0 ${
                          done ? "bg-[#16A34A] text-white" : "bg-[#F3F4F6] text-[#D1D5DB]"
                        }`}
                      >
                        {done ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                      </span>
                      <div className="min-w-0">
                        <p className={`text-[13px] font-bold ${done ? "text-[#166534]" : "text-[#111827]"}`}>
                          {item.label}
                        </p>
                        <p className="text-[11.5px] text-[#6B7280] mt-0.5 leading-snug">{item.hint}</p>
                      </div>
                      <span
                        className={`ml-auto shrink-0 text-[10.5px] font-bold uppercase tracking-wide ${
                          done ? "text-[#16A34A]" : "text-[#9CA3AF]"
                        }`}
                      >
                        {done ? "Done" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
              {active.hrNote && (
                <p className="text-[12px] text-[#6B7280] mt-3 bg-[#FFF8F0] border border-[#F5D0A9] rounded-xl px-3.5 py-2.5 leading-relaxed">
                  <span className="font-bold text-[#92400E]">Note: </span>
                  {active.hrNote}
                </p>
              )}
            </div>

            <div>
              <h4 className="text-[12px] font-extrabold text-[#111827] uppercase tracking-wide mb-3">
                Activity timeline
              </h4>
              <div className="relative pl-1 max-h-[340px] overflow-y-auto scrollbar-thin pr-1">
                {[...active.timeline].reverse().map((t, i, arr) => {
                  const isLatest = i === 0;
                  return (
                    <div key={`${t.status}-${t.date}-${i}`} className="flex gap-3 relative pb-5 last:pb-0">
                      {i < arr.length - 1 && (
                        <span className="absolute left-[7px] top-4 bottom-0 w-px bg-black/10" />
                      )}
                      <span
                        className={`relative z-[1] mt-1 size-[15px] rounded-full border-2 shrink-0 ${
                          isLatest
                            ? "bg-[#7A0A17] border-[#7A0A17] ring-4 ring-[#7A0A17]/12"
                            : "bg-white border-[#7A0A17]/50"
                        }`}
                      />
                      <div className="min-w-0 flex-1 -mt-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[13px] font-bold text-[#111]">{t.status}</p>
                          {isLatest && (
                            <span className="text-[10px] font-bold uppercase tracking-wide text-[#7A0A17] bg-[#FCF5F6] px-1.5 py-0.5 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[12.5px] text-[#6B7280] leading-snug mt-0.5">{t.note}</p>
                        <p className="text-[11px] text-[#9CA3AF] mt-1 font-medium">
                          {t.date}
                          {t.by ? ` · ${t.by}` : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
