import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Eye,
  FileText,
  ImageIcon,
  Info,
  Pencil,
  Plus,
  StickyNote,
  TrendingUp,
  ArrowLeftRight,
} from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";
import {
  BRANCH_OPTIONS,
  DEPARTMENT_OPTIONS,
  DESIGNATION_OPTIONS,
  getAllPromotions,
  getAllTransfers,
  getPromotionsFor,
  getTransferType,
  getTransfersFor,
  submitTransfer,
  updateTransfer,
} from "../../utils/promotionsTransfers";

const STATUS_STYLES = {
  Pending: { bg: "#E8F2FE", color: "#2563EB" },
  Approved: { bg: "#E7F8EF", color: "#16A34A" },
  Rejected: { bg: "#FEE2E2", color: "#DC2626" },
};

const EMPTY_TRANSFER_FORM = {
  toBranch: "",
  toDepartment: "",
  toDesignation: "",
  transferDate: "",
  effectiveDate: "",
  reason: "",
  notes: "",
};

function StatusPill({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  return (
    <span
      className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-md"
      style={{ backgroundColor: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

function FromToPair({ fromLabel = "From", toLabel = "To", fromValue, toValue }) {
  return (
    <div className="flex items-stretch gap-2.5">
      <div className="flex-1 min-w-0 rounded-xl bg-[#FEE2E2]/70 border border-[#FECACA] px-3.5 py-3">
        <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">{fromLabel}</p>
        <p className="text-[13px] font-bold text-[#111827] mt-1 leading-snug break-words">{fromValue || "—"}</p>
      </div>
      <div className="shrink-0 self-center text-[#16A34A]">
        <ArrowRight size={18} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0 rounded-xl bg-[#DCFCE7]/80 border border-[#BBF7D0] px-3.5 py-3">
        <p className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wide">{toLabel}</p>
        <p className="text-[13px] font-bold text-[#111827] mt-1 leading-snug break-words">{toValue || "—"}</p>
      </div>
    </div>
  );
}

function DateField({ label, value }) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <span className="size-8 rounded-lg bg-[#F3F4F6] text-[#6B7280] grid place-items-center shrink-0 mt-0.5">
        <CalendarDays size={14} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-[#6B7280]">{label}</p>
        <p className="text-[13px] font-bold text-[#111827] mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}

function MetaBlock({ icon: Icon, label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-bold text-[#6B7280] flex items-center gap-1.5">
        <Icon size={13} className="text-[#9CA3AF]" />
        {label}
      </p>
      <div className="text-[13px] text-[#111827] leading-relaxed">{children}</div>
    </div>
  );
}

function ChangeBlock({ title, fromLabel, toLabel, fromValue, toValue }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[11px] font-bold text-[#6B7280]">{title}</p>
      <FromToPair fromLabel={fromLabel} toLabel={toLabel} fromValue={fromValue} toValue={toValue} />
    </div>
  );
}

function initialsOf(name, fallback = "?") {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

function downloadAttachedDocument(row, kind = "document") {
  const fileName = row?.documentName || null;
  if (!fileName && !row?.documentUrl) {
    toast.info(`No document attached to this ${kind}.`);
    return;
  }

  if (row.documentUrl) {
    const link = document.createElement("a");
    link.href = row.documentUrl;
    link.download = fileName || `${kind}.pdf`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success(`"${fileName || kind}" download started.`);
    return;
  }

  const content = [
    fileName,
    row.employeeName ? `Employee: ${row.employeeName}` : "",
    row.previousDesignation ? `Previous: ${row.previousDesignation}` : "",
    row.newDesignation ? `New: ${row.newDesignation}` : "",
    row.promotionDate ? `Promotion date: ${row.promotionDate}` : "",
    row.effectiveDate ? `Effective date: ${row.effectiveDate}` : "",
    "",
    "Sample document from Make My Lagan Sales HRMS.",
  ]
    .filter(Boolean)
    .join("\n");

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || `${kind}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  toast.success(`"${fileName}" download started.`);
}

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[13px] font-bold text-[#111] mb-1.5">
      {children}
      {required ? <span className="text-[#DC2626]"> *</span> : null}
    </label>
  );
}

const inputClass =
  "w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] outline-none focus:border-[#7A0A17]/40 bg-white";
const textareaClass =
  "w-full border border-black/12 rounded-xl px-3.5 py-2.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40 resize-none";

function DocumentBrowseField({ fileName, onPick, onClear }) {
  return (
    <div>
      <FieldLabel>Documents</FieldLabel>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          placeholder="Select document file..."
          value={fileName || ""}
          className="flex-1 min-w-0 border border-black/12 rounded-xl px-3.5 h-11 outline-none bg-[#FAFAFB] text-[13px] text-[#374151]"
        />
        <label className="shrink-0 inline-flex items-center gap-1.5 border border-black/12 rounded-xl px-3.5 h-11 font-bold text-[13px] text-[#374151] cursor-pointer hover:bg-[#FAFAFB] transition-colors">
          <ImageIcon size={14} />
          Browse
          <input
            type="file"
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => onPick(e.target.files?.[0] || null)}
          />
        </label>
        {fileName ? (
          <button
            type="button"
            onClick={onClear}
            className="shrink-0 h-11 px-3 rounded-xl border border-black/12 text-[12px] font-semibold text-[#6B7280] hover:bg-[#FAFAFB]"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

function TransferRequestModal({ open, onClose, employee, record, onSaved }) {
  const isEdit = !!record;
  const [form, setForm] = useState(EMPTY_TRANSFER_FORM);
  const [documentFile, setDocumentFile] = useState(null);
  const [existingDocName, setExistingDocName] = useState(null);

  useEffect(() => {
    if (!open) return;
    if (record) {
      setForm({
        toBranch: record.toBranch || "",
        toDepartment: record.toDepartment || "",
        toDesignation: record.toDesignation || "",
        transferDate: record.transferDate || "",
        effectiveDate: record.effectiveDate || "",
        reason: record.reason || "",
        notes: record.notes || "",
      });
      setExistingDocName(record.documentName || null);
      setDocumentFile(null);
    } else {
      setForm({
        ...EMPTY_TRANSFER_FORM,
        toDepartment: employee?.department || "",
        toDesignation: employee?.designation || "",
      });
      setExistingDocName(null);
      setDocumentFile(null);
    }
  }, [open, record, employee]);

  const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    if (!form.toBranch) {
      toast.error("Please select a destination branch.");
      return;
    }
    if (!form.transferDate || !form.effectiveDate) {
      toast.error("Transfer date and effective date are required.");
      return;
    }
    if (form.effectiveDate < form.transferDate) {
      toast.error("Effective date cannot be before transfer date.");
      return;
    }

    const docName = documentFile?.name || existingDocName || null;

    if (isEdit) {
      updateTransfer(record.id, {
        toBranch: form.toBranch,
        toDepartment: form.toDepartment || record.fromDepartment,
        toDesignation: form.toDesignation || record.fromDesignation,
        transferDate: form.transferDate,
        effectiveDate: form.effectiveDate,
        reason: form.reason,
        notes: form.notes,
        documentName: docName,
      });
      toast.success("Transfer request updated.");
    } else {
      submitTransfer({
        employeeName: employee.name,
        employeeId: employee.id,
        employeeEmail: employee.email,
        fromBranch: employee.branch || "South Extension",
        toBranch: form.toBranch,
        fromDepartment: employee.department || "Sales",
        toDepartment: form.toDepartment || employee.department || "Sales",
        fromDesignation: employee.designation || "Sales Manager",
        toDesignation: form.toDesignation || employee.designation || "Sales Manager",
        transferDate: form.transferDate,
        effectiveDate: form.effectiveDate,
        reason: form.reason,
        notes: form.notes,
        documentName: docName,
        documentUrl: null,
      });
      toast.success("Transfer request submitted. Your manager has been notified.");
    }
    onSaved?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Transfer Request" : "Submit Transfer Request"}
      subtitle={
        isEdit
          ? "Update your pending transfer details and supporting document."
          : "Request a branch, department, or designation transfer for yourself."
      }
      icon={<ArrowLeftRight size={16} />}
      iconBg="#E8F2FE"
      iconColor="#2563EB"
      width="max-w-xl"
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
            onClick={handleSave}
            className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            {isEdit ? "Save Changes" : "Submit Request"}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <FieldLabel>Employee</FieldLabel>
          <input
            type="text"
            readOnly
            value={employee?.name || ""}
            className={`${inputClass} bg-[#FAFAFB] text-[#6B7280]`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>To Branch</FieldLabel>
            <select
              value={form.toBranch}
              onChange={(e) => setField("toBranch", e.target.value)}
              className={inputClass}
            >
              <option value="">Select to branch</option>
              {BRANCH_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>To Department</FieldLabel>
            <select
              value={form.toDepartment}
              onChange={(e) => setField("toDepartment", e.target.value)}
              className={inputClass}
            >
              <option value="">Select department</option>
              {DEPARTMENT_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <FieldLabel>To Designation</FieldLabel>
          <select
            value={form.toDesignation}
            onChange={(e) => setField("toDesignation", e.target.value)}
            className={inputClass}
          >
            <option value="">Select to designation</option>
            {DESIGNATION_OPTIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Transfer Date</FieldLabel>
            <input
              type="date"
              value={form.transferDate}
              onChange={(e) => setField("transferDate", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <FieldLabel required>Effective Date</FieldLabel>
            <input
              type="date"
              value={form.effectiveDate}
              onChange={(e) => setField("effectiveDate", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <FieldLabel>Reason</FieldLabel>
          <textarea
            value={form.reason}
            onChange={(e) => setField("reason", e.target.value)}
            rows={3}
            placeholder="e.g. Business expansion, Employee request"
            className={textareaClass}
          />
        </div>

        <DocumentBrowseField
          fileName={documentFile?.name || existingDocName}
          onPick={setDocumentFile}
          onClear={() => {
            setDocumentFile(null);
            setExistingDocName(null);
          }}
        />
      </div>
    </Modal>
  );
}

export function PromotionDetailsModal({ open, onClose, record }) {
  if (!record) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Promotion Details"
      icon={<BarChart3 size={17} />}
      iconBg="#E7F8EF"
      iconColor="#16A34A"
      width="max-w-lg"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="size-11 rounded-full bg-[#7A0A17] text-white grid place-items-center text-[13px] font-bold shrink-0">
              {record.employeeInitials || initialsOf(record.employeeName)}
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-[#9CA3AF]">Employee</p>
              <p className="text-[14px] font-bold text-[#111827] truncate">{record.employeeName}</p>
            </div>
          </div>
          <StatusPill status={record.status} />
        </div>

        <ChangeBlock
          title="Designation Change"
          fromLabel="Previous"
          toLabel="New"
          fromValue={record.previousDesignation}
          toValue={record.newDesignation}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateField label="Promotion Date" value={record.promotionDate} />
          <DateField label="Effective Date" value={record.effectiveDate} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold text-[#6B7280]">Document</p>
          <div className="min-h-[88px] rounded-xl bg-[#F3F4F6] border border-black/6 grid place-items-center px-4">
            {record.documentName ? (
              <button
                type="button"
                onClick={() => downloadAttachedDocument(record, "promotion")}
                className="flex items-center gap-2 text-[13px] font-semibold text-[#3B82F6] hover:underline"
              >
                <FileText size={16} />
                {record.documentName}
              </button>
            ) : (
              <span className="text-[12px] text-[#9CA3AF]">No document attached</span>
            )}
          </div>
        </div>

        <MetaBlock icon={FileText} label="Reason for Promotion">
          {record.reason || "—"}
        </MetaBlock>
      </div>
    </Modal>
  );
}

export function TransferDetailsModal({ open, onClose, record }) {
  if (!record) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Transfer Details"
      icon={<BarChart3 size={17} />}
      iconBg="#E7F8EF"
      iconColor="#16A34A"
      width="max-w-lg"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-[#9CA3AF]">Employee</p>
            <p className="text-[14px] font-bold text-[#111827] truncate">{record.employeeName}</p>
            <p className="text-[12px] text-[#6B7280]">{record.employeeEmail || record.employeeId}</p>
          </div>
          <StatusPill status={record.status} />
        </div>

        <MetaBlock icon={Info} label="Transfer Type">
          <span className="font-semibold">{getTransferType(record)}</span>
        </MetaBlock>

        <ChangeBlock title="Branch Transfer" fromValue={record.fromBranch} toValue={record.toBranch} />
        <ChangeBlock
          title="Department Transfer"
          fromValue={record.fromDepartment}
          toValue={record.toDepartment}
        />
        <ChangeBlock
          title="Designation Transfer"
          fromValue={record.fromDesignation}
          toValue={record.toDesignation}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateField label="Transfer Date" value={record.transferDate} />
          <DateField label="Effective Date" value={record.effectiveDate} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-bold text-[#6B7280]">Document</p>
          <div className="min-h-[72px] rounded-xl bg-[#F3F4F6] border border-black/6 grid place-items-center px-4">
            {record.documentName ? (
              <button
                type="button"
                onClick={() => downloadAttachedDocument(record, "transfer")}
                className="flex items-center gap-2 text-[13px] font-semibold text-[#3B82F6] hover:underline"
              >
                <FileText size={16} />
                {record.documentName}
              </button>
            ) : (
              <span className="text-[12px] text-[#9CA3AF]">No document attached</span>
            )}
          </div>
        </div>

        <MetaBlock icon={FileText} label="Reason">
          {record.reason || "—"}
        </MetaBlock>

        <MetaBlock icon={StickyNote} label="Notes">
          {record.notes || "—"}
        </MetaBlock>
      </div>
    </Modal>
  );
}

function KpiCards({ records, kind }) {
  const pending = records.filter((r) => r.status === "Pending").length;
  const approved = records.filter((r) => r.status === "Approved").length;
  const rejected = records.filter((r) => r.status === "Rejected").length;

  const cards = [
    { label: `Total ${kind}`, value: String(records.length), sub: "On your record" },
    { label: "Pending", value: String(pending), sub: "Awaiting decision" },
    { label: "Approved", value: String(approved), sub: "Confirmed moves" },
    { label: "Rejected", value: String(rejected), sub: "Not approved" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm">
          <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">{card.label}</p>
          <p className="text-xl font-extrabold text-[#111827] mt-1.5">{card.value}</p>
          <p className="text-[12.5px] text-[#6B7280] mt-1">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, description, icon: Icon, action }) {
  return (
    <div className="bg-white border border-black/10 rounded-2xl p-10 text-center shadow-sm">
      <div className="size-14 rounded-2xl bg-[#FCF5F6] border border-[#7A0A17]/15 text-[#7A0A17] grid place-items-center mx-auto mb-4">
        <Icon size={24} />
      </div>
      <h3 className="text-base font-extrabold text-[#111827]">{title}</h3>
      <p className="text-[13px] text-[#6B7280] mt-1.5 max-w-sm mx-auto leading-relaxed">{description}</p>
      {action}
    </div>
  );
}

export function PromotionSection({ employee, showAll = false }) {
  const [selected, setSelected] = useState(null);
  const records = useMemo(() => {
    if (showAll) return getAllPromotions();
    return getPromotionsFor(employee?.name);
  }, [employee?.name, showAll]);

  const handleDocClick = (row) => {
    downloadAttachedDocument(row, "promotion");
  };

  return (
    <div className="flex flex-col gap-5">
      <KpiCards records={records} kind="promotions" />

      {records.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No promotions yet"
          description="When HR records a promotion for you, designation changes, dates, and reason will appear here."
        />
      ) : (
        <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="size-9 rounded-full bg-[#E7F8EF] text-[#16A34A] grid place-items-center">
              <TrendingUp size={16} />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-[#111827]">Employee Promotions</h3>
              <p className="text-[12.5px] text-[#6B7280]">Designation changes synced from HRMS</p>
            </div>
          </div>

          <div className="overflow-x-auto border border-black/8 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFAFB] border-b border-black/8">
                  {[
                    "#",
                    "Employee",
                    "Previous",
                    "New",
                    "Promotion Date",
                    "Effective Date",
                    "Status",
                    "Document",
                    "Action",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11px] font-bold text-[#6B7280] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
                {records.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-[#FAFAFB] transition-colors">
                    <td className="px-4 py-3 font-bold text-[#6B7280]">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="size-8 rounded-full bg-[#7A0A17] text-white grid place-items-center text-[10px] font-bold shrink-0">
                          {row.employeeInitials || initialsOf(row.employeeName)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold truncate">{row.employeeName}</p>
                          <p className="text-[#9CA3AF] font-medium">{row.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{row.previousDesignation}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{row.newDesignation}</td>
                    <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{row.promotionDate}</td>
                    <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{row.effectiveDate}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleDocClick(row)}
                        className={`size-8 rounded-lg grid place-items-center transition-colors ${
                          row.documentName || row.documentUrl
                            ? "bg-[#E8F2FE] hover:bg-[#DBEAFE] text-[#2563EB]"
                            : "bg-[#F3F4F6] text-[#9CA3AF] cursor-default"
                        }`}
                        aria-label={row.documentName ? "Download document" : "No document"}
                        title={row.documentName || "No document"}
                      >
                        <FileText size={14} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setSelected(row)}
                        className="size-8 rounded-lg bg-[#EEF0FE] hover:bg-[#E0E7FF] text-[#4338CA] grid place-items-center transition-colors"
                        aria-label="View promotion details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <PromotionDetailsModal open={!!selected} onClose={() => setSelected(null)} record={selected} />
    </div>
  );
}

export function TransferSection({ employee, showAll = false }) {
  const [selected, setSelected] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshKey forces a re-read from storage
  const records = useMemo(() => {
    if (showAll) return getAllTransfers();
    return getTransfersFor(employee?.name);
  }, [employee?.name, showAll, refreshKey]);

  const openSubmit = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (row) => {
    if (row.status !== "Pending") {
      toast.info("Only pending transfer requests can be edited.");
      return;
    }
    setEditing(row);
    setFormOpen(true);
  };

  const handleDocClick = (row) => {
    downloadAttachedDocument(row, "transfer");
  };

  return (
    <div className="flex flex-col gap-5">
      <KpiCards records={records} kind="transfers" />

      {records.length === 0 ? (
        <EmptyState
          icon={ArrowLeftRight}
          title="No transfers yet"
          description="Submit a transfer request for yourself. Branch, department, and designation changes will show here after review."
          action={
            <button
              type="button"
              onClick={openSubmit}
              className="mt-5 h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-bold hover:bg-[#640712] transition-colors inline-flex items-center gap-2"
            >
              <Plus size={15} />
              Submit Transfer Request
            </button>
          }
        />
      ) : (
        <div className="bg-white border border-black/10 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <span className="size-9 rounded-full bg-[#E8F2FE] text-[#2563EB] grid place-items-center">
                <ArrowLeftRight size={16} />
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-[#111827]">Employee Transfers</h3>
                <p className="text-[12.5px] text-[#6B7280]">Your transfer requests and HR decisions</p>
              </div>
            </div>
            <button
              type="button"
              onClick={openSubmit}
              className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-bold hover:bg-[#640712] transition-colors inline-flex items-center gap-2"
            >
              <Plus size={15} />
              Submit Transfer Request
            </button>
          </div>

          <div className="overflow-x-auto border border-black/8 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAFAFB] border-b border-black/8">
                  {[
                    "Employee",
                    "Transfer Type",
                    "From → To",
                    "Transfer Date",
                    "Effective Date",
                    "Status",
                    "Documents",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-[11px] font-bold text-[#6B7280] whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/6 font-semibold text-[#111827]">
                {records.map((row) => (
                  <tr key={row.id} className="hover:bg-[#FAFAFB] transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-bold">{row.employeeName}</p>
                      <p className="text-[#9CA3AF] font-medium">{row.employeeEmail || row.employeeId}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[#374151]">{getTransferType(row)}</td>
                    <td className="px-4 py-3 min-w-[220px]">
                      <p className="font-bold">
                        {row.fromBranch} → {row.toBranch}
                      </p>
                      <p className="text-[#6B7280] font-medium">
                        {row.fromDepartment} → {row.toDepartment}
                      </p>
                      <p className="text-[#6B7280] font-medium">
                        {row.fromDesignation} → {row.toDesignation}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{row.transferDate}</td>
                    <td className="px-4 py-3 text-[#6B7280] whitespace-nowrap">{row.effectiveDate}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={row.status} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleDocClick(row)}
                        className={`size-8 rounded-lg grid place-items-center transition-colors ${
                          row.documentName
                            ? "bg-[#E8F2FE] hover:bg-[#DBEAFE] text-[#2563EB]"
                            : "bg-[#F3F4F6] text-[#9CA3AF] cursor-default"
                        }`}
                        aria-label={row.documentName ? "Download document" : "No document"}
                        title={row.documentName || "No document"}
                      >
                        <FileText size={14} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelected(row)}
                          className="size-8 rounded-lg bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#D97706] grid place-items-center transition-colors"
                          aria-label="View transfer"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(row)}
                          disabled={row.status !== "Pending"}
                          className={`size-8 rounded-lg grid place-items-center transition-colors ${
                            row.status === "Pending"
                              ? "bg-[#E8F2FE] hover:bg-[#DBEAFE] text-[#2563EB]"
                              : "bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed opacity-60"
                          }`}
                          aria-label="Edit transfer"
                          title={row.status === "Pending" ? "Edit" : "Only pending can be edited"}
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TransferDetailsModal open={!!selected} onClose={() => setSelected(null)} record={selected} />

      <TransferRequestModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        employee={employee}
        record={editing}
        onSaved={() => {
          setFormOpen(false);
          setEditing(null);
          setRefreshKey((k) => k + 1);
        }}
      />
    </div>
  );
}
