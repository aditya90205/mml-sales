const EVENT = "mml-sales-tasks";

function pad2(n) {
  return String(n).padStart(2, "0");
}

export function toIsoDate(d = new Date()) {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return toIsoDate(new Date());
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function toDisplayDate(iso) {
  const [y, m, d] = String(iso || "").split("-");
  if (!y || !m || !d) return "07-12-26";
  return `${d}-${m}-${String(y).slice(-2)}`;
}

const STAGE_BY_COLUMN = {
  new: "New",
  "in-progress": "In Progress",
  review: "Review",
  blocked: "Blocked",
  done: "Done",
};

const COLUMN_BY_STAGE = {
  New: "new",
  "In Progress": "in-progress",
  Review: "review",
  Blocked: "blocked",
  Done: "done",
};

function makeTask(partial, columnId) {
  const stage = STAGE_BY_COLUMN[columnId] || "New";
  const rawAssignee = partial.assignee;
  const assignee = !rawAssignee || rawAssignee === "Unassigned" ? "" : rawAssignee;
  const dueDate = partial.dueDate || toIsoDate();
  return {
    id: partial.id || `task-${columnId}-${Math.random().toString(36).slice(2, 9)}`,
    title: partial.title,
    priority: partial.priority || "Medium",
    progress: partial.progress ?? 0,
    project: partial.project || "Sales Pipeline",
    date: partial.date || toDisplayDate(dueDate),
    overdue: Boolean(partial.overdue),
    assignee,
    assignees: partial.assignees?.length
      ? partial.assignees.filter((name) => name && name !== "Unassigned")
      : assignee
        ? [assignee]
        : [],
    stage,
    columnId,
    description:
      partial.description ||
      `Work on "${partial.title}" for ${partial.project || "the sales pipeline"}.`,
    milestone: partial.milestone || "Planning",
    isClientRelated: partial.isClientRelated ?? true,
    client: partial.client || "",
    startDate: partial.startDate || dueDate,
    dueDate,
    stars: partial.stars ?? 7,
    acknowledgedAt: partial.acknowledgedAt || "12-07-2026",
    assignedAt: partial.assignedAt || "12-07-2026",
    comments: partial.comments || [
      {
        author: "Priya Sharma",
        text: "Please prioritize this for the next client visit.",
        date: "2026-07-10T10:30:00",
      },
    ],
    checklist: partial.checklist || [
      { text: "Confirm client availability", done: true, assignee, dueDate: "12-07-2026" },
      { text: "Prepare discussion notes", done: false, assignee, dueDate: "12-07-2026" },
      { text: "Update CRM status", done: false, assignee, dueDate: "12-07-2026" },
      { text: "Share summary with RM", done: false, assignee, dueDate: "12-07-2026" },
    ],
    attachments: partial.attachments || [],
  };
}

const INITIAL_TASKS = [
  makeTask(
    {
      id: "t1",
      title: "Visit client — initial consultation",
      priority: "Critical",
      progress: 20,
      project: "South Delhi leads",
      assignee: "Rahul Verma",
      milestone: "Discovery",
    },
    "new"
  ),
  makeTask(
    {
      id: "t2",
      title: "Schedule home office visit",
      priority: "Medium",
      progress: 15,
      project: "Walk-in enquiries",
      assignee: "",
      milestone: "Discovery",
    },
    "new"
  ),
  makeTask(
    {
      id: "t3",
      title: "Matchmaking shortlist for Ananya",
      priority: "Critical",
      progress: 60,
      project: "Premium package",
      assignee: "Sana Iqbal",
      milestone: "Matching",
    },
    "in-progress"
  ),
  makeTask(
    {
      id: "t4",
      title: "Complete biodata & preference form",
      priority: "Medium",
      progress: 40,
      project: "Profile creation",
      assignee: "Sana Iqbal",
      milestone: "Onboarding",
    },
    "in-progress"
  ),
  makeTask(
    {
      id: "t5",
      title: "Verify KYC & family documents",
      priority: "Critical",
      progress: 75,
      project: "P5 Payment deals",
      assignee: "Dev Malhotra",
      overdue: true,
      milestone: "Compliance",
    },
    "review"
  ),
  makeTask(
    {
      id: "t6",
      title: "Review proposed matches with parents",
      priority: "Medium",
      progress: 55,
      project: "Video call / Visit",
      assignee: "",
      milestone: "Matching",
    },
    "review"
  ),
  makeTask(
    {
      id: "t7",
      title: "Awaiting discount approval",
      priority: "Low",
      progress: 20,
      project: "Negotiation desk",
      assignee: "Neha Kapoor",
      milestone: "Negotiation",
    },
    "blocked"
  ),
  makeTask(
    {
      id: "t8",
      title: "Follow up — client no response",
      priority: "Medium",
      progress: 25,
      project: "Warm leads",
      assignee: "",
      milestone: "Follow-up",
    },
    "blocked"
  ),
  makeTask(
    {
      id: "t9",
      title: "Handover to relationship manager",
      priority: "Low",
      progress: 100,
      project: "P6 Onboarding",
      assignee: "Ishaan Roy",
      milestone: "Handover",
      dueDate: "2026-07-12",
    },
    "done"
  ),
  makeTask(
    {
      id: "t10",
      title: "Confirm meeting & send biodata pack",
      priority: "Low",
      progress: 100,
      project: "Matchmaking",
      assignee: "Ishaan Roy",
      milestone: "Matching",
    },
    "done"
  ),
];

let tasks = INITIAL_TASKS.map((t) => ({ ...t }));

function emit() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}

