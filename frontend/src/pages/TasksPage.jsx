import { useMemo, useState } from "react";
import {
  ChevronDown,
  Edit2,
  Eye,
  LayoutGrid,
  LayoutList,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import { toast } from "react-toastify";
import CreateTaskModal from "../components/calendar/CreateTaskModal";
import TaskDetailsModal from "../components/calendar/TaskDetailsModal";
import { SortableTh, useTableSort } from "../components/common/useTableSort.jsx";

/* ───────────────────────── Data ───────────────────────── */

const TASK_COLUMNS = [
  { id: "new", label: "New", color: "#E8395B" },
  { id: "in-progress", label: "In Progress", color: "#F59E0B" },
  { id: "review", label: "Review", color: "#3B82F6" },
  { id: "blocked", label: "Blocked", color: "#A855F7" },
  { id: "done", label: "Done", color: "#16A34A" },
];

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

const STAT_DEFS = [
  { id: "total", label: "Total Tasks", icon: Users, color: "#6366F1", bg: "#EEF0FE" },
  { id: "unassigned", label: "Unassigned", icon: UserX, color: "#E8395B", bg: "#FDECEE" },
  { id: "assigned", label: "Assigned", icon: UserCheck, color: "#F59E0B", bg: "#FFF3E4" },
  { id: "high", label: "High Priority", icon: UserPlus, color: "#16A34A", bg: "#E7F8EF" },
];

function isTaskUnassigned(task) {
  return !task.assignees?.length && (!task.assignee || task.assignee === "Unassigned");
}

function matchesKpiFilter(task, kpiFilter) {
  if (!kpiFilter || kpiFilter === "total") return true;
  if (kpiFilter === "unassigned") return isTaskUnassigned(task);
  if (kpiFilter === "assigned") return !isTaskUnassigned(task);
  if (kpiFilter === "high") return task.priority === "High" || task.priority === "Critical";
  return true;
}

const PRIORITY_STYLES = {
  Critical: { color: "#E8395B", bg: "#FDECEE" },
  High: { color: "#E8395B", bg: "#FDECEE" },
  Medium: { color: "#F59E0B", bg: "#FFF3E4" },
  Low: { color: "#16A34A", bg: "#E7F8EF" },
};

function makeTask(partial, columnId) {
  const stage = STAGE_BY_COLUMN[columnId] || "New";
  const rawAssignee = partial.assignee;
  const assignee =
    !rawAssignee || rawAssignee === "Unassigned" ? "" : rawAssignee;
  return {
    id: partial.id || `task-${columnId}-${Math.random().toString(36).slice(2, 9)}`,
    title: partial.title,
    priority: partial.priority || "Medium",
    progress: partial.progress ?? 0,
    project: partial.project || "Sales Pipeline",
    date: partial.date || "07-12-26",
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
    startDate: partial.startDate || "2026-07-12",
    dueDate: partial.dueDate || "2026-07-12",
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
      priority: "Medium",
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
      priority: "Medium",
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
    },
    "done"
  ),
  makeTask(
    {
      id: "t10",
      title: "Confirm meeting & send biodata pack",
      priority: "Medium",
      progress: 100,
      project: "Matchmaking",
      assignee: "Ishaan Roy",
      milestone: "Matching",
    },
    "done"
  ),
];

const PER_PAGE_OPTIONS = [10, 25, 50];

function taskToForm(task) {
  if (!task) return null;
  return {
    title: task.title || "",
    description: task.description || "",
    priority: task.priority || "Medium",
    assignees: task.assignees?.length
      ? [...task.assignees]
      : task.assignee && task.assignee !== "Unassigned"
        ? [task.assignee]
        : [],
    isClientRelated: Boolean(task.isClientRelated),
    client: task.client || "",
    startDate: task.startDate || "",
    dueDate: task.dueDate || "",
    stars: task.stars ?? 7,
    stage: task.stage || "New",
  };
}

