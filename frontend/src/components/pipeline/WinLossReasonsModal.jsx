import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { toast } from "react-toastify";

const REASONS = [
  { id: "price", label: "Price / Budget / ROI", action: "escalation" },
  { id: "no_decision", label: "No decision / Think about it", inputType: "date", placeholder: "Next Follow up date" },
  { id: "competitor", label: "Competitor / Existing solution" },
  { id: "timing", label: "Timing / priorities changed", inputType: "date", placeholder: "Next Follow up date" },
  { id: "trust", label: "Trust / Risk / Fit" },
  { id: "no_response", label: "No Response / delayed follow -up / Not interested now" },
  { id: "decision_maker", label: "Decision maker / internal dependency" },
  { id: "wrong_enquiry", label: "No / Never enquired / Wrong enquiry" },
];

function ReasonCheck({ checked }) {
  return (
    <span
      className={`size-5 rounded-md grid place-items-center shrink-0 border transition-colors ${
        checked ? "bg-[#16A34A] border-[#16A34A]" : "bg-[#F8EEF0] border-[#E8D4D8]"
      }`}
    >
      {checked && <Check size={12} className="text-white" strokeWidth={3} />}
    </span>
  );
}

/**
 * Win / Loss Analysis modal opened from Mark lost or Move to Cold & Hold.
 * On save, returns selected reason labels (+ optional notes) for Overview.
 */
export default function WinLossReasonsModal({ open, onClose, onSave, mode = "lost" }) {
  const [selected, setSelected] = useState({});
  const [details, setDetails] = useState({});
  const [priceEscalated, setPriceEscalated] = useState(false);
  const [others, setOthers] = useState("");
  const [briefNote, setBriefNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setSelected({});
    setDetails({});
    setPriceEscalated(false);
    setOthers("");
    setBriefNote("");
    setError("");
  }, [open, mode]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (id) => {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEscalation = (e) => {
    e.stopPropagation();
    setSelected((prev) => ({ ...prev, price: true }));
    setPriceEscalated(true);
    toast.success("Escalation message sent.");
  };

  const handleSave = () => {
    const picked = REASONS.filter((r) => selected[r.id]);
    if (picked.length === 0 && !others.trim()) {
      setError("Select at least one reason or fill in Others.");
      return;
    }
    if (!briefNote.trim()) {
      setError("Brief Comment / Note is required.");
      return;
    }

    const reasonParts = picked.map((r) => {
      if (r.id === "price" && priceEscalated) {
        return `${r.label} (Escalated)`;
      }
      const extra = details[r.id]?.trim();
      return extra ? `${r.label} (${extra})` : r.label;
    });
    if (others.trim()) reasonParts.push(`Others: ${others.trim()}`);

    onSave?.({
      reasons: reasonParts.join(", "),
      briefNote: briefNote.trim(),
      mode,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />

      <div className="relative z-10 w-full max-w-[560px] bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/8 shrink-0">
          <h2 className="text-[16px] font-bold text-[#111]">Win / Loss Analysis - Reasons</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#6f7886] hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4">
          <div className="flex flex-col">
            {REASONS.map((reason, i) => {
              const checked = !!selected[reason.id];
              return (
                <div key={reason.id} className={i < REASONS.length - 1 ? "border-b border-black/6" : ""}>
                  <button
                    type="button"
                    onClick={() => toggle(reason.id)}
                    className="w-full flex items-center gap-3 py-3 text-left"
                  >
                    <ReasonCheck checked={checked} />
                    <span className="text-[13.5px] font-medium text-[#111]">{reason.label}</span>
                  </button>
                  {reason.action === "escalation" && (
                    <div className="pb-3 pl-8">
                      <button
                        type="button"
                        onClick={handleEscalation}
                        className="h-9 px-4 rounded-xl border border-[#7A0A17]/25 bg-[#F8EEF0] text-[12.5px] font-semibold text-[#7A0A17] hover:bg-[#F3E4E7] transition-colors"
                      >
                        {priceEscalated ? "Escalation sent" : "Escalation"}
                      </button>
                    </div>
                  )}
                  {reason.inputType === "date" && (
                    <div className="pb-3 pl-8">
                      <input
                        type="date"
                        value={details[reason.id] || ""}
                        onChange={(e) =>
                          setDetails((prev) => ({ ...prev, [reason.id]: e.target.value }))
                        }
                        aria-label={reason.placeholder}
                        className="w-full h-10 px-3 rounded-xl border border-black/10 bg-white text-[13px] text-[#111] outline-none focus:border-[#7A0A17]/35 focus:ring-2 focus:ring-[#7A0A17]/10"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-col gap-4">
            <div>
              <label className="text-[13px] font-semibold text-[#111]">
                Others <span className="text-[#E8395B]">*</span>
              </label>
              <textarea
                value={others}
                onChange={(e) => setOthers(e.target.value)}
                placeholder="Write Comment"
                rows={3}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none resize-y focus:border-[#7A0A17]/35 focus:ring-2 focus:ring-[#7A0A17]/10"
              />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-[#111]">
                Brief Comment / Note <span className="text-[#E8395B]">*</span>
              </label>
              <textarea
                value={briefNote}
                onChange={(e) => setBriefNote(e.target.value)}
                placeholder="Write Comment"
                rows={3}
                className="mt-2 w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none resize-y focus:border-[#7A0A17]/35 focus:ring-2 focus:ring-[#7A0A17]/10"
              />
            </div>
          </div>

          {error && <p className="mt-3 text-[12.5px] font-medium text-[#E8395B]">{error}</p>}
        </div>

        <div className="flex items-center justify-end px-6 py-4 border-t border-black/8 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            className="h-[38px] px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] active:bg-[#54060F] transition-colors"
          >
            Save &amp; Update
          </button>
        </div>
      </div>
    </div>
  );
}
