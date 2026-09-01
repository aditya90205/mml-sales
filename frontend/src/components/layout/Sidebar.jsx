import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CheckSquare,
  Upload,
  KanbanSquare,
  Database,
  Trophy,
  Gift,
  Heart,
} from "lucide-react";

// ── 9 nav items exactly matching the spec ─────────────────────────────────────
const NAV_ITEMS = [
  { label: "Dashboard",      icon: LayoutDashboard, to: "/dashboard" },
  { label: "HRMS",           icon: Users,           to: "/hrms" },
  { label: "Calendar",       icon: CalendarDays,    to: "/calendar" },
  { label: "Tasks",          icon: CheckSquare,     to: "/tasks" },
  { label: "Bulk Upload",    icon: Upload,          to: "/bulk-upload" },
  { label: "Pipeline Board", icon: KanbanSquare,    to: "/pipeline" },
  { label: "Client Database",icon: Database,        to: "/clients" },
  { label: "Leaderboard",    icon: Trophy,          to: "/leaderboard" },
  { label: "Contest",        icon: Gift,            to: "/contest" },
];

// Sidebar width when icon-only
const W = "w-[64px]";

export default function Sidebar() {
  const location = useLocation();

  return (
    <div
      className={`fixed left-0 top-0 h-screen ${W} shrink-0 z-30 flex flex-col`}
      style={{
        background:
          "linear-gradient(175deg, #8b0000 0%, #6e0000 40%, #5a0a0a 75%, #3d0808 100%)",
      }}
    >
      {/* Brand logo mark */}
      <div className="h-16 flex items-center justify-center shrink-0 border-b border-white/10">
        <div className="size-9 rounded-xl bg-white/15 grid place-items-center">
          <Heart size={18} className="text-white" fill="white" />
        </div>
      </div>

      {/* Nav icons */}
      <nav className="flex flex-col items-center gap-1 py-4 flex-1 overflow-y-auto scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.to ||
            location.pathname.startsWith(item.to + "/");

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              title={item.label}
              className={`group relative flex items-center justify-center size-11 rounded-xl transition-all duration-150 ${
                isActive
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon
                size={20}
                strokeWidth={isActive ? 2 : 1.75}
                className="shrink-0"
              />

              {/* Tooltip on hover */}
              <span
                className="
                  pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2
                  bg-[#1a1a1a] text-white text-xs font-medium px-2.5 py-1.5 rounded-lg
                  whitespace-nowrap shadow-lg
                  opacity-0 group-hover:opacity-100
                  translate-x-1 group-hover:translate-x-0
                  transition-all duration-150
                  z-50
                "
              >
                {item.label}
                {/* arrow */}
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1a1a1a]" />
              </span>

              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-l-full bg-white" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User avatar at bottom */}
      <div className="py-4 flex items-center justify-center shrink-0 border-t border-white/10">
        <div className="relative group">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
            alt="Ankur Sharma"
            className="size-9 rounded-full object-cover ring-2 ring-white/20"
          />
          <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-[#4ade80] ring-2 ring-[#6e0000]" />

          {/* Tooltip */}
          <span
            className="
              pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2
              bg-[#1a1a1a] text-white text-xs font-medium px-2.5 py-1.5 rounded-lg
              whitespace-nowrap shadow-lg
              opacity-0 group-hover:opacity-100
              translate-x-1 group-hover:translate-x-0
              transition-all duration-150
              z-50
            "
          >
            Ankur Sharma
            <span className="block text-white/50 text-[10px] font-normal">Sales Manager</span>
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1a1a1a]" />
          </span>
        </div>
      </div>
    </div>
  );
}