function applyFormToTask(existing, form) {
  const stage = form.stage || existing?.stage || "New";
  const columnId = COLUMN_BY_STAGE[stage] || existing?.columnId || "new";
  const assignees = form.assignees?.length ? form.assignees : [];
  const assignee = assignees[0] || "";
  return {
    ...(existing || {}),
    id: existing?.id || `task-${Date.now()}`,
    title: form.title.trim(),
    description: form.description || "",
    priority: form.priority || "Medium",
    assignees,
    assignee,
    isClientRelated: Boolean(form.isClientRelated),
    client: form.client || "",
    startDate: form.startDate,
    dueDate: form.dueDate,
    date: form.dueDate
      ? form.dueDate.split("-").reverse().map((p, i) => (i === 2 ? p.slice(-2) : p)).join("-")
      : existing?.date || "",
    stars: form.stars ?? 7,
    stage,
    columnId,
    project: existing?.project || "Sales Pipeline",
    progress: existing?.progress ?? (stage === "Done" ? 100 : 20),
    milestone: existing?.milestone || "Planning",
    acknowledgedAt: existing?.acknowledgedAt || form.startDate,
    assignedAt: existing?.assignedAt || form.startDate,
    comments: existing?.comments || [],
    checklist: existing?.checklist || [],
    attachments: existing?.attachments || [],
    overdue: existing?.overdue || false,
  };
}

/* ───────────────────────── Small pieces ───────────────────────── */

