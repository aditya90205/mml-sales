import { useEffect, useState } from "react";
import { Mail, Plus } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";

const INPUT =
  "w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#3B82F6] bg-white";

function emailFromName(name) {
  const local = String(name || "client")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  return `${local || "client"}@mml.com`;
}

export default function SendEmailModal({
  open,
  onClose,
  recipientName = "Client",
  recipientEmail,
}) {
  const toEmail = recipientEmail || emailFromName(recipientName);
  const [ccList, setCcList] = useState([""]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setCcList([""]);
    setSubject("");
    setMessage("");
  }, [open]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error("Please enter an email subject.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please write your message.");
      return;
    }
    toast.success(`Email sent to ${recipientName}.`);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send Email"
      icon={<Mail size={18} />}
      iconBg="#E7F8EF"
      iconColor="#16A34A"
      width="max-w-lg"
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
            form="send-email-form"
            className="h-10 px-5 rounded-xl bg-[#3B82F6] text-white text-[13px] font-semibold hover:bg-[#2563EB] transition-colors"
          >
            Send Email
          </button>
        </>
      }
    >
      <form id="send-email-form" onSubmit={handleSend} className="flex flex-col gap-4">
        <p className="text-[13px] text-[#374151] -mt-1">
          Compose an email to <span className="font-bold text-[#111]">{recipientName}</span>
        </p>

        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">To</label>
          <input type="email" value={toEmail} readOnly className={`${INPUT} text-[#6B7280] bg-[#F9FAFB]`} />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">CC (Add other emails)</label>
          <div className="flex flex-col gap-2">
            {ccList.map((cc, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="email"
                  value={cc}
                  onChange={(e) => {
                    const next = [...ccList];
                    next[idx] = e.target.value;
                    setCcList(next);
                  }}
                  placeholder="xyz@mmlcompany.com"
                  className={`${INPUT} flex-1 min-w-0`}
                />
                {idx === ccList.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setCcList((prev) => [...prev, ""])}
                    className="shrink-0 size-11 rounded-xl border border-[#E8395B]/40 text-[#E8395B] grid place-items-center hover:bg-[#FDECEE] transition-colors"
                    aria-label="Add CC email"
                  >
                    <Plus size={18} strokeWidth={2.2} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">
            Subject <span className="text-[#E8395B]">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter email subject"
            className={INPUT}
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">
            Message <span className="text-[#E8395B]">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Write your message here..."
            className="w-full border border-black/12 rounded-xl px-3.5 py-3 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#3B82F6] resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
