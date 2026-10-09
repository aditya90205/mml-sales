import { useEffect, useId, useRef, useState } from "react";
import { ShieldCheck, Upload, X } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";
import { markPaymentVerified } from "../../utils/paymentVerifyStore";

const ACCEPT = ".jpg,.jpeg,.png,.webp,.pdf";

export default function VerifyPaymentModal({
  open,
  onClose,
  dealId,
  clientName = "",
  packageName = "",
  packageMonths = null,
  amount = null,
  zClass = "z-[120]",
  onVerified,
}) {
  const formId = `verify-payment-${useId().replace(/:/g, "")}`;
  const fileRef = useRef(null);
  const [transactionId, setTransactionId] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!open) return;
    setTransactionId("");
    setFile(null);
  }, [open]);

  useEffect(() => {
    if (!file || !file.type?.startsWith("image/")) {
      setPreview(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const clearFile = () => {
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const txn = transactionId.trim();
    if (!txn) {
      toast.error("Enter the transaction ID.");
      return;
    }
    if (!file) {
      toast.error("Upload a payment screenshot.");
      return;
    }
    const record = markPaymentVerified(dealId, {
      transactionId: txn,
      screenshotName: file.name,
      amount,
      packageName,
      clientName,
      months: packageMonths,
    });
    toast.success("Payment verified. Invoice is ready.");
    onVerified?.(record);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Verify payment"
      subtitle="Enter transaction ID and upload the payment screenshot"
      icon={<ShieldCheck size={18} />}
      iconBg="#FDF2F3"
      iconColor="#7A0A17"
      width="max-w-md"
      zClass={zClass}
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-5 rounded-xl bg-white border border-black/12 text-[#111] text-[13px] font-semibold hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form={formId}
            className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Upload &amp; Verify
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor={`${formId}-txn`} className="block text-[13px] font-bold text-[#111] mb-1.5">
            Transaction ID <span className="text-[#E8395B]">*</span>
          </label>
          <input
            id={`${formId}-txn`}
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="e.g. UPI1234567890"
            className="w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]"
          />
        </div>

        <div>
          <p className="text-[13px] font-bold text-[#111] mb-1.5">
            Screenshot <span className="text-[#E8395B]">*</span>
          </p>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              const next = e.target.files?.[0] || null;
              setFile(next);
            }}
          />
          {file ? (
            <div className="rounded-xl border border-black/12 bg-[#FAFAFB] p-3.5">
              {preview ? (
                <img
                  src={preview}
                  alt="Payment screenshot"
                  className="h-36 w-full object-cover rounded-lg border border-black/8 bg-white mb-2.5"
                />
              ) : (
                <div className="h-20 rounded-lg border border-black/8 bg-white grid place-items-center text-[12px] font-medium text-[#6B7280] mb-2.5">
                  {file.name}
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] text-[#16A34A] truncate min-w-0">{file.name}</p>
                <button
                  type="button"
                  onClick={clearFile}
                  className="inline-flex items-center justify-center size-7 rounded-lg text-[#6B7280] hover:bg-white hover:text-[#111] shrink-0"
                  aria-label="Remove screenshot"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-xl border border-dashed border-black/15 bg-[#FAFAFB] px-4 py-6 flex flex-col items-center gap-2 hover:bg-[#F5F5F6] transition-colors"
            >
              <span className="size-9 rounded-full bg-[#FDF2F3] text-[#7A0A17] grid place-items-center">
                <Upload size={16} />
              </span>
              <span className="text-[13px] font-semibold text-[#111]">Upload screenshot</span>
              <span className="text-[11.5px] text-[#9CA3AF]">JPG, PNG or PDF</span>
            </button>
          )}
        </div>
      </form>
    </Modal>
  );
}
