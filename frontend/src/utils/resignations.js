const STORAGE_KEY = "mml_sales_exits_v3";

export const RESIGNATION_STAGES = [
  "Submitted",
  "Under Review",
  "Approved",
  "Notice Period",
  "Clearance",
  "Completed",
];

export const CLOSED_STATUSES = ["Completed", "Withdrawn", "Rejected"];

export const REASON_OPTIONS = [
  "Career growth / new opportunity",
  "Higher studies",
  "Relocation",
  "Compensation",
  "Health / personal reasons",
  "Work environment",
  "Other",
];

export const NOTICE_PERIOD_OPTIONS = [15, 30, 45, 60, 90];

export const CLEARANCE_ITEMS = [
  { key: "manager", label: "Manager sign-off", hint: "Handover & approval from reporting manager" },
  { key: "it", label: "IT assets returned", hint: "Laptop, access cards, software licenses" },
  { key: "finance", label: "Finance settlement", hint: "Advances, reimbursements, F&F" },
  { key: "admin", label: "Admin / ID card handover", hint: "Employee ID, parking & office access" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + Number(days || 0));
  return d.toISOString().slice(0, 10);
}

const DEFAULT_RESIGNATIONS = [
  {
    id: "r0",
    employeeName: "Ankur Sharma",
    employeeId: "MML-E-1001",
    department: "Sales",
    designation: "Sales Manager",
    submittedOn: "2026-08-10",
    reason: "Health / personal reasons",
    reasonDetails: "Need time to focus on personal health and family priorities. Happy to complete a full handover.",
    requestedLastDay: "2026-09-09",
    noticePeriodDays: 30,
    approvedLastDay: "2026-09-09",
    status: "Clearance",
    clearance: { manager: true, it: true, finance: false, admin: false },
    hrNote: "Please complete Finance settlement and Admin handover before last working day.",
    timeline: [
      { status: "Submitted", date: "2026-08-10", note: "Exit request submitted by employee." },
      { status: "Under Review", date: "2026-08-11", note: "Reviewed by reporting manager. Handover plan discussed.", by: "Reporting Manager" },
      { status: "Approved", date: "2026-08-13", note: "Exit approved. Notice period confirmed at 30 days.", by: "Reporting Manager" },
      { status: "Notice Period", date: "2026-08-13", note: "Serving notice period. Knowledge transfer started with sales team.", by: "Reporting Manager" },
      { status: "Clearance", date: "2026-09-02", note: "Clearance initiated. Manager & IT sign-off completed.", by: "Reporting Manager" },
    ],
  },
  {
    id: "r1",
    employeeName: "Priya Raheja",
    employeeId: "MML-E-1042",
    department: "Sales",
    designation: "Relationship Manager",
    submittedOn: "2026-07-12",
    reason: "Career growth / new opportunity",
    reasonDetails: "Accepted an offer at another firm; happy to help with a smooth handover.",
    requestedLastDay: "2026-08-11",
    noticePeriodDays: 30,
    approvedLastDay: "2026-08-11",
    status: "Notice Period",
    clearance: { manager: true, it: false, finance: false, admin: false },
    hrNote: "Handover to Rahul in progress.",
    timeline: [
      { status: "Submitted", date: "2026-07-12", note: "Exit request submitted by employee." },
      { status: "Under Review", date: "2026-07-13", note: "Reviewed by reporting manager." },
      { status: "Approved", date: "2026-07-15", note: "Approved. Notice period confirmed at 30 days.", by: "Reporting Manager" },
      { status: "Notice Period", date: "2026-07-15", note: "Now serving notice period.", by: "Reporting Manager" },
    ],
  },
  {
    id: "r2",
    employeeName: "Dev Malhotra",
    employeeId: "MML-E-1108",
    department: "Sales",
    designation: "Senior Sales Executive",
    submittedOn: "2026-06-02",
    reason: "Relocation",
    reasonDetails: "Relocating to another city for family reasons.",
    requestedLastDay: "2026-07-02",
    noticePeriodDays: 30,
    approvedLastDay: "2026-07-02",
    status: "Completed",
    clearance: { manager: true, it: true, finance: true, admin: true },
    hrNote: "Full and final settlement processed.",
    timeline: [
      { status: "Submitted", date: "2026-06-02", note: "Exit request submitted by employee." },
      { status: "Under Review", date: "2026-06-03", note: "Reviewed by reporting manager." },
      { status: "Approved", date: "2026-06-04", note: "Approved.", by: "Reporting Manager" },
      { status: "Notice Period", date: "2026-06-04", note: "Serving notice period.", by: "Reporting Manager" },
      { status: "Clearance", date: "2026-06-30", note: "All clearances completed.", by: "Reporting Manager" },
      { status: "Completed", date: "2026-07-02", note: "Exit process completed. Full and final settlement done.", by: "Reporting Manager" },
    ],
  },
  {
    id: "r3",
    employeeName: "Neha Kapoor",
    employeeId: "MML-E-1176",
    department: "Sales",
    designation: "Sales Executive",
    submittedOn: "2026-08-20",
    reason: "Higher studies",
    reasonDetails: "Pursuing a full-time management program.",
    requestedLastDay: "2026-09-19",
    noticePeriodDays: 30,
    approvedLastDay: null,
    status: "Submitted",
    clearance: { manager: false, it: false, finance: false, admin: false },
    hrNote: "",
    timeline: [
      { status: "Submitted", date: "2026-08-20", note: "Exit request submitted by employee." },
    ],
  },
];

