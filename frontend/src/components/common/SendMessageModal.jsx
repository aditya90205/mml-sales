import { useEffect, useRef, useState } from "react";
import { Image as ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";

export default function SendMessageModal({ open, onClose }) {
  const fileInputRef = useRef(null);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (!open) return;
    setMessage("");
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please type a message.");
      return;
    }
    toast.success(file ? `Message sent with ${file.name}.` : "Message sent.");
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Send Message"
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
            form="send-message-form"
            className="h-10 px-5 rounded-xl bg-[#F97316] text-white text-[13px] font-semibold hover:bg-[#EA580C] transition-colors"
          >
            Send Message
          </button>
        </>
      }
    >
      <form id="send-message-form" onSubmit={handleSend} className="flex flex-col gap-4">
        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">
            Message <span className="text-[#E8395B]">*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Type your message..."
            className="w-full border border-black/12 rounded-xl px-3.5 py-3 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#F97316] resize-none"
          />
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">Attachment</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={file?.name || ""}
              placeholder="Attach PDF, image, or document"
              className="flex-1 min-w-0 h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none bg-white"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 inline-flex items-center gap-1.5 h-11 px-4 rounded-xl bg-white border border-black/12 text-[13px] font-semibold text-[#111] hover:bg-[#FAFAFB] transition-colors"
            >
              <ImageIcon size={15} className="text-[#6B7280]" />
              Browse
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*,.doc,.docx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
