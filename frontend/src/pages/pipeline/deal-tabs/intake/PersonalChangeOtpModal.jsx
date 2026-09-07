import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../../../../components/ui/Modal";

function OtpModalBody({ mode, changes, sectionLabel, onClose, onVerified }) {
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const title = mode === "commit" ? "Verify OTP to save changes" : "Verify OTP to edit";
  const subtitle =
    mode === "commit"
      ? sectionLabel
        ? `Send OTP to the client, then enter it to update ${sectionLabel}.`
        : "Send OTP to the client, then enter it before any client-record update is saved."
      : "Unlock personal details only after OTP verification.";

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      toast.success("OTP sent to client mobile (demo).");
    }, 400);
  };

  const handleVerify = () => {
    if (!sent) {
      toast.info("Send OTP to the client first.");
      return;
    }
    const code = otp.trim();
    if (!code.length) {
      toast.info("Enter the OTP sent to the client.");
      return;
    }
    // Demo mode: accept any OTP the user enters.
    onVerified?.();
  };

  return (
    <Modal
      open
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
            Verify &amp; update
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

        <div className="rounded-xl border border-[#7A0A17]/15 bg-[#FCF5F6] px-4 py-3.5">
          <p className="text-[13px] font-semibold text-[#7A0A17]">Step 1 — Send OTP to client</p>
          <p className="text-[12.5px] text-[#6B7280] mt-1">
            Demo mode: send OTP, then enter any code to continue.
          </p>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending}
            className="mt-3 h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors disabled:opacity-60"
          >
            {sending ? "Sending…" : sent ? "Resend OTP" : "Send OTP"}
          </button>
          {sent && (
            <p className="text-[12px] font-medium text-[#166534] mt-2">
              OTP sent. Enter any OTP to verify (demo).
            </p>
          )}
        </div>

        <div>
          <p className="text-[13px] font-semibold text-[#111] mb-1.5">Step 2 — Enter OTP</p>
          <label className="block text-[12.5px] font-medium text-[#374151] mb-1.5">
            OTP from client
          </label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="Enter any OTP (demo)"
            className="w-full h-11 rounded-xl border border-black/12 px-3.5 text-[14px] font-semibold tracking-[0.2em] text-[#111] outline-none focus:border-[#7A0A17]/40"
          />
        </div>
      </div>
    </Modal>
  );
}

/**
 * OTP gate before unlocking / committing client-record changes.
 * Demo: any OTP is accepted after Send OTP.
 * mode: "unlock" | "commit"
 */
export default function PersonalChangeOtpModal({
  open,
  mode = "unlock",
  changes = [],
  sectionLabel = "",
  onClose,
  onVerified,
}) {
  if (!open) return null;

  return (
    <OtpModalBody
      key={`${mode}-${sectionLabel}-${changes.map((c) => c.key).join(",")}`}
      mode={mode}
      changes={changes}
      sectionLabel={sectionLabel}
      onClose={onClose}
      onVerified={onVerified}
    />
  );
}