export function readResignations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RESIGNATIONS));
      return DEFAULT_RESIGNATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_RESIGNATIONS;
  } catch {
    return DEFAULT_RESIGNATIONS;
  }
}

function writeResignations(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function isOpenStatus(status) {
  return !CLOSED_STATUSES.includes(status);
}

export function getActiveResignationFor(employeeName) {
  return readResignations().find((r) => r.employeeName === employeeName && isOpenStatus(r.status)) || null;
}

export function getResignationHistoryFor(employeeName) {
  return readResignations()
    .filter((r) => r.employeeName === employeeName)
    .sort((a, b) => (a.submittedOn < b.submittedOn ? 1 : -1));
}

export function suggestLastWorkingDay(noticePeriodDays) {
  return addDaysISO(noticePeriodDays);
}

export function submitResignation({ employeeName, employeeId, department, designation, requestedLastDay, noticePeriodDays, reason, reasonDetails }) {
  const list = readResignations();
  const record = {
    id: `r${Date.now()}`,
    employeeName,
    employeeId,
    department,
    designation,
    submittedOn: todayISO(),
    reason,
    reasonDetails: reasonDetails?.trim() || "",
    requestedLastDay,
    noticePeriodDays,
    approvedLastDay: null,
    status: "Submitted",
    clearance: { manager: false, it: false, finance: false, admin: false },
    hrNote: "",
    timeline: [{ status: "Submitted", date: todayISO(), note: "Exit request submitted by employee." }],
  };
  writeResignations([record, ...list]);
  return record;
}

export function withdrawResignation(id) {
  const list = readResignations();
  const next = list.map((r) =>
    r.id === id
      ? {
          ...r,
          status: "Withdrawn",
          timeline: [...r.timeline, { status: "Withdrawn", date: todayISO(), note: "Exit request withdrawn by employee." }],
        }
      : r
  );
  writeResignations(next);
  return next.find((r) => r.id === id);
}

export function updateResignationStatus(id, { status, note, by = "HR", approvedLastDay }) {
  const list = readResignations();
  const next = list.map((r) => {
    if (r.id !== id) return r;
    return {
      ...r,
      status,
      approvedLastDay: approvedLastDay !== undefined ? approvedLastDay : r.approvedLastDay,
      timeline: [
        ...r.timeline,
        { status, date: todayISO(), note: note?.trim() || `Status updated to "${status}".`, by },
      ],
    };
  });
  writeResignations(next);
  return next.find((r) => r.id === id);
}

export function setClearanceItem(id, key, value) {
  const list = readResignations();
  const next = list.map((r) => (r.id === id ? { ...r, clearance: { ...r.clearance, [key]: value } } : r));
  writeResignations(next);
  return next.find((r) => r.id === id);
}
