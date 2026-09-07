import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../../../../components/ui/Modal";

const DEMO_OTP = "123456";

/**
 * OTP gate before unlocking / committing personal-detail changes.
 * mode: "unlock" | "commit"
 */
export default function PersonalChangeOtpModal({
  open,
  mode = "unlock",
  changes = [],
  onClose,
  onVerified,
}) {
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open) return;
    setOtp("");
  }, [open]);

  const title = mode === "commit" ? "Verify OTP to save changes" : "Verify OTP to edit";
  const subtitle =
    mode === "commit"
      ? "Personal details changes need client OTP before they are saved."
      : "Unlock personal details only after OTP verification.";

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("OTP sent to client mobile (demo: 123456).");
    }, 400);
  };

  const handleVerify = () => {
    const code = otp.trim();
    if (code.length < 4) {
      toast.info("Enter the OTP sent to the client.");
      return;
    }
    if (code !== DEMO_OTP) {
      toast.error("Invalid OTP. Use 123456 for this demo.");
      return;
    }
    onVerified?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={<ShieldCheck size={18} />}
      iconBg="#F3E8F0"
      iconColor="#7A0A17"
      width="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleVerify}
            className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Verify &amp; continue
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {mode === "commit" && changes.length > 0 && (
          <div className="rounded-xl border border-black/8 bg-[#FAFAFB] px-3.5 py-3">
            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wide">
              {changes.length} change{changes.length === 1 ? "" : "s"} pending
            </p>
            <ul className="mt-2 flex flex-col gap-2 max-h-40 overflow-y-auto">
              {changes.map((c) => (
                <li key={c.key} className="text-[12.5px] text-[#374151]">
                  <span className="font-semibold text-[#111]">{c.label}</span>
                  <span className="text-[#9CA3AF]"> · </span>
                  <span className="text-[#6B7280] line-through">{c.from}</span>
                  <span className="text-[#9CA3AF]"> → </span>
                  <span className="font-medium text-[#111]">{c.to}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <label className="block text-[12.5px] font-medium text-[#374151] mb-1.5">Enter OTP</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit code"
            className="w-full h-11 rounded-xl border border-black/12 px-3.5 text-[14px] font-semibold tracking-[0.2em] text-[#111] outline-none focus:border-[#7A0A17]/40"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="mt-2 text-[12.5px] font-semibold text-[#7A0A17] hover:underline disabled:opacity-50"
          >
            {sending ? "Sending…" : "Send OTP to client mobile"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
