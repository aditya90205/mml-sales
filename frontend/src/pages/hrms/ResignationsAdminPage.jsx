import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, CheckCircle2, ChevronDown, Search, Shield, UserCheck, Users, UserX } from "lucide-react";
import Modal from "../../components/ui/Modal";
import {
  CLEARANCE_ITEMS,
  RESIGNATION_STAGES,
  readResignations,
  setClearanceItem,
  updateResignationStatus,
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

const HR_STATUS_OPTIONS = [...RESIGNATION_STAGES, "Rejected"];

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Submitted;
  return (
    <span
      className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-md whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="flex items-center gap-3 bg-white border border-black/8 rounded-2xl px-4 py-3.5 flex-1 min-w-0">
      <span className="size-9 rounded-xl grid place-items-center shrink-0" style={{ backgroundColor: bg, color }}>
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-[#9CA3AF] truncate">{label}</p>
        <p className="text-[18px] font-bold text-[#111] leading-tight">{value}</p>
      </div>
    </div>
  );
}

function DetailModal({ record, onClose, onChanged }) {
  const [status, setStatus] = useState(record.status);
  const [approvedLastDay, setApprovedLastDay] = useState(record.approvedLastDay || record.requestedLastDay);
  const [note, setNote] = useState("");
  const [clearance, setClearance] = useState(record.clearance);

  const toggleClearance = (key) => {
    const value = !clearance[key];
    setClearance((prev) => ({ ...prev, [key]: value }));
    setClearanceItem(record.id, key, value);
    onChanged();
  };

  const clearedCount = Object.values(clearance).filter(Boolean).length;

  const handleUpdate = () => {
    if (status === "Completed" && clearedCount < CLEARANCE_ITEMS.length) {
      toast.error("Complete all clearance checklist items before marking as Completed.");
      return;
    }
    updateResignationStatus(record.id, { status, note, approvedLastDay });
    toast.success(`${record.employeeName}'s resignation updated to "${status}".`);
    setNote("");
    onChanged();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={record.employeeName}
      subtitle={`${record.designation} · ${record.department}`}
      icon={<UserCheck size={16} />}
      iconBg="#FCF5F6"
      iconColor="#7A0A17"
      width="max-w-2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Update status
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-[10.5px] font-bold text-[#9CA3AF] uppercase tracking-wide">Submitted</p>
            <p className="text-[13px] font-semibold text-[#111] mt-0.5">{record.submittedOn}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold text-[#9CA3AF] uppercase tracking-wide">Notice period</p>
            <p className="text-[13px] font-semibold text-[#111] mt-0.5">{record.noticePeriodDays} days</p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold text-[#9CA3AF] uppercase tracking-wide">Requested last day</p>
            <p className="text-[13px] font-semibold text-[#111] mt-0.5">{record.requestedLastDay}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold text-[#9CA3AF] uppercase tracking-wide">Current status</p>
            <div className="mt-0.5">
              <StatusPill status={record.status} />
            </div>
          </div>
        </div>

        <div className="bg-[#FAFAFB] border border-black/8 rounded-xl px-4 py-3">
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide mb-1">
            Reason: {record.reason}
          </p>
          {record.reasonDetails && <p className="text-[13px] text-[#374151]">“{record.reasonDetails}”</p>}
        </div>

        <div>
          <h4 className="text-[12px] font-extrabold text-[#111827] uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
            <Shield size={13} className="text-[#7A0A17]" /> Clearance checklist ({clearedCount} of {CLEARANCE_ITEMS.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CLEARANCE_ITEMS.map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-2.5 text-[13px] text-[#111] border border-black/8 rounded-lg px-3 py-2 cursor-pointer hover:bg-[#FAFAFB] transition-colors"
              >
                <input
                  type="checkbox"
                  checked={!!clearance[item.key]}
                  onChange={() => toggleClearance(item.key)}
                  className="size-4 rounded border-black/25 accent-[#7A0A17] cursor-pointer"
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Update status to</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] outline-none focus:border-[#7A0A17]/40 bg-white"
            >
              {HR_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] font-bold text-[#111] mb-1.5">Confirmed last working day</label>
            <input
              type="date"
              value={approvedLastDay || ""}
              onChange={(e) => setApprovedLastDay(e.target.value)}
              className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] outline-none focus:border-[#7A0A17]/40"
            />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">Note (visible to employee)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="e.g. Approved. Please complete handover with your manager."
            className="w-full border border-black/12 rounded-xl px-3.5 py-2.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40 resize-none"
          />
        </div>

        <div>
          <h4 className="text-[12px] font-extrabold text-[#111827] uppercase tracking-wide mb-2.5">Timeline</h4>
          <div className="flex flex-col gap-3 max-h-[180px] overflow-y-auto scrollbar-thin pr-1">
            {[...record.timeline].reverse().map((t, i) => (
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
    </Modal>
  );
}

export default function ResignationsAdminPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshKey forces a re-read from storage
  const records = useMemo(() => readResignations(), [refreshKey]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch = r.employeeName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const stats = useMemo(() => {
    const pending = records.filter((r) => r.status === "Submitted" || r.status === "Under Review").length;
    const active = records.filter((r) => r.status === "Notice Period" || r.status === "Clearance" || r.status === "Approved").length;
    const completed = records.filter((r) => r.status === "Completed").length;
    return { total: records.length, pending, active, completed };
  }, [records]);

  const selected = filtered.find((r) => r.id === selectedId) || records.find((r) => r.id === selectedId);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pt-5 pb-8 flex flex-col gap-5 min-w-0">
        <div>
          <Link
            to="/hrms"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#6B7280] hover:text-[#7A0A17] transition-colors"
          >
            <ArrowLeft size={13} /> Back to HRMS
          </Link>
          <h1 className="text-[26px] font-bold text-[#111] tracking-tight mt-1.5">Resignations</h1>
          <p className="text-[13.5px] text-[#6B7280] mt-1">
            Track every resignation request end-to-end and complete the exit process.
          </p>
        </div>

        <div className="flex items-stretch gap-3 flex-wrap">
          <StatCard label="Total requests" value={stats.total} icon={Users} color="#6366F1" bg="#EEF0FE" />
          <StatCard label="Pending review" value={stats.pending} icon={UserX} color="#D97706" bg="#FFF3E4" />
          <StatCard label="In progress" value={stats.active} icon={Shield} color="#7A0A17" bg="#FCF5F6" />
          <StatCard label="Completed" value={stats.completed} icon={CheckCircle2} color="#16A34A" bg="#E7F8EF" />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-black/10 flex-1 basis-[240px] max-w-[400px] focus-within:border-[#7A0A17]/40 transition-colors">
            <Search size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search employee..."
              className="bg-transparent text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none w-full min-w-0"
            />
          </div>
          <div className="relative shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none h-10 pl-4 pr-9 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] outline-none cursor-pointer hover:bg-[#FAFAFB] transition-colors"
            >
              <option value="all">All statuses</option>
              {[...RESIGNATION_STAGES, "Withdrawn", "Rejected"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
          </div>
        </div>

        <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr className="border-b border-black/8 bg-[#FAFAFB]">
                  {["Employee", "Department", "Submitted", "Requested last day", "Notice period", "Status", ""].map((h) => (
                    <th key={h} className="text-left text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/6">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-[13px] text-[#9CA3AF]">
                      No resignation requests found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr key={r.id} className="hover:bg-[#FAFAFB] transition-colors">
                      <td className="px-4 py-3 text-[13px] font-bold text-[#111] whitespace-nowrap">{r.employeeName}</td>
                      <td className="px-4 py-3 text-[12.5px] text-[#374151] whitespace-nowrap">{r.department}</td>
                      <td className="px-4 py-3 text-[12.5px] text-[#6B7280] whitespace-nowrap">{r.submittedOn}</td>
                      <td className="px-4 py-3 text-[12.5px] text-[#6B7280] whitespace-nowrap">{r.requestedLastDay}</td>
                      <td className="px-4 py-3 text-[12.5px] text-[#6B7280] whitespace-nowrap">{r.noticePeriodDays} days</td>
                      <td className="px-4 py-3">
                        <StatusPill status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedId(r.id)}
                          className="h-8 px-3.5 rounded-lg border border-[#7A0A17]/30 text-[#7A0A17] text-[12px] font-bold hover:bg-[#FCF5F6] transition-colors"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selected && (
        <DetailModal
          record={selected}
          onClose={() => setSelectedId(null)}
          onChanged={() => setRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
