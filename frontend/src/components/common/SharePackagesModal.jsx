import { useEffect, useId, useState } from "react";
import { Copy, Mail, MessageSquare, Package, Send } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../ui/Modal";
import WhatsAppIcon from "./WhatsAppIcon.jsx";
import { SHARE_BASE } from "../../utils/shareLinks";

const CHANNELS = [
  { id: "sms", label: "SMS", icon: MessageSquare },
  { id: "email", label: "Email", icon: Mail },
  { id: "whatsapp", label: "WhatsApp", icon: WhatsAppIcon },
];

const PACKAGES_SHARE_URL = `${SHARE_BASE}/packages`;

function defaultPackagesMessage(packages, currency) {
  const lines = [
    "Hi,",
    "Here are MatchMakers package options:",
    "",
  ];
  packages.forEach((pkg) => {
    const price = currency === "usd" ? pkg.priceUsd : pkg.price;
    lines.push(`• ${pkg.name} — ${price} (${pkg.subtitle})`);
  });
  lines.push("", PACKAGES_SHARE_URL);
  return lines.join("\n");
}

export default function SharePackagesModal({ open, onClose, packages = [], currency = "inr", zClass = "z-[100]" }) {
  const formId = `share-packages-${useId().replace(/:/g, "")}`;
  const [channels, setChannels] = useState(["whatsapp"]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!open) return;
    setChannels(["whatsapp"]);
    setMessage(defaultPackagesMessage(packages, currency));
  }, [open, currency, packages]);

  const toggleChannel = (id) => {
    setChannels((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(PACKAGES_SHARE_URL).then(
      () => toast.success("Package link copied."),
      () => toast.error("Could not copy the link.")
    );
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (channels.length === 0) {
      toast.error("Select at least one channel.");
      return;
    }
    const typed = message.trim();
    if (!typed) {
      toast.error("Please type a message.");
      return;
    }
    const via = CHANNELS.filter((opt) => channels.includes(opt.id))
      .map((opt) => opt.label)
      .join(", ");
    toast.success(`Packages shared via ${via}.`);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Share Packages"
      subtitle="Send the package catalogue to a prospect or client"
      icon={<Package size={18} />}
      iconBg="#F6E4E8"
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
          <button
            type="submit"
            form={formId}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            <Send size={14} />
            Share
          </button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSend} className="flex flex-col gap-4">
        <div>
          <p className="text-[13px] font-bold text-[#111] mb-1.5">Channel</p>
          <div className="flex items-center gap-2 flex-wrap">
            {CHANNELS.map((opt) => {
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
                  {opt.id === "whatsapp" ? (
                    <WhatsAppIcon size={14} withBg={false} color="currentColor" />
                  ) : (
                    <Icon size={14} />
                  )}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-bold text-[#111] mb-1.5">Link</label>
          <div className="flex items-center gap-2 h-11 border border-black/12 rounded-xl px-3.5 bg-[#FAFAFB]">
            <span className="flex-1 min-w-0 truncate text-[13px] text-[#374151]">{PACKAGES_SHARE_URL}</span>
            <button
              type="button"
              onClick={copyLink}
              aria-label="Copy link"
              title="Copy link"
              className="shrink-0 inline-flex items-center gap-1.5 text-[#6B7280] hover:text-[#7A0A17] text-[12.5px] font-semibold"
            >
              <Copy size={15} />
              Copy
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
            rows={7}
            placeholder="Type a message to send with this link..."
            className="w-full border border-black/12 rounded-xl px-3.5 py-3 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17] resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
