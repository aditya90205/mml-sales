import { useEffect, useState } from "react";
import {
  BarChart3,
  CalendarClock,
  CalendarDays,
  Check,
  ClipboardList,
  Download,
  FileText,
  Flag,
  Layers,
  Paperclip,
  Pencil,
  Plus,
  Send,
  Star,
  Trash2,
  User,
  UserCheck,
  X,
} from "lucide-react";
import Modal from "../ui/Modal";

const PRIORITY_FILL = {
  Low: "bg-[#E7F8EF] text-[#16A34A]",
  Medium: "bg-[#FFF3E4] text-[#D97706]",
  High: "bg-[#FDECEE] text-[#E8395B]",
  Critical: "bg-[#F3E8FF] text-[#7C3AED]",
};

const STAGE_DOT = {
  New: "#16A34A",
  "In Progress": "#F59E0B",
  Review: "#3B82F6",
  Blocked: "#A855F7",
  Done: "#16A34A",
};

function fmtDate(d) {
  if (!d) return "—";
  if (typeof d === "string" && /^\d{2}-\d{2}-\d{2,4}$/.test(d)) return d;
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

function fmtDateTime(d) {
  if (!d) return "—";
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return `${fmtDate(date)} · ${date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

function DetailItem({ label, icon: Icon, children }) {
  return (
    <div className="min-w-0">
      <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8f95a5] uppercase tracking-wide">
        {Icon ? <Icon size={13} className="text-[#8f95a5]" strokeWidth={1.75} /> : null}
        {label}
      </p>
      <div className="text-[14px] font-medium text-[#111] mt-1.5 break-words">{children}</div>
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex items-center gap-1 bg-[#f1f1f4] rounded-xl p-1 w-fit mb-6 max-w-full overflow-x-auto scrollbar-thin">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`px-4 sm:px-5 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-colors ${
            active === t.key ? "bg-white text-black shadow-sm" : "text-[#6f7886]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

/** Normalize calendar event → task view model */
export function calendarEventToTaskView(ev) {
  if (!ev) return null;
  const m = ev.meta || {};
  return {
    id: ev.id,
    title: ev.title,
    description: m.description || "",
    stage: m.stage || "New",
    priority: m.priority || "Medium",
    project: m.project || "Sales Pipeline",
    milestone: m.milestone || "Planning",
    progress: m.progress ?? 20,
    assignees: Array.isArray(m.assignees) ? m.assignees : [],
    isClientRelated: Boolean(m.clientRelated),
    client: m.client || "",
    startDate: ev.date,
    dueDate: m.dueDate || ev.date,
    stars: m.stars ?? 7,
    acknowledgedAt: m.acknowledgedAt || ev.date,
    assignedAt: m.assignedAt || ev.date,
    comments: Array.isArray(m.comments) ? m.comments : [],
    checklist: Array.isArray(m.checklist) ? m.checklist : [],
    attachments: Array.isArray(m.attachments) ? m.attachments : [],
    startH: ev.startH,
    endH: ev.endH,
  };
}

export default function TaskDetailsModal({
  open,
  task,
  onClose,
  onEdit,
  onUpdateTask,
}) {
  const [tab, setTab] = useState("details");
  const [commentText, setCommentText] = useState("");
  const [checklistText, setChecklistText] = useState("");
  const [mediaText, setMediaText] = useState("");
  const [editingChecklistIndex, setEditingChecklistIndex] = useState(null);
  const [editingChecklistText, setEditingChecklistText] = useState("");

  useEffect(() => {
    if (open) {
      setTab("details");
      setCommentText("");
      setChecklistText("");
      setMediaText("");
      setEditingChecklistIndex(null);
    }
  }, [open, task?.id]);

  if (!open || !task) return null;

  const comments = task.comments || [];
  const checklist = task.checklist || [];
  const attachments = task.attachments || [];
  const doneCount = checklist.filter((i) => i.done).length;
  const checklistPct = checklist.length ? Math.round((doneCount / checklist.length) * 100) : 0;
  const assigneeNames = (task.assignees?.length
    ? task.assignees
    : task.assignee
      ? [task.assignee]
      : []
  ).filter((name) => name && name !== "Unassigned");
  const assigneeLabel = assigneeNames.length ? assigneeNames.join(", ") : "—";

  const patch = (updater) => {
    const next = typeof updater === "function" ? updater(task) : { ...task, ...updater };
    onUpdateTask?.(next);
  };

  const tabs = [
    { key: "details", label: "Details" },
    { key: "comments", label: `Comments (${comments.length})` },
    { key: "checklist", label: `Checklist (${checklist.length})` },
    { key: "attachments", label: "Attachments" },
  ];

  return (
    <Modal open={open} onClose={onClose} hideHeader width="max-w-[640px]">
      <div className="flex items-center justify-between pb-4 mb-2 border-b border-black/10 -mt-1">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-9 rounded-lg bg-[#eafdec] grid place-items-center shrink-0">
            <BarChart3 size={18} className="text-[#12a44a]" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-black truncate">{task.title}</h2>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg text-[#2b7fff] hover:bg-[#E8F2FE] transition-colors"
              aria-label="Edit task"
            >
              <Pencil size={16} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-black/60 hover:text-black hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      <TabBar tabs={tabs} active={tab} onChange={setTab} />

      {tab === "details" && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <DetailItem label="Stage" icon={Layers}>
              <span className="inline-flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: STAGE_DOT[task.stage] || "#9CA3AF" }}
                />
                {task.stage || "New"}
              </span>
            </DetailItem>
            <DetailItem label="Priority" icon={Flag}>
              <span
                className={`inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-md ${
                  PRIORITY_FILL[task.priority] || PRIORITY_FILL.Medium
                }`}
              >
                {task.priority}
              </span>
            </DetailItem>
            <DetailItem label="Assignee" icon={UserCheck}>{assigneeLabel}</DetailItem>
            <DetailItem label="Project" icon={ClipboardList}>{task.project || "—"}</DetailItem>
            <DetailItem label="Acknowledged At" icon={CalendarClock}>
              {fmtDate(task.acknowledgedAt)}
            </DetailItem>
            <DetailItem label="Assigned At" icon={CalendarClock}>
              {fmtDate(task.assignedAt)}
            </DetailItem>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold text-[#8f95a5] uppercase tracking-wide">Progress</p>
            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 rounded-full bg-[#eef0f2] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#12a44a]"
                  style={{ width: `${task.progress || 0}%` }}
                />
              </div>
              <span className="text-[14px] font-semibold text-black">{task.progress || 0}%</span>
            </div>
          </div>

          <DetailItem label="Milestone" icon={Star}>{task.milestone || "—"}</DetailItem>

          <div className="flex flex-col gap-1.5">
            <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8f95a5] uppercase tracking-wide">
              <FileText size={13} className="text-[#8f95a5]" strokeWidth={1.75} /> Description
            </p>
            <p className="text-[14px] text-[#111] leading-relaxed">
              {task.description || "No description added."}
            </p>
          </div>
        </div>
      )}

      {tab === "comments" && (
        <div className="flex flex-col gap-4">
          {comments.length === 0 && (
            <p className="text-[13px] text-[#6f7886]">No comments yet. Be the first to add one.</p>
          )}
          {comments.map((c, i) => (
            <div key={i} className="border border-black/10 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[13px] font-semibold text-black">{c.author}</p>
                  <p className="text-[11px] text-[#a8a8a8]">{fmtDateTime(c.date)}</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    patch({
                      ...task,
                      comments: comments.filter((_, idx) => idx !== i),
                    })
                  }
                  className="p-1 text-[#E8395B] hover:bg-[#FDECEE] rounded-md"
                  aria-label="Delete comment"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-[13px] text-[#111]">{c.text}</p>
            </div>
          ))}

          <p className="text-[13px] font-semibold text-black mt-1">Post Comment</p>
          <div className="relative">
            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write the message here..."
              className="w-full px-3.5 py-2.5 pr-14 rounded-xl bg-white border border-black/10 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40 resize-none"
            />
            <button
              type="button"
              onClick={() => {
                if (!commentText.trim()) return;
                patch({
                  ...task,
                  comments: [
                    ...comments,
                    {
                      author: "Priya Sharma",
                      text: commentText.trim(),
                      date: new Date().toISOString(),
                      avatar: 0,
                    },
                  ],
                });
                setCommentText("");
              }}
              className="absolute bottom-3 right-3 size-8 rounded-full bg-[#0D9488] text-white grid place-items-center hover:bg-[#0F766E]"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {tab === "checklist" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-semibold text-black">Progress</p>
            <span className="text-[11px] font-medium text-[#6f7886] bg-[#f1f1f4] rounded-full px-2.5 py-1">
              {doneCount}/{checklist.length} completed
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#eef0f2] overflow-hidden">
            <div className="h-full rounded-full bg-[#12a44a]" style={{ width: `${checklistPct}%` }} />
          </div>

          {checklist.length === 0 && (
            <p className="text-[13px] text-[#6f7886]">No checklist items yet.</p>
          )}
          {checklist.map((item, i) => (
            <div
              key={i}
              className="border border-black/10 rounded-xl p-4 flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() =>
                    patch({
                      ...task,
                      checklist: checklist.map((it, idx) =>
                        idx === i ? { ...it, done: !it.done } : it
                      ),
                    })
                  }
                  className={`size-5 rounded-md border shrink-0 mt-0.5 grid place-items-center ${
                    item.done ? "bg-[#F97316] border-[#F97316]" : "border-black/20 bg-white"
                  }`}
                >
                  {item.done && <Check size={12} className="text-white" strokeWidth={3} />}
                </button>
                <div className="min-w-0 flex-1">
                  {editingChecklistIndex === i ? (
                    <input
                      autoFocus
                      value={editingChecklistText}
                      onChange={(e) => setEditingChecklistText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const text = editingChecklistText.trim();
                          if (text) {
                            patch({
                              ...task,
                              checklist: checklist.map((it, idx) =>
                                idx === i ? { ...it, text } : it
                              ),
                            });
                          }
                          setEditingChecklistIndex(null);
                        }
                      }}
                      onBlur={() => {
                        const text = editingChecklistText.trim();
                        if (text) {
                          patch({
                            ...task,
                            checklist: checklist.map((it, idx) =>
                              idx === i ? { ...it, text } : it
                            ),
                          });
                        }
                        setEditingChecklistIndex(null);
                      }}
                      className="w-full h-9 px-3 rounded-lg border border-black/10 text-[13px] outline-none focus:border-[#7A0A17]/40"
                    />
                  ) : (
                    <p
                      className={`text-[13px] ${
                        item.done ? "text-[#a8a8a8] line-through" : "text-[#111]"
                      }`}
                    >
                      {item.text}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {item.assignee && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#6f7886] bg-[#f1f1f4] rounded-md px-2 py-1">
                        <User size={11} /> {item.assignee}
                      </span>
                    )}
                    {item.dueDate && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#6f7886] bg-[#f1f1f4] rounded-md px-2 py-1">
                        <CalendarDays size={11} /> {fmtDate(item.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingChecklistIndex(i);
                    setEditingChecklistText(item.text);
                  }}
                  className="p-1 text-[#2b7fff] hover:bg-[#E8F2FE] rounded-md"
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    patch({
                      ...task,
                      checklist: checklist.filter((_, idx) => idx !== i),
                    })
                  }
                  className="p-1 text-[#E8395B] hover:bg-[#FDECEE] rounded-md"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <p className="text-[13px] font-semibold text-black mt-1">Add checklist item</p>
          <div className="flex items-center gap-2">
            <input
              value={checklistText}
              onChange={(e) => setChecklistText(e.target.value)}
              placeholder="Add checklist item..."
              className="flex-1 h-10 px-3.5 rounded-xl border border-black/10 text-[13px] outline-none focus:border-[#7A0A17]/40"
            />
            <button
              type="button"
              onClick={() => {
                if (!checklistText.trim()) return;
                patch({
                  ...task,
                  checklist: [
                    ...checklist,
                    {
                      text: checklistText.trim(),
                      done: false,
                      assignee: task.assignees?.[0] || task.assignee || "Priya Sharma",
                      dueDate: task.dueDate || task.date,
                    },
                  ],
                });
                setChecklistText("");
              }}
              className="h-10 px-4 shrink-0 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold inline-flex items-center gap-1.5 hover:bg-[#640712]"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      )}

      {tab === "attachments" && (
        <div className="flex flex-col gap-4">
          {attachments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Paperclip size={26} className="text-[#D1D5DB]" />
              <p className="text-[13px] font-semibold text-[#111] mt-1">No attachments yet</p>
              <p className="text-[12px] text-[#9CA3AF]">Upload files to share with your team!</p>
            </div>
          ) : (
            attachments.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between border border-black/10 rounded-xl px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Paperclip size={16} className="text-[#6B7280] shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#111] truncate">{a.name}</p>
                    <p className="text-[11px] text-[#9CA3AF]">{a.size || "—"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="p-1 text-[#6B7280] hover:bg-[#FAFAFB] rounded-md"
                  aria-label="Download"
                >
                  <Download size={16} />
                </button>
              </div>
            ))
          )}

          <p className="text-[13px] font-semibold text-[#111] mt-1">Add Media</p>
          <div className="flex items-center gap-2">
            <input
              value={mediaText}
              onChange={(e) => setMediaText(e.target.value)}
              placeholder="Add media..."
              className="flex-1 h-10 px-3.5 rounded-xl border border-black/10 text-[13px] outline-none focus:border-[#7A0A17]/40"
            />
            <button
              type="button"
              onClick={() => {
                if (!mediaText.trim()) return;
                patch({
                  ...task,
                  attachments: [...attachments, { name: mediaText.trim(), size: "—" }],
                });
                setMediaText("");
              }}
              className="h-10 px-4 shrink-0 rounded-xl border border-black/10 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
