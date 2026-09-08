/** Demo promotion & transfer records synced from HRMS (sales employee view). */

const TRANSFER_STORAGE_KEY = "mml_sales_transfers_v1";

export const MOVE_STATUSES = ["Pending", "Approved", "Rejected"];

export const BRANCH_OPTIONS = [
  "South Extension",
  "Rajouri Garden",
  "Connaught Place",
  "Business Park",
  "Main Office",
];

export const DEPARTMENT_OPTIONS = [
  "Sales",
  "Marketing",
  "Operations",
  "Finance & Accounting",
  "Information Technology",
  "HR",
];

export const DESIGNATION_OPTIONS = [
  "Sales Executive",
  "Relationship Manager",
  "Sales Manager",
  "Senior Sales Manager",
  "Regional Sales Head",
  "Brand Manager",
  "IT Manager",
  "Operations Manager",
];

const DEFAULT_PROMOTIONS = [
  {
    id: "p1",
    employeeName: "Ankur Sharma",
    employeeId: "MML-E-1001",
    employeeInitials: "AS",
    previousDesignation: "Relationship Manager",
    newDesignation: "Sales Manager",
    promotionDate: "2026-01-10",
    effectiveDate: "2026-02-01",
    status: "Approved",
    reason: "Consistently exceeded quarterly targets and led Premium matchmaking handovers.",
    documentUrl: null,
    documentName: "promotion-letter-2026.pdf",
  },
  {
    id: "p2",
    employeeName: "Ankur Sharma",
    employeeId: "MML-E-1001",
    employeeInitials: "AS",
    previousDesignation: "Sales Executive",
    newDesignation: "Relationship Manager",
    promotionDate: "2025-06-15",
    effectiveDate: "2025-07-01",
    status: "Approved",
    reason: "Strong pipeline conversion and client satisfaction scores across South Extension.",
    documentUrl: null,
    documentName: "promotion-letter-2025.pdf",
  },
  {
    id: "p3",
    employeeName: "Ankur Sharma",
    employeeId: "MML-E-1001",
    employeeInitials: "AS",
    previousDesignation: "Sales Manager",
    newDesignation: "Regional Sales Head",
    promotionDate: "2026-08-20",
    effectiveDate: "2026-09-01",
    status: "Pending",
    reason: "Proposed after Q2 review for regional leadership readiness.",
    documentUrl: null,
    documentName: "promotion-proposal-q2.pdf",
  },
  {
    id: "p4",
    employeeName: "Ankur Sharma",
    employeeId: "MML-E-1001",
    employeeInitials: "AS",
    previousDesignation: "Sales Manager",
    newDesignation: "National Sales Head",
    promotionDate: "2026-03-01",
    effectiveDate: "2026-04-01",
    status: "Rejected",
    reason: "Role not open this cycle; revisit after completing regional targets.",
    documentUrl: null,
    documentName: "promotion-review-notes.pdf",
  },
];