export function readTasks() {
  return tasks.map((t) => ({ ...t }));
}

export function writeTasks(next) {
  tasks = Array.isArray(next) ? next.map((t) => ({ ...t })) : [];
  emit();
  return readTasks();
}

export function subscribeTasks(onChange) {
  if (typeof window === "undefined") return () => {};
  const handler = () => onChange();
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}

export function isDueToday(task) {
  const todayIso = toIsoDate();
  const todayDisplay = toDisplayDate(todayIso);
  if (task?.dueDate === todayIso) return true;
  return String(task?.date || "") === todayDisplay;
}

export function isHighPriority(task) {
  return task?.priority === "High" || task?.priority === "Critical";
}

export function applyFormToTask(existing, form) {
  const stage = form.stage || existing?.stage || "New";
  const columnId = COLUMN_BY_STAGE[stage] || existing?.columnId || "new";
  const assignees = form.assignees?.length ? form.assignees : [];
  const assignee = assignees[0] || "";
  const attachments = form.attachment
    ? [{ name: form.attachment, size: existing?.attachments?.[0]?.size || "" }]
    : existing?.attachments || [];
  return {
    ...(existing || {}),
    id: existing?.id || `task-${Date.now()}`,
    title: form.title.trim(),
    description: form.description || "",
    priority: form.priority || "Low",
    taskType: form.taskType || "Client visit",
    branch: form.branch || "Rajouri Garden",
    assignees,
    assignee,
    isClientRelated: Boolean(form.isClientRelated),
    client: form.client || "",
    startDate: form.startDate,
    dueDate: form.dueDate,
    dueTime: form.dueTime || "11:00",
    estimatedEffort: form.estimatedEffort || "30 mins",
    repeats: form.repeats || "Does not repeat",
    date: form.dueDate
      ? form.dueDate.split("-").reverse().map((p, i) => (i === 2 ? p.slice(-2) : p)).join("-")
      : existing?.date || "",
    stars: form.stars ?? 3,
    reminderChannels: form.reminderChannels || [],
    messageTemplate: form.messageTemplate || "",
    messageBody: form.messageBody || "",
    reminderFrequency: form.reminderFrequency || "On day of task",
    specialInstructions: form.specialInstructions || "",
    referenceLink: form.referenceLink || "",
    attachment: form.attachment || "",
    stage,
    columnId,
    project: existing?.project || "Sales Pipeline",
    progress: existing?.progress ?? (stage === "Done" ? 100 : 20),
    milestone: existing?.milestone || "Planning",
    acknowledgedAt: existing?.acknowledgedAt || form.startDate,
    assignedAt: existing?.assignedAt || form.startDate,
    comments: existing?.comments || [],
    checklist: form.checklist?.length ? form.checklist : existing?.checklist || [],
    attachments,
    overdue: existing?.overdue || false,
  };
}

export function addTaskFromForm(form) {
  const created = applyFormToTask(null, { ...form, stage: form.stage || "New" });
  tasks = [created, ...tasks];
  emit();
  return created;
}

export function getTodayTaskStats() {
  const today = tasks.filter(isDueToday);
  return {
    total: today.length,
    high: today.filter(isHighPriority).length,
  };
}