function InitialsAvatar({ name, size = 26 }) {
  const initials = (name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className="rounded-full bg-[#EEF0FE] text-[#6366F1] font-bold grid place-items-center shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}

/* ───────────────────────── Stat bar ───────────────────────── */

function StatBar({ stats, activeKey, onSelect }) {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {stats.map((stat) => {
        const active = activeKey === stat.id;
        return (
          <button
            key={stat.id}
            type="button"
            onClick={() => onSelect(stat.id)}
            aria-pressed={active}
            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border text-left min-w-0 transition-colors ${
              active
                ? "bg-[#FCF5F6] border-[#7A0A17]/25 shadow-[0_1px_2px_rgba(122,10,23,0.08)]"
                : "bg-white border-black/8 hover:bg-[#FAFAFB]"
            }`}
          >
            <span
              className="size-9 rounded-xl grid place-items-center shrink-0"
              style={{ backgroundColor: stat.bg, color: stat.color }}
            >
              <stat.icon size={16} />
            </span>
            <div className="min-w-0">
              <p className={`text-[11px] truncate ${active ? "text-[#7A0A17] font-semibold" : "text-[#9CA3AF]"}`}>
                {stat.label}
              </p>
              <p className={`text-[18px] font-bold leading-tight ${active ? "text-[#7A0A17]" : "text-[#111]"}`}>
                {stat.value}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Toolbar ───────────────────────── */

function TasksToolbar({ search, onSearchChange, perPage, onPerPageChange, view, onViewChange }) {
  const [perPageOpen, setPerPageOpen] = useState(false);

  return (
    <div className="flex items-center gap-2.5 flex-wrap">
      <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-black/10 flex-1 basis-[240px] max-w-[520px] focus-within:border-[#7A0A17]/40 transition-colors">
        <Search size={15} className="text-[#9CA3AF] shrink-0" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="bg-transparent text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none w-full min-w-0"
        />
      </div>

      <button
        type="button"
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors shrink-0"
      >
        <Search size={14} /> Search
      </button>

      <button
        type="button"
        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors shrink-0"
      >
        <SlidersHorizontal size={14} /> Filter
      </button>

      <div className="flex items-center gap-2.5 ml-auto shrink-0">
        <div className="flex items-center h-10 rounded-xl border border-black/10 bg-white overflow-hidden shrink-0">
          <button
            type="button"
            onClick={() => onViewChange("list")}
            title="List view"
            aria-pressed={view === "list"}
            aria-label="List view"
            className={`h-full px-3 flex items-center transition-colors ${
              view === "list"
                ? "bg-[#7A0A17] text-white"
                : "text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[#FAFAFB]"
            }`}
          >
            <LayoutList size={15} />
          </button>
          <span className="w-px h-5 bg-black/10" />
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            title="Grid view"
            aria-pressed={view === "grid"}
            aria-label="Grid view"
            className={`h-full px-3 flex items-center transition-colors ${
              view === "grid"
                ? "bg-[#7A0A17] text-white"
                : "text-[#9CA3AF] hover:text-[#4B5563] hover:bg-[#FAFAFB]"
            }`}
          >
            <LayoutGrid size={15} />
          </button>
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setPerPageOpen((v) => !v)}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            Per Page: {perPage}
            <ChevronDown
              size={14}
              className={`text-[#9CA3AF] transition-transform ${perPageOpen ? "rotate-180" : ""}`}
            />
          </button>
          {perPageOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] min-w-[100px] bg-white border border-black/8 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-30 py-1 overflow-hidden">
              {PER_PAGE_OPTIONS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    onPerPageChange(n);
                    setPerPageOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors ${
                    n === perPage
                      ? "bg-[#FCF5F6] text-[#7A0A17] font-semibold"
                      : "text-[#4B5563] hover:bg-[#FAFAFB]"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── Task card ───────────────────────── */

function TaskCard({ task, columnColor, onView, onEdit, onDelete }) {
  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;

  return (
    <div
      className="bg-white border border-black/8 rounded-xl p-3.5 flex flex-col gap-3 border-l-4"
      style={{ borderLeftColor: columnColor }}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-bold text-[#111] leading-snug min-w-0">{task.title}</p>
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            onClick={() => onView(task)}
            className="p-1 text-[#e8b400] hover:bg-[#e8b400]/10 rounded-md transition-colors"
            aria-label="View task"
          >
            <Eye size={13} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="p-1 text-[#2b7fff] hover:bg-[#2b7fff]/10 rounded-md transition-colors"
            aria-label="Edit task"
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="p-1 text-[#E8395B] hover:bg-[#E8395B]/10 rounded-md transition-colors"
            aria-label="Delete task"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      <span
        className="self-start inline-block text-[10px] font-semibold px-2 py-1 rounded-md"
        style={{ color: priority.color, backgroundColor: priority.bg }}
      >
        {task.priority}
      </span>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-[#9CA3AF]">Progress</span>
          <span className="text-[12px] font-bold text-[#111]">{task.progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#EDEEF1] overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${task.progress}%`, backgroundColor: columnColor }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[#374151] truncate">{task.project}</p>
          <p
            className={`text-[10.5px] mt-0.5 ${
              task.overdue ? "text-[#E8395B] font-semibold" : "text-[#9CA3AF]"
            }`}
          >
            {task.date}
          </p>
        </div>
        {task.assignee && task.assignee !== "Unassigned" ? (
          <InitialsAvatar name={task.assignee} />
        ) : (
          <span className="size-[26px] rounded-full border border-dashed border-black/15 bg-[#F3F4F6] shrink-0" />
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Column ───────────────────────── */

function TaskColumn({ column, tasks, onView, onEdit, onDelete }) {
  return (
    <div className="flex flex-col w-[280px] shrink-0 bg-[#F7F8FA] border border-black/6 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3.5 py-3 bg-white border-b border-black/8">
        <span className="inline-flex items-center gap-2 min-w-0">
          <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: column.color }} />
          <span className="text-[13px] font-bold text-[#111] truncate">{column.label}</span>
        </span>
        <span className="text-[11px] font-semibold text-[#6B7280] bg-[#F1F2F4] rounded-lg px-2 py-0.5 shrink-0">
          {tasks.length}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-3 overflow-y-auto scrollbar-thin" style={{ maxHeight: 640 }}>
        {tasks.length === 0 ? (
          <p className="text-[12px] text-[#9CA3AF] text-center py-6">No tasks in this column</p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              columnColor={column.color}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

const LIST_TH =
  "text-left text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3";

const PRIORITY_RANK = { Critical: 0, High: 1, Medium: 2, Low: 3 };

function getTaskListValue(row, key) {
  const task = row?.task || {};
  const column = row?.column || {};
  switch (key) {
    case "title":
      return task.title || "";
    case "status":
      return TASK_COLUMNS.findIndex((c) => c.id === column.id);
    case "priority":
      return PRIORITY_RANK[task.priority] ?? 99;
    case "progress":
      return task.progress ?? 0;
    case "project":
      return task.project || "";
    case "date": {
      const parts = String(task.date || "").split("-");
      if (parts.length === 3) {
        const [d, m, y] = parts;
        return `20${y}-${m}-${d}`;
      }
      return task.date || "";
    }
    case "assignee":
      return task.assignee && task.assignee !== "Unassigned" ? task.assignee : "";
    default:
      return "";
  }
}

/* ───────────────────────── List view ───────────────────────── */

function TaskListView({ rows, onView, onEdit, onDelete }) {
  const { sorted, sort, toggle } = useTableSort(rows, {
    defaultKey: "title",
    getValue: getTaskListValue,
  });

  if (rows.length === 0) {
    return (
      <div className="bg-white border border-black/8 rounded-2xl py-16 text-center text-[13px] text-[#9CA3AF]">
        No tasks found
      </div>
    );
  }

  return (
    <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr className="border-b border-black/8 bg-[#FAFAFB]">
              <SortableTh label="Task" sortKey="title" sort={sort} onSort={toggle} className={LIST_TH} />
              <SortableTh label="Status" sortKey="status" sort={sort} onSort={toggle} className={LIST_TH} />
              <SortableTh label="Priority" sortKey="priority" sort={sort} onSort={toggle} className={LIST_TH} />
              <SortableTh label="Progress" sortKey="progress" sort={sort} onSort={toggle} className={LIST_TH} />
              <SortableTh label="Project" sortKey="project" sort={sort} onSort={toggle} className={LIST_TH} />
              <SortableTh label="Due Date" sortKey="date" sort={sort} onSort={toggle} className={LIST_TH} />
              <SortableTh label="Assignee" sortKey="assignee" sort={sort} onSort={toggle} className={LIST_TH} />
              <SortableTh
                label="Actions"
                sortKey="actions"
                unsortable
                className="text-right text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide px-4 py-3"
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/6">
            {sorted.map(({ task, column }) => {
              const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;
              return (
                <tr key={task.id} className="hover:bg-[#FAFAFB] transition-colors">
                  <td className="px-4 py-3 text-[13px] font-semibold text-[#111] max-w-[260px]">
                    <span className="line-clamp-2">{task.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#4B5563] whitespace-nowrap">
                      <span
                        className="size-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: column.color }}
                      />
                      {column.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap"
                      style={{ color: priority.color, backgroundColor: priority.bg }}
                    >
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-[#EDEEF1] overflow-hidden shrink-0">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${task.progress}%`, backgroundColor: column.color }}
                        />
                      </div>
                      <span className="text-[11.5px] font-semibold text-[#111]">{task.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[#374151] whitespace-nowrap">
                    {task.project}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`text-[12px] ${
                        task.overdue ? "text-[#E8395B] font-semibold" : "text-[#6B7280]"
                      }`}
                    >
                      {task.date}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {task.assignee && task.assignee !== "Unassigned" ? (
                      <span className="inline-flex items-center gap-2 whitespace-nowrap">
                        <InitialsAvatar name={task.assignee} size={22} />
                        <span className="text-[12px] text-[#374151]">{task.assignee}</span>
                      </span>
                    ) : (
                      <span className="text-[12px] text-[#9CA3AF]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-0.5">
                      <button
                        type="button"
                        onClick={() => onView(task)}
                        className="p-1 text-[#e8b400] hover:bg-[#e8b400]/10 rounded-md transition-colors"
                        aria-label="View task"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(task)}
                        className="p-1 text-[#2b7fff] hover:bg-[#2b7fff]/10 rounded-md transition-colors"
                        aria-label="Edit task"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(task)}
                        className="p-1 text-[#E8395B] hover:bg-[#E8395B]/10 rounded-md transition-colors"
                        aria-label="Delete task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────── Page ─────────────────────── */

export default function TasksPage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);
  const [view, setView] = useState("grid");
  const [kpiFilter, setKpiFilter] = useState("total");
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  const kpiStats = useMemo(() => {
    const unassigned = tasks.filter(isTaskUnassigned).length;
    const assigned = tasks.length - unassigned;
    const high = tasks.filter((t) => t.priority === "High" || t.priority === "Critical").length;
    const counts = { total: tasks.length, unassigned, assigned, high };
    return STAT_DEFS.map((def) => ({ ...def, value: counts[def.id] }));
  }, [tasks]);

  const filteredTasks = useMemo(
    () => tasks.filter((t) => matchesKpiFilter(t, kpiFilter)),
    [tasks, kpiFilter]
  );

  const columns = useMemo(
    () =>
      TASK_COLUMNS.map((column) => {
        const all = filteredTasks.filter((t) => t.columnId === column.id);
        const searched = search
          ? all.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
          : all;
        return { column, tasks: searched.slice(0, perPage) };
      }),
    [filteredTasks, search, perPage]
  );

  const listRows = useMemo(() => {
    const rows = TASK_COLUMNS.flatMap((column) =>
      filteredTasks.filter((t) => t.columnId === column.id).map((task) => ({ task, column }))
    );
    const searched = search
      ? rows.filter((r) => r.task.title.toLowerCase().includes(search.toLowerCase()))
      : rows;
    return searched.slice(0, perPage);
  }, [filteredTasks, search, perPage]);

  const handleKpiSelect = (id) => {
    setKpiFilter((prev) => (id === "total" || prev === id ? "total" : id));
  };

  const handleView = (task) => setViewing(task);

  const handleEdit = (task) => {
    setViewing(null);
    setEditing(task);
    setCreateOpen(true);
  };

  const handleDelete = (task) => {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    if (viewing?.id === task.id) setViewing(null);
    if (editing?.id === task.id) {
      setEditing(null);
      setCreateOpen(false);
    }
    toast.success(`"${task.title}" deleted.`);
  };

  const handleUpdateViewing = (next) => {
    setTasks((prev) => prev.map((t) => (t.id === next.id ? { ...t, ...next } : t)));
    setViewing(next);
  };

  const handleSaveForm = (form) => {
    if (editing) {
      const updated = applyFormToTask(editing, form);
      setTasks((prev) => prev.map((t) => (t.id === editing.id ? updated : t)));
      setEditing(null);
      return;
    }
    const created = applyFormToTask(null, { ...form, stage: form.stage || "New" });
    setTasks((prev) => [created, ...prev]);
  };

  const closeFormModal = () => {
    setCreateOpen(false);
    setEditing(null);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 flex-wrap">
        <h1 className="text-[22px] font-bold text-[#111] tracking-tight">Tasks</h1>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 h-[38px] px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] active:bg-[#54060F] transition-colors"
        >
          <Plus size={15} /> Create Tasks
        </button>
      </div>

      <div className="px-5 pb-8 flex flex-col gap-4 min-w-0">
        <StatBar stats={kpiStats} activeKey={kpiFilter} onSelect={handleKpiSelect} />
        <TasksToolbar
          search={search}
          onSearchChange={setSearch}
          perPage={perPage}
          onPerPageChange={setPerPage}
          view={view}
          onViewChange={setView}
        />

        {view === "grid" ? (
          <div className="-mx-5 flex items-start gap-4 overflow-x-auto pb-2 scrollbar-thin px-5">
            {columns.map(({ column, tasks: colTasks }) => (
              <TaskColumn
                key={column.id}
                column={column}
                tasks={colTasks}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <TaskListView
            rows={listRows}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <TaskDetailsModal
        open={!!viewing}
        task={viewing}
        onClose={() => setViewing(null)}
        onEdit={handleEdit}
        onUpdateTask={handleUpdateViewing}
      />

      <CreateTaskModal
        open={createOpen}
        onClose={closeFormModal}
        mode={editing ? "edit" : "create"}
        initial={editing ? taskToForm(editing) : null}
        onSave={handleSaveForm}
      />
    </div>
  );
}
