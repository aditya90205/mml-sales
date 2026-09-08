import { useEffect, useState } from "react";
import { CheckSquare, X } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";

const TASK_EMPLOYEES = [
  "Priya Sharma",
  "Aditya Sharma",
  "Rahul Verma",
  "Sana Iqbal",
  "Dev Malhotra",
  "Neha Kapoor",
];

const TASK_CLIENTS = ["Sethi Family", "Agarwal Family", "Malhotra Family", "Kapoor Family", "Mehta Family"];
const TASK_PRIORITIES = ["Critical", "High", "Medium", "Low"];

const INPUT =
  "w-full h-10 px-3.5 rounded-xl bg-white border border-black/10 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40 transition-colors";

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[12.5px] font-semibold text-[#374151]">
        {label}
        {required ? <span className="text-[#E8395B]"> *</span> : null}
      </p>
      {children}
    </div>
  );
}

function emptyTaskForm(defaultDate) {
  const dateStr = defaultDate
    ? `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, "0")}-${String(defaultDate.getDate()).padStart(2, "0")}`
    : "";
  return {
    title: "",
    description: "",
    priority: "Medium",
    assignees: [],
    isClientRelated: true,
    client: "",
    startDate: dateStr,
    dueDate: dateStr,
    stars: 7,
    stage: "New",
  };
}

export default function CreateTaskModal({ open, onClose, onSave, defaultDate, initial = null, mode = "create" }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(() => emptyTaskForm(defaultDate));

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({ ...emptyTaskForm(defaultDate), ...initial });
      return;
    }
    setForm(emptyTaskForm(defaultDate));
  }, [open, defaultDate, initial]);

  const set = (field) => (val) => setForm((s) => ({ ...s, [field]: val }));

  const handleClose = () => {
    setForm(emptyTaskForm(defaultDate));
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter a task title.");
      return;
    }
    if (form.isClientRelated && !form.client) {
      toast.error("Please select a client.");
      return;
    }
    if (!form.startDate || !form.dueDate) {
      toast.error("Start date and due date are required.");
      return;
    }
    onSave?.(form);
    toast.success(isEdit ? "Task updated successfully." : "Task created successfully.");
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? "Edit Task" : "Create Task"}
      subtitle={isEdit ? "Update task details" : "Add a new task to the calendar"}
      icon={<CheckSquare size={16} />}
      iconBg="#F5EFFC"
      iconColor="#7C6CB0"
      width="max-w-[560px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Is the task related to client" required>
          <div className="flex items-center gap-2.5">
            {["Yes", "No"].map((opt) => {
              const active = form.isClientRelated === (opt === "Yes");
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => set("isClientRelated")(opt === "Yes")}
                  className={`h-10 px-7 rounded-xl border text-[13px] font-semibold transition-colors ${
                    active
                      ? "border-[#7A0A17] text-[#7A0A17] bg-[#FCF5F6]"
                      : "border-black/10 text-[#4B5563] hover:bg-[#FAFAFB]"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </Field>

        {form.isClientRelated && (
          <Field label="Client" required>
            <select required value={form.client} onChange={(e) => set("client")(e.target.value)} className={INPUT}>
              <option value="" disabled>
                Select a Client
              </option>
              {(form.client && !TASK_CLIENTS.includes(form.client)
                ? [form.client, ...TASK_CLIENTS]
                : TASK_CLIENTS
              ).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Title" required>
          <input
            required
            value={form.title}
            onChange={(e) => set("title")(e.target.value)}
            placeholder="Enter task title"
            className={INPUT}
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description")(e.target.value)}
            placeholder="Describe the task..."
            className={`${INPUT} h-auto py-2.5 resize-none`}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority">
            <select value={form.priority} onChange={(e) => set("priority")(e.target.value)} className={INPUT}>
              {TASK_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Assign to">
            <select
              value=""
              onChange={(e) => {
                const val = e.target.value;
                if (val === "__all__") {
                  set("assignees")([...TASK_EMPLOYEES]);
                  return;
                }
                if (val) set("assignees")([...(form.assignees ?? []), val]);
              }}
              className={INPUT}
            >
              <option value="" disabled>
                Select Employee
              </option>
              <option value="__all__">All</option>
              {TASK_EMPLOYEES.filter((e) => !(form.assignees ?? []).includes(e)).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {(form.assignees ?? []).length > 0 && (
          <div className="flex flex-wrap gap-2 -mt-2">
            {form.assignees.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 bg-[#F1F2F4] text-[#111] text-[12.5px] font-medium rounded-lg px-2.5 py-1"
              >
                {name}
                <button
                  type="button"
                  onClick={() => set("assignees")(form.assignees.filter((n) => n !== name))}
                  className="text-[#9CA3AF] hover:text-[#E8395B]"
                >
                  <X size={13} />
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Date" required>
            <input required type="date" value={form.startDate} onChange={(e) => set("startDate")(e.target.value)} className={INPUT} />
          </Field>
          <Field label="Due Date" required>
            <input required type="date" value={form.dueDate} onChange={(e) => set("dueDate")(e.target.value)} className={INPUT} />
          </Field>
        </div>

        <Field label="Assign Stars (xp)" required>
          <input
            required
            type="number"
            min={0}
            value={form.stars}
            onChange={(e) => set("stars")(Number(e.target.value))}
            placeholder="Assign Stars Points"
            className={INPUT}
          />
        </Field>

        <Field label="Selection Criteria">
          <div className="rounded-xl border border-black/10 px-3.5 py-3 text-[12.5px] text-[#6B7280] leading-relaxed bg-[#FAFAFB]">
            Task completed within due date
            <br />
            High priority will get 10 stars
            <br />
            Medium stars will get 7 stars
            <br />
            Low priority will get 3 stars
            <br />
            No stars after due date
          </div>
        </Field>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/8">
          <button
            type="button"
            onClick={handleClose}
            className="h-9 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-9 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
