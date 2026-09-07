import { useEffect, useState } from "react";
import { CircleDot, X } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";

const EMPLOYEES = [
  "Priya Sharma",
  "Aditya Sharma",
  "Rahul Verma",
  "Sana Iqbal",
  "Dev Malhotra",
  "Neha Kapoor",
];

const CLIENTS = ["ABC Pvt. Ltd", "Sethi Family", "Agarwal Contract", "Malhotra Family", "Mehta & Co"];
const PRIORITIES = ["Critical", "High", "Medium", "Low"];

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

function emptyOtherForm(defaultDate) {
  const dateStr = defaultDate
    ? `${defaultDate.getFullYear()}-${String(defaultDate.getMonth() + 1).padStart(2, "0")}-${String(defaultDate.getDate()).padStart(2, "0")}`
    : "";
  return {
    title: "",
    description: "",
    priority: "Medium",
    assignees: [],
    isClientRelated: false,
    client: "",
    date: dateStr,
    startTime: "10:00",
    endTime: "11:00",
    stars: 7,
  };
}

export default function CreateOtherModal({ open, onClose, onSave, defaultDate, initial = null, mode = "create" }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(() => emptyOtherForm(defaultDate));

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({ ...emptyOtherForm(defaultDate), ...initial });
      return;
    }
    setForm(emptyOtherForm(defaultDate));
  }, [open, defaultDate, initial]);

  const set = (field) => (val) => setForm((s) => ({ ...s, [field]: val }));

  const handleClose = () => {
    setForm(emptyOtherForm(defaultDate));
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    if (form.isClientRelated && !form.client) {
      toast.error("Please select a client.");
      return;
    }
    if (!form.date) {
      toast.error("Date is required.");
      return;
    }
    if (!form.startTime || !form.endTime) {
      toast.error("Start time and end time are required.");
      return;
    }
    onSave?.(form);
    toast.success(isEdit ? "Item updated successfully." : "Item created successfully.");
    handleClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={isEdit ? "Edit Others" : "Create Others"}
      subtitle={isEdit ? "Update calendar item details" : "Add a new item to the calendar"}
      icon={<CircleDot size={16} />}
      iconBg="#F3F4F6"
      iconColor="#6F7886"
      width="max-w-[560px]"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Is this related to a client" required>
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
              {CLIENTS.map((c) => (
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
            placeholder="Enter title"
            className={INPUT}
          />
        </Field>

        <Field label="Description">
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => set("description")(e.target.value)}
            placeholder="Describe the item..."
            className={`${INPUT} h-auto py-2.5 resize-none`}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority">
            <select value={form.priority} onChange={(e) => set("priority")(e.target.value)} className={INPUT}>
              {PRIORITIES.map((p) => (
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
                  set("assignees")([...EMPLOYEES]);
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
              {EMPLOYEES.filter((e) => !(form.assignees ?? []).includes(e)).map((name) => (
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

        <Field label="Date" required>
          <input required type="date" value={form.date} onChange={(e) => set("date")(e.target.value)} className={INPUT} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Start Time" required>
            <input required type="time" value={form.startTime} onChange={(e) => set("startTime")(e.target.value)} className={INPUT} />
          </Field>
          <Field label="End Time" required>
            <input required type="time" value={form.endTime} onChange={(e) => set("endTime")(e.target.value)} className={INPUT} />
          </Field>
        </div>

        <Field label="Assign Stars (xp)">
          <input
            type="number"
            min={0}
            value={form.stars}
            onChange={(e) => set("stars")(Number(e.target.value))}
            placeholder="Assign Stars Points"
            className={INPUT}
          />
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
