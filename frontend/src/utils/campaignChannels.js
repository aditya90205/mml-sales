import { Bell, Mail, MessageSquare } from "lucide-react";
import WhatsAppIcon from "../components/common/WhatsAppIcon.jsx";

export { WHATSAPP_GREEN } from "../components/common/WhatsAppIcon.jsx";

export const CHANNEL_ICON_MAP = {
  Email: Mail,
  WhatsApp: WhatsAppIcon,
  SMS: MessageSquare,
  Push: Bell,
};

export function parseChannels(channelStr) {
  return String(channelStr || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .map((label) => ({
      label,
      Icon: CHANNEL_ICON_MAP[label] || Mail,
      isWhatsApp: label === "WhatsApp",
    }));
}
