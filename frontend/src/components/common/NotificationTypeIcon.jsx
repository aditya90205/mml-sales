import {
  UserPlus,
  Phone,
  ShieldCheck,
  IndianRupee,
  Calendar,
  SquareCheck,
  Users,
  Megaphone,
  FileText,
  ArrowRightLeft,
  UserCheck,
  Bell,
} from "lucide-react";

const TYPE_STYLES = {
  Lead: {
    Icon: UserPlus,
    bg: "bg-[#EEF2FF]",
    color: "text-[#4F46E5]",
    ring: "ring-[#C7D2FE]",
  },
  "Follow-up": {
    Icon: Phone,
    bg: "bg-[#FFF7ED]",
    color: "text-[#EA580C]",
    ring: "ring-[#FED7AA]",
  },
  Approval: {
    Icon: ShieldCheck,
    bg: "bg-[#F5F3FF]",
    color: "text-[#7C3AED]",
    ring: "ring-[#DDD6FE]",
  },
  Payment: {
    Icon: IndianRupee,
    bg: "bg-[#ECFDF5]",
    color: "text-[#059669]",
    ring: "ring-[#A7F3D0]",
  },
  Meeting: {
    Icon: Calendar,
    bg: "bg-[#EFF6FF]",
    color: "text-[#2563EB]",
    ring: "ring-[#BFDBFE]",
  },
  Task: {
    Icon: SquareCheck,
    bg: "bg-[#F0FDFA]",
    color: "text-[#0D9488]",
    ring: "ring-[#99F6E4]",
  },
  Client: {
    Icon: Users,
    bg: "bg-[#FDF2F8]",
    color: "text-[#DB2777]",
    ring: "ring-[#FBCFE8]",
  },
  Campaign: {
    Icon: Megaphone,
    bg: "bg-[#FFFBEB]",
    color: "text-[#D97706]",
    ring: "ring-[#FDE68A]",
  },
};

const TITLE_OVERRIDES = [
  { match: /bio\s*data|document/i, Icon: FileText, bg: "bg-[#F8FAFC]", color: "text-[#475569]", ring: "ring-[#CBD5E1]" },
  { match: /stage\s*moved|moved from/i, Icon: ArrowRightLeft, bg: "bg-[#EEF2FF]", color: "text-[#4F46E5]", ring: "ring-[#C7D2FE]" },
  { match: /converted|registered/i, Icon: UserCheck, bg: "bg-[#ECFDF5]", color: "text-[#059669]", ring: "ring-[#A7F3D0]" },
  { match: /payment\s*due|pending/i, Icon: IndianRupee, bg: "bg-[#FEF3C7]", color: "text-[#D97706]", ring: "ring-[#FDE68A]" },
  { match: /discount\s*approved|approved/i, Icon: ShieldCheck, bg: "bg-[#ECFDF5]", color: "text-[#059669]", ring: "ring-[#A7F3D0]" },
];

function resolveStyle(type, title = "") {
  for (const rule of TITLE_OVERRIDES) {
    if (rule.match.test(title)) {
      return {
        Icon: rule.Icon,
        bg: rule.bg,
        color: rule.color,
        ring: rule.ring,
      };
    }
  }
  return (
    TYPE_STYLES[type] || {
      Icon: Bell,
      bg: "bg-[#F3F4F6]",
      color: "text-[#6B7280]",
      ring: "ring-[#E5E7EB]",
    }
  );
}

/**
 * Attractive colored icon for a notification type (replaces profile avatars).
 */
export default function NotificationTypeIcon({ type, title = "", size = "md", className = "" }) {
  const { Icon, bg, color, ring } = resolveStyle(type, title);
  const box =
    size === "sm"
      ? "size-8"
      : size === "lg"
        ? "size-11"
        : "size-9";
  const iconSize = size === "sm" ? 14 : size === "lg" ? 18 : 16;

  return (
    <span
      className={`${box} rounded-xl ${bg} ring-1 ${ring} grid place-items-center shrink-0 ${className}`}
      aria-hidden
    >
      <Icon size={iconSize} className={color} strokeWidth={2.2} />
    </span>
  );
}
