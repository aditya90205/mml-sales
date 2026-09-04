import { Bell, Mail, MessageCircle, MessageSquare } from "lucide-react";

export const CHANNEL_ICON_MAP = {
  Email: Mail,
  WhatsApp: MessageSquare,
  SMS: MessageCircle,
  Push: Bell,
};

export function parseChannels(channelStr) {
  return String(channelStr || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean)
    .map((label) => ({ label, Icon: CHANNEL_ICON_MAP[label] || MessageSquare }));
}
