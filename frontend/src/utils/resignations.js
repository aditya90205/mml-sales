const STORAGE_KEY = "mml_sales_exits_v9";
const LEGACY_STORAGE_KEYS = [
  "mml_sales_exits_v3",
  "mml_sales_exits_v4",
  "mml_sales_exits_v5",
  "mml_sales_exits_v6",
  "mml_sales_exits_v7",
  "mml_sales_exits_v8",
];

export const RESIGNATION_STAGES = [
  "Submitted",
  "Under Review",
  "Approved",
  "Notice Period",
  "Clearance",
  "Completed",
];

export const CLOSED_STATUSES = ["Completed", "Withdrawn", "Rejected"];

export const EXIT_TYPES = {
  RESIGNATION: "Resignation",
  TERMINATION: "Termination",
};

export const TERMINATION_CATEGORIES = [
  "Performance",
  "Policy violation",
  "Misconduct",
  "Role redundancy",
  "Integrity / compliance",
  "Other",
];

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
    exitType: EXIT_TYPES.TERMINATION,
    submittedOn: "2026-09-01",
    reason: "Performance",
    reasonDetails:
      "Consistent underperformance against monthly and quarterly targets despite coaching and PIP support.",
    salespersonComment:
      "Ankur has strong product knowledge and client rapport, but pipeline discipline slipped over the last 3 quarters. Follow-ups were irregular, forecast accuracy stayed below 60%, and coaching milestones on the PIP were missed twice. Recommend a clean handover of active deals to Priya before last working day.",
    terminatedBy: "Reporting Manager",
    terminationCategory: "Performance",
    requestedLastDay: "2026-10-01",
    noticePeriodDays: 30,
    approvedLastDay: "2026-10-01",
    status: "Notice Period",
    clearance: { manager: false, it: false, finance: false, admin: false },
    hrNote: "Complete client handover checklist and asset return before last working day.",
    timeline: [
      {
        status: "Submitted",
        date: "2026-09-01",
        note: "Termination initiated by management after PIP review.",
        by: "Reporting Manager",
      },
      {
        status: "Under Review",
        date: "2026-09-02",
        note: "Case reviewed with HR. Notice period confirmed at 30 days.",
        by: "HR",
      },
      {
        status: "Approved",
        date: "2026-09-03",
        note: "Termination approved. Last working day confirmed.",
        by: "Reporting Manager",
      },
      {
        status: "Notice Period",
        date: "2026-09-03",
        note: "Serving notice. Deal handover and client transition in progress.",
        by: "Reporting Manager",
      },
    ],
  },
  {
    id: "r-demo-resign",
    employeeName: "Ankur Sharma",
    employeeId: "MML-E-1001",
    department: "Sales",
    designation: "Sales Manager",
    exitType: EXIT_TYPES.RESIGNATION,
    submittedOn: "2026-08-18",
    reason: "Career growth / new opportunity",
    reasonDetails:
      "Received an offer aligned with long-term career goals. Happy to complete a full handover of active pipeline and key accounts.",
    salespersonComment: "",
    terminatedBy: null,
    terminationCategory: null,
    requestedLastDay: "2026-09-17",
    noticePeriodDays: 30,
    approvedLastDay: "2026-09-17",
    status: "Notice Period",
    clearance: { manager: true, it: false, finance: false, admin: false },
    hrNote: "Handover of South Extension accounts to Priya before last working day.",
    timeline: [
      { status: "Submitted", date: "2026-08-18", note: "Exit request submitted by employee." },
      { status: "Under Review", date: "2026-08-19", note: "Reviewed by reporting manager." },
      {
        status: "Approved",
        date: "2026-08-21",
        note: "Approved. Notice period confirmed at 30 days.",
        by: "Reporting Manager",
      },
      { status: "Notice Period", date: "2026-08-21", note: "Now serving notice period.", by: "Reporting Manager" },
    ],
  },
  {
    id: "r-demo-withdraw",
    employeeName: "Ankur Sharma",
    employeeId: "MML-E-1001",
    department: "Sales",
    designation: "Sales Manager",
    exitType: EXIT_TYPES.RESIGNATION,
    submittedOn: "2026-07-05",
    reason: "Health / personal reasons",
    reasonDetails: "Needed time for a family medical situation. Withdrew after discussing a flexible work arrangement.",
    salespersonComment: "",
    terminatedBy: null,
    terminationCategory: null,
    requestedLastDay: "2026-08-04",
    noticePeriodDays: 30,
    approvedLastDay: null,
    status: "Withdrawn",
    clearance: { manager: false, it: false, finance: false, admin: false },
    hrNote: "",
    timeline: [
      { status: "Submitted", date: "2026-07-05", note: "Exit request submitted by employee." },
      { status: "Under Review", date: "2026-07-06", note: "Manager scheduled a retention discussion." },
      {
        status: "Withdrawn",
        date: "2026-07-10",
        note: "Exit request withdrawn by employee after retention discussion.",
      },
    ],
  },
  {
    id: "r1",
    employeeName: "Priya Raheja",
    employeeId: "MML-E-1042",
    department: "Sales",
    designation: "Relationship Manager",
    exitType: EXIT_TYPES.RESIGNATION,
    submittedOn: "2026-07-12",
    reason: "Career growth / new opportunity",
    reasonDetails: "Accepted an offer at another firm; happy to help with a smooth handover.",
    salespersonComment: "",
    terminatedBy: null,
    terminationCategory: null,
    requestedLastDay: "2026-08-11",
    noticePeriodDays: 30,
    approvedLastDay: "2026-08-11",
    status: "Notice Period",
    clearance: { manager: true, it: false, finance: false, admin: false },
    hrNote: "Handover to Rahul in progress.",
    timeline: [
      { status: "Submitted", date: "2026-07-12", note: "Exit request submitted by employee." },
      { status: "Under Review", date: "2026-07-13", note: "Reviewed by reporting manager." },
      {
        status: "Approved",
        date: "2026-07-15",
        note: "Approved. Notice period confirmed at 30 days.",
        by: "Reporting Manager",
      },
      { status: "Notice Period", date: "2026-07-15", note: "Now serving notice period.", by: "Reporting Manager" },
    ],
  },
  {
    id: "r2",
    employeeName: "Dev Malhotra",
    employeeId: "MML-E-1108",
    department: "Sales",
    designation: "Senior Sales Executive",
    exitType: EXIT_TYPES.RESIGNATION,
    submittedOn: "2026-06-02",
    reason: "Relocation",
    reasonDetails: "Relocating to another city for family reasons.",
    salespersonComment: "",
    terminatedBy: null,
    terminationCategory: null,
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
      {
        status: "Completed",
        date: "2026-07-02",
        note: "Exit process completed. Full and final settlement done.",
        by: "Reporting Manager",
      },
    ],
  },
  {
    id: "r3",
    employeeName: "Neha Kapoor",
    employeeId: "MML-E-1176",
    department: "Sales",
    designation: "Sales Executive",
    exitType: EXIT_TYPES.RESIGNATION,
    submittedOn: "2026-08-20",
    reason: "Higher studies",
    reasonDetails: "Pursuing a full-time management program.",
    salespersonComment: "",
    terminatedBy: null,
    terminationCategory: null,
    requestedLastDay: "2026-09-19",
    noticePeriodDays: 30,
    approvedLastDay: null,
    status: "Submitted",
    clearance: { manager: false, it: false, finance: false, admin: false },
    hrNote: "",
    timeline: [{ status: "Submitted", date: "2026-08-20", note: "Exit request submitted by employee." }],
  },
];

