import { useEffect, useId, useState } from "react";
import { Bell, Copy, FileText, IndianRupee, Mail, MessageSquare, Send, Upload } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";
import { defaultLinkMessage, shareUrl } from "../../utils/shareLinks";
import { recordLeadActivity } from "../../utils/leadActivityStore.js";

const LINK_TYPE_META = {
  payment: { id: "payment", label: "Payment link", icon: IndianRupee },
  biodata: { id: "biodata", label: "Biodata upload", icon: Upload },
  quote: { id: "quote", label: "Quotation", icon: FileText },
};

const SEND_CHANNELS = [
  { id: "email", label: "Email", icon: Mail },
  { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
  { id: "inapp", label: "In-app notification", icon: Bell },
];

export default function SendLinkModal({
  open,
  onClose,
  deal,
  currentStage,
  linkTypes = ["payment", "biodata"],
  initialType = "payment",
  title = "Send link",
  subtitle = "Share a link with this client",
  zClass = "z-[90]",
  embedded = false,
  hideHeader = false,
  beforeSend = null,
  afterSend = null,
  onSent = null,
  closeOnSend = true,
}) {
  const formId = `send-link-${useId().replace(/:/g, "")}`;
  const options = linkTypes.map((id) => LINK_TYPE_META[id]).filter(Boolean);
  const [channels, setChannels] = useState(["email"]);
  const [linkType, setLinkType] = useState(initialType);
  const [message, setMessage] = useState("");
  const email = String(deal?.email || "").trim();
  const mobile = String(deal?.mobile || deal?.phone || "").trim();
  const activeType = options.some((opt) => opt.id === linkType) ? linkType : options[0]?.id || "payment";
  const linkLabel = LINK_TYPE_META[activeType]?.label || "Link";
  const link = shareUrl(deal, activeType);

  useEffect(() => {
    if (!open && !embedded) return;
    const nextType = options.some((opt) => opt.id === initialType) ? initialType : options[0]?.id || "payment";
    setChannels(email && email !== "—" && email !== "-" ? ["email"] : ["whatsapp"]);
    setLinkType(nextType);
    setMessage(defaultLinkMessage(deal, nextType));
  }, [open, embedded, initialType, deal?.name, email]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleChannel = (id) => {
    setChannels((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const copyLink = () => {
    const text = shareUrl(deal, activeType);
    navigator.clipboard?.writeText(text).then(
      () => toast.success(`${linkLabel} copied.`),
      () => toast.error("Could not copy the link.")
    );
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (channels.length === 0) {
      toast.error("Select at least one channel.");
      return;
    }
    if (channels.includes("email") && (!email || email === "—" || email === "-")) {
      toast.error("This client has no email yet.");
      return;
    }
    if (channels.includes("whatsapp") && (!mobile || mobile === "—" || mobile === "-")) {
      toast.error("This client has no mobile yet.");
      return;
    }
    const typed = message.trim();
    if (!typed) {
      toast.error("Please type a message.");
      return;
    }
    const body = typed.includes(link) ? typed : `${typed}\n${link}`;
    const selected = SEND_CHANNELS.filter((opt) => channels.includes(opt.id)).map((opt) => opt.label);
    const via = selected.join(", ");
    if (deal && currentStage) {
      recordLeadActivity(deal, currentStage, {
        type: activeType === "quote" ? "quote" : "payment",
        title: `${linkLabel} sent to client`,
        detail: `Sent via ${via} — ${body}`,
      });
    }
    toast.success(`${linkLabel} sent to ${deal?.name || "client"} via ${via}.`);
    onSent?.({ linkType: activeType, channels: selected, message: body });
    if (closeOnSend) onClose?.();
  };

  const sendButton = (
    <button
      type="submit"
      form={formId}
      className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
    >
      <Send size={14} />
      Send
    </button>
  );

  const form = (
      <form id={formId} onSubmit={handleSend} className="flex flex-col gap-4">
        {options.length > 1 ? (
          <div>
            <p className="text-[13px] font-bold text-[#111] mb-1.5">Send</p>
            <div className="flex items-center gap-2 flex-wrap">
              {options.map((opt) => {
                const active = activeType === opt.id;
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setLinkType(opt.id);
                      setMessage(defaultLinkMessage(deal, opt.id));
                    }}
                    className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-[13px] font-semibold border transition-colors ${
                      active
                        ? "bg-[#7A0A17] text-white border-[#7A0A17]"
                        : "bg-white text-[#374151] border-black/12 hover:bg-[#FAFAFB]"
                    }`}
                  >
                    <Icon size={14} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
        <div>
          <p className="text-[13px] font-bold text-[#111] mb-1.5">Channel</p>
          <div className="flex items-center gap-2 flex-wrap">
            {SEND_CHANNELS.map((opt) => {
              const active = channels.includes(opt.id);
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleChannel(opt.id)}
                  className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-[13px] font-semibold border transition-colors ${
                    active
                      ? "bg-[#7A0A17] text-white border-[#7A0A17]"
                      : "bg-white text-[#374151] border-black/12 hover:bg-[#FAFAFB]"
                  }`}
                >
                  <Icon size={14} />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">Link</label>
          <div className="flex items-center gap-2 h-11 border border-black/12 rounded-xl px-3.5 bg-[#FAFAFB]">
            <span className="flex-1 min-w-0 truncate text-[13px] text-[#374151]">{link}</span>
            <button type="button" onClick={copyLink} aria-label="Copy link" title="Copy link" className="shrink-0 text-[#6B7280] hover:text-[#7A0A17]">
              <Copy size={15} />
            </button>
          </div>
        </div>
        <div>
          <label htmlFor={`${formId}-message`} className="block text-[13px] font-bold text-[#111] mb-1.5">
            Message <span className="text-[#E8395B]">*</span>
          </label>
          <textarea
            id={`${formId}-message`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Type a message to send with this link..."
            className="w-full border border-black/12 rounded-xl px-3.5 py-3 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17] resize-none"
          />
        </div>
      </form>
  );

  if (embedded) {
    return (
      <div className="bg-white border border-black/8 rounded-2xl min-w-0 overflow-hidden">
        {hideHeader ? null : (
          <div className="flex items-center gap-3 px-5 py-4 border-b border-black/10">
            <span className="size-9 rounded-xl grid place-items-center shrink-0 bg-[#FDF2F3] text-[#7A0A17]">
              <Send size={18} />
            </span>
            <div className="min-w-0">
              <h3 className="text-[15px] font-semibold text-[#1a1a1a] truncate">{title}</h3>
              {subtitle ? <p className="text-xs text-[#6f7886] mt-0.5">{subtitle}</p> : null}
            </div>
          </div>
        )}
        <div className="px-5 py-5">{form}</div>
        <div className="flex justify-end items-center gap-2.5 px-5 py-4 border-t border-black/10 flex-wrap">
          {beforeSend}
          {sendButton}
          {afterSend}
        </div>
      </div>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={<Send size={18} />}
      iconBg="#FDF2F3"
      iconColor="#7A0A17"
      width="max-w-lg"
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
          {sendButton}
        </>
      }
    >
      {form}
    </Modal>
  );
}