const DEFAULT_TRANSFERS = [
  {
    id: "t1",
    employeeName: "Ankur Sharma",
    employeeId: "MML-E-1001",
    employeeEmail: "ankur@makemylagan.com",
    fromBranch: "South Extension",
    toBranch: "Rajouri Garden",
    fromDepartment: "Sales",
    toDepartment: "Sales",
    fromDesignation: "Sales Manager",
    toDesignation: "Sales Manager",
    transferDate: "2026-07-10",
    effectiveDate: "2026-08-01",
    status: "Approved",
    reason: "Business need to strengthen West Delhi premium desk coverage.",
    notes: "Handover South Extension active deals to Priya before effective date.",
    documentUrl: null,
    documentName: "transfer-order-t1.pdf",
  },
  {
    id: "t2",
    employeeName: "Ankur Sharma",
    employeeId: "MML-E-1001",
    employeeEmail: "ankur@makemylagan.com",
    fromBranch: "Rajouri Garden",
    toBranch: "Connaught Place",
    fromDepartment: "Sales",
    toDepartment: "Sales",
    fromDesignation: "Sales Manager",
    toDesignation: "Senior Sales Manager",
    transferDate: "2026-08-25",
    effectiveDate: "2026-09-15",
    status: "Pending",
    reason: "Requested transfer closer to key corporate accounts.",
    notes: "Awaiting branch head confirmation.",
    documentUrl: null,
    documentName: "transfer-request-t2.pdf",
  },
  {
    id: "t3",
    employeeName: "Ankur Sharma",
    employeeId: "MML-E-1001",
    employeeEmail: "ankur@makemylagan.com",
    fromBranch: "South Extension",
    toBranch: "Business Park",
    fromDepartment: "Sales",
    toDepartment: "Marketing",
    fromDesignation: "Sales Manager",
    toDesignation: "Brand Manager",
    transferDate: "2026-04-01",
    effectiveDate: "2026-05-01",
    status: "Rejected",
    reason: "Cross-function move deferred; sales bandwidth required this quarter.",
    notes: "—",
    documentUrl: null,
    documentName: null,
  },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeName(name) {
  return String(name || "")
    .trim()
    .toLowerCase();
}

function initialsOf(name, fallback = "?") {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
}

function readTransfers() {
  try {
    const raw = localStorage.getItem(TRANSFER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* ignore */
  }
  writeTransfers(DEFAULT_TRANSFERS);
  return [...DEFAULT_TRANSFERS];
}

function writeTransfers(list) {
  try {
    localStorage.setItem(TRANSFER_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function getTransferType(record) {
  if (!record) return "—";
  const parts = [];
  if (record.fromBranch !== record.toBranch) parts.push("Branch");
  if (record.fromDepartment !== record.toDepartment) parts.push("Department");
  if (record.fromDesignation !== record.toDesignation) parts.push("Designation");
  return parts.length ? parts.join(", ") : "No change";
}

export function getAllPromotions() {
  return [...DEFAULT_PROMOTIONS];
}

export function getAllTransfers() {
  return readTransfers();
}

export function getPromotionsFor(employeeName) {
  const key = normalizeName(employeeName);
  if (!key) return [];
  return DEFAULT_PROMOTIONS.filter((row) => normalizeName(row.employeeName) === key);
}

export function getTransfersFor(employeeName) {
  const key = normalizeName(employeeName);
  if (!key) return [];
  return readTransfers().filter((row) => normalizeName(row.employeeName) === key);
}

export function submitTransfer({
  employeeName,
  employeeId,
  employeeEmail,
  fromBranch,
  toBranch,
  fromDepartment,
  toDepartment,
  fromDesignation,
  toDesignation,
  transferDate,
  effectiveDate,
  reason,
  notes,
  documentName,
  documentUrl,
}) {
  const list = readTransfers();
  const record = {
    id: `t${Date.now()}`,
    employeeName,
    employeeId,
    employeeEmail: employeeEmail || "",
    employeeInitials: initialsOf(employeeName),
    fromBranch: fromBranch || "",
    toBranch: toBranch || "",
    fromDepartment: fromDepartment || "",
    toDepartment: toDepartment || fromDepartment || "",
    fromDesignation: fromDesignation || "",
    toDesignation: toDesignation || fromDesignation || "",
    transferDate: transferDate || todayISO(),
    effectiveDate: effectiveDate || todayISO(),
    status: "Pending",
    reason: reason?.trim() || "",
    notes: notes?.trim() || "",
    documentName: documentName || null,
    documentUrl: documentUrl || null,
  };
  writeTransfers([record, ...list]);
  return record;
}

export function updateTransfer(id, patch) {
  const list = readTransfers();
  const next = list.map((r) => {
    if (r.id !== id) return r;
    return {
      ...r,
      ...patch,
      reason: patch.reason !== undefined ? String(patch.reason).trim() : r.reason,
      notes: patch.notes !== undefined ? String(patch.notes).trim() : r.notes,
    };
  });
  writeTransfers(next);
  return next.find((r) => r.id === id) || null;
}
