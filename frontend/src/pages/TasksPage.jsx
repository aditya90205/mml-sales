import { useMemo, useState } from "react";
import {
  ChevronDown,
  Edit2,
  Eye,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import { toast } from "react-toastify";

/* ───────────────────────── Data ───────────────────────── */

const TASK_COLUMNS = [
  { id: "new",         label: "New",         color: "#E8395B", total: 36 },
  { id: "in-progress", label: "In Progress", color: "#F59E0B", total: 36 },
  { id: "review",      label: "Review",      color: "#3B82F6", total: 36 },
  { id: "blocked",     label: "Blocked",     color: "#A855F7", total: 36 },
  { id: "done",        label: "Done",        color: "#16A34A", total: 36 },
];

const STATS = [
  { label: "Total Tasks", value: 125, icon: Users,     color: "#6366F1", bg: "#EEF0FE" },
  { label: "Unassigned",  value: 12,  icon: UserX,     color: "#E8395B", bg: "#FDECEE" },
  { label: "Assigned",    value: 25,  icon: UserCheck, color: "#F59E0B", bg: "#FFF3E4" },
  { label: "Overdue",     value: 25,  icon: UserCog,   color: "#3B82F6", bg: "#E8F2FE" },
  { label: "High Priority", value: 100, icon: UserPlus, color: "#16A34A", bg: "#E7F8EF" },
];

const PRIORITY_STYLES = {
  Critical: { color: "#E8395B", bg: "#FDECEE" },
  Medium:   { color: "#F59E0B", bg: "#FFF3E4" },
  Low:      { color: "#16A34A", bg: "#E7F8EF" },
};

const TASKS_BY_COLUMN = {
  new: [
    { title: "API Integration & Core Testing", priority: "Medium", progress: 20, project: "E-Commerce Platform", date: "07-12-26", overdue: false, assignee: "Rahul Verma" },
    { title: "API Integration & Core Testing", priority: "Medium", progress: 20, project: "E-Commerce Platform", date: "07-12-26", overdue: false, assignee: "Rahul Verma" },
  ],
  "in-progress": [
    { title: "Design Systems & Core UI Mockups", priority: "Medium", progress: 60, project: "E-Commerce Platform", date: "07-12-26", overdue: false, assignee: "Sana Iqbal" },
    { title: "API Integration & Core Testing",   priority: "Medium", progress: 20, project: "E-Commerce Platform", date: "07-12-26", overdue: false, assignee: "Sana Iqbal" },
  ],
  review: [
    { title: "Payment Gateway Integration",     priority: "Critical", progress: 75, project: "Mobile Banking App",   date: "07-12-26", overdue: true,  assignee: "Dev Malhotra" },
    { title: "API Integration & Core Testing",  priority: "Medium",   progress: 20, project: "E-Commerce Platform",  date: "07-12-26", overdue: false, assignee: "Dev Malhotra" },
  ],
  blocked: [
    { title: "Performance Benchmarking",        priority: "Low",    progress: 20, project: "API Gateway",          date: "07-12-26", overdue: false, assignee: "Neha Kapoor" },
    { title: "API Integration & Core Testing",  priority: "Medium", progress: 20, project: "E-Commerce Platform",  date: "07-12-26", overdue: false, assignee: "Neha Kapoor" },
  ],
  done: [
    { title: "UI/UX Improvements",              priority: "Low",    progress: 20, project: "API Gateway",         date: "07-12-26", overdue: false, assignee: "Ishaan Roy" },
    { title: "API Integration & Core Testing",  priority: "Medium", progress: 20, project: "E-Commerce Platform", date: "07-12-26", overdue: false, assignee: "Ishaan Roy" },
  ],
};

const PER_PAGE_OPTIONS = [10, 25, 50];

/* ───────────────────────── Small pieces ───────────────────────── */

function InitialsAvatar({ name, size = 26 }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
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

function StatBar() {
  return (
    <div className="bg-white border border-black/8 rounded-2xl divide-y divide-black/8 sm:divide-y-0 sm:flex sm:items-stretch">
      {STATS.map((stat, i) => (
        <div
          key={stat.label}
          className={`flex items-center gap-3 px-4 py-3.5 flex-1 min-w-0 ${
            i > 0 ? "sm:border-l sm:border-black/8" : ""
          }`}
        >
          <span
            className="size-9 rounded-xl grid place-items-center shrink-0"
            style={{ backgroundColor: stat.bg, color: stat.color }}
          >
            <stat.icon size={16} />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] text-[#9CA3AF] truncate">{stat.label}</p>
            <p className="text-[18px] font-bold text-[#111] leading-tight">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ───────────────────────── Toolbar ───────────────────────── */

function TasksToolbar({ search, onSearchChange, perPage, onPerPageChange }) {
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

      <div className="relative shrink-0 ml-auto">
        <button
          type="button"
          onClick={() => setPerPageOpen((v) => !v)}
          className="inline-flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
        >
          Per Page: {perPage}
          <ChevronDown size={14} className={`text-[#9CA3AF] transition-transform ${perPageOpen ? "rotate-180" : ""}`} />
        </button>
        {perPageOpen && (
          <div className="absolute right-0 top-[calc(100%+6px)] min-w-[100px] bg-white border border-black/8 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] z-30 py-1 overflow-hidden">
            {PER_PAGE_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => { onPerPageChange(n); setPerPageOpen(false); }}
                className={`w-full text-left px-3.5 py-2 text-[13px] transition-colors ${
                  n === perPage ? "bg-[#FCF5F6] text-[#7A0A17] font-semibold" : "text-[#4B5563] hover:bg-[#FAFAFB]"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── Task card ───────────────────────── */

function TaskCard({ task, columnColor }) {
  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.Medium;

  return (
    <div
      className="bg-white border border-black/8 rounded-xl p-3.5 flex flex-col gap-3 border-l-4"
      style={{ borderLeftColor: columnColor }}
    >
      {/* Title + actions */}
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-bold text-[#111] leading-snug min-w-0">{task.title}</p>
        <div className="flex items-center gap-0.5 shrink-0">
          <button type="button" onClick={() => toast.info(`Viewing "${task.title}"`)} className="p-1 text-[#3B82F6] hover:bg-[#3B82F6]/10 rounded-md transition-colors" aria-label="View task">
            <Eye size={13} />
          </button>
          <button type="button" onClick={() => toast.info(`Editing "${task.title}"`)} className="p-1 text-[#F59E0B] hover:bg-[#F59E0B]/10 rounded-md transition-colors" aria-label="Edit task">
            <Edit2 size={13} />
          </button>
          <button type="button" onClick={() => toast.error(`"${task.title}" deleted.`)} className="p-1 text-[#E8395B] hover:bg-[#E8395B]/10 rounded-md transition-colors" aria-label="Delete task">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Priority */}
      <span
        className="self-start inline-block text-[10px] font-semibold px-2 py-1 rounded-md"
        style={{ color: priority.color, backgroundColor: priority.bg }}
      >
        {task.priority}
      </span>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] text-[#9CA3AF]">Progress</span>
          <span className="text-[12px] font-bold text-[#111]">{task.progress}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#EDEEF1] overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${task.progress}%`, backgroundColor: columnColor }} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[#374151] truncate">{task.project}</p>
          <p className={`text-[10.5px] mt-0.5 ${task.overdue ? "text-[#E8395B] font-semibold" : "text-[#9CA3AF]"}`}>
            {task.date}
          </p>
        </div>
        <InitialsAvatar name={task.assignee} />
      </div>
    </div>
  );
}

/* ───────────────────────── Column ───────────────────────── */

function TaskColumn({ column, tasks }) {
  return (
    <div className="flex flex-col w-[280px] shrink-0 bg-[#F7F8FA] border border-black/6 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3.5 py-3 bg-white border-b border-black/8">
        <span className="inline-flex items-center gap-2 min-w-0">
          <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: column.color }} />
          <span className="text-[13px] font-bold text-[#111] truncate">{column.label}</span>
        </span>
        <span className="text-[11px] font-semibold text-[#6B7280] bg-[#F1F2F4] rounded-lg px-2 py-0.5 shrink-0">
          {column.total}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-3 overflow-y-auto scrollbar-thin" style={{ maxHeight: 640 }}>
        {tasks.length === 0 ? (
          <p className="text-[12px] text-[#9CA3AF] text-center py-6">No tasks in this column</p>
        ) : (
          tasks.map((task, i) => (
            <TaskCard key={`${column.id}-${i}`} task={task} columnColor={column.color} />
          ))
        )}
      </div>
    </div>
  );
}

/* ─────────────────────── Page ─────────────────────── */

export default function TasksPage() {
  const [search, setSearch] = useState("");
  const [perPage, setPerPage] = useState(10);

  const columns = useMemo(
    () =>
      TASK_COLUMNS.map((column) => {
        const all = TASKS_BY_COLUMN[column.id] || [];
        const filtered = search
          ? all.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
          : all;
        return { column, tasks: filtered.slice(0, perPage) };
      }),
    [search, perPage]
  );

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* TopBar is provided by Layout */}

      {/* Header row */}
      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 flex-wrap">
        <h1 className="text-[22px] font-bold text-[#111] tracking-tight">Tasks</h1>
        <button
          type="button"
          onClick={() => toast.info("Task creation coming soon.")}
          className="inline-flex items-center gap-2 h-[38px] px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] active:bg-[#54060F] transition-colors"
        >
          <Plus size={15} /> Create Tasks
        </button>
      </div>

      {/* Body */}
      <div className="px-5 pb-8 flex flex-col gap-4 min-w-0">
        <StatBar />
        <TasksToolbar
          search={search} onSearchChange={setSearch}
          perPage={perPage} onPerPageChange={setPerPage}
        />

        {/* Board — break out of px-5 so scroll area is edge-to-edge */}
        <div className="-mx-5 flex items-start gap-4 overflow-x-auto pb-2 scrollbar-thin px-5">
          {columns.map(({ column, tasks }) => (
            <TaskColumn key={column.id} column={column} tasks={tasks} />
          ))}
        </div>
      </div>
    </div>
  );
}
