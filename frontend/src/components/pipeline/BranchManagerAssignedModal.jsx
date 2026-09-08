import { CheckCircle2 } from "lucide-react";
import Modal from "../ui/Modal.jsx";

const DUMMY_MANAGER = {
  name: "Priya Malhotra",
  role: "Service Manager",
  branch: "Rajouri Garden",
  phone: "+91 98765 43210",
};

/**
 * Success modal after "Handover to services" — shows assigned manager (no confirm step).
 */
export default function BranchManagerAssignedModal({
  open,
  onClose,
  clientName = "Client",
  dealCode,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Manager assigned"
      subtitle={dealCode ? `${clientName} · ${dealCode}` : clientName}
      icon={<CheckCircle2 size={18} />}
      iconBg="#E7F8EF"
      iconColor="#16A34A"
      width="max-w-md"
      footer={
        <button
          type="button"
          onClick={onClose}
          className="h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#5F0812] transition-colors"
        >
          Done
        </button>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-3.5 py-3 text-center">
          <p className="text-[14px] font-bold text-[#14532D]">Successfully assigned</p>
          <p className="text-[12px] text-[#166534] mt-0.5">
            Handover to services complete. Service manager is assigned.
          </p>
        </div>

        <div className="rounded-xl border border-black/8 px-4 py-3.5 flex items-center gap-3">
          <span className="size-11 rounded-full bg-[#7A0A17] text-white text-[13px] font-bold grid place-items-center shrink-0">
            PM
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-bold text-[#111]">{DUMMY_MANAGER.name}</p>
            <p className="text-[12px] text-[#6B7280] mt-0.5">
              {DUMMY_MANAGER.role} · {DUMMY_MANAGER.branch}
            </p>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5">{DUMMY_MANAGER.phone}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export { DUMMY_MANAGER };