export function readResignations() {
  try {
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
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

export function isTermination(record) {
  return record?.exitType === EXIT_TYPES.TERMINATION;
}

export const DEMO_EXIT_VIEWS = [
  { id: "termination", label: "Termination" },
  { id: "resignation", label: "Resignation" },
];

export function getLatestTerminationFor(employeeName) {
  return getResignationHistoryFor(employeeName).find((r) => isTermination(r)) || null;
}

export function getLatestResignationFor(employeeName) {
  const list = getResignationHistoryFor(employeeName).filter((r) => r.exitType === EXIT_TYPES.RESIGNATION);
  return list.find((r) => isOpenStatus(r.status)) || list[0] || null;
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

export function submitResignation({
  employeeName,
  employeeId,
  department,
  designation,
  requestedLastDay,
  noticePeriodDays,
  reason,
  reasonDetails,
}) {
  const list = readResignations();
  const record = {
    id: `r${Date.now()}`,
    employeeName,
    employeeId,
    department,
    designation,
    exitType: EXIT_TYPES.RESIGNATION,
    submittedOn: todayISO(),
    reason,
    reasonDetails: reasonDetails?.trim() || "",
    salespersonComment: "",
    terminatedBy: null,
    terminationCategory: null,
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

export function updateSalespersonComment(id, comment) {
  const list = readResignations();
  const next = list.map((r) =>
    r.id === id
      ? {
          ...r,
          salespersonComment: comment?.trim() || "",
        }
      : r
  );
  writeResignations(next);
  return next.find((r) => r.id === id);
}

export function withdrawResignation(id, note) {
  const list = readResignations();
  const rec = list.find((r) => r.id === id);
  if (!rec || isTermination(rec) || !isOpenStatus(rec.status)) return rec || null;

  const reason = note?.trim();
  const timelineNote = reason
    ? `Exit request withdrawn by employee. ${reason}`
    : "Exit request withdrawn by employee.";
  const next = list.map((r) =>
    r.id === id
      ? {
          ...r,
          status: "Withdrawn",
          withdrawNote: reason || "",
          timeline: [...r.timeline, { status: "Withdrawn", date: todayISO(), note: timelineNote }],
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
