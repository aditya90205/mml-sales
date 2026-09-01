import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  UserPlus,
  LayoutGrid,
  Briefcase,
  CalendarDays,
  Archive,
  KanbanSquare,
  Trophy,
  Gift,
} from "lucide-react";

// Nav items — order matches the design mock (icon-only rail).
const NAV_ITEMS = [
  { label: "Dashboard",       icon: Home,          to: "/dashboard" },
  { label: "Add Lead",        icon: UserPlus,      to: "/sales/leads" },
  { label: "Client Database", icon: LayoutGrid,    to: "/clients" },
  { label: "HRMS",            icon: Briefcase,     to: "/hrms" },
  { label: "Calendar",        icon: CalendarDays,  to: "/calendar" },
  { label: "Bulk Upload",     icon: Archive,       to: "/bulk-upload" },
  { label: "Pipeline Board",  icon: KanbanSquare,  to: "/pipeline" },
  { label: "Leaderboard",     icon: Trophy,        to: "/leaderboard" },
  { label: "Contest",         icon: Gift,          to: "/contest" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[58px] z-30 bg-white flex flex-col">
      {/* Maroon rail — flat solid block, ends below the last nav icon (as in the mock) */}
      <div className="bg-[#7A0A17] flex flex-col pb-6">
        {/* Logo block */}
        <div className="h-[62px] flex items-center justify-center border-b border-white/12">
          <img
            src="/favicon.svg"
            alt="MakeMyLagan"
            className="size-7 object-contain brightness-0 invert"
          />
        </div>

        {/* Nav icons */}
        <nav className="flex flex-col items-center gap-1.5 pt-4">
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
                className={`group relative grid place-items-center size-9 rounded-lg transition-colors duration-150 ${
                  isActive
                    ? "bg-white/18 text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon size={17} strokeWidth={1.6} />

                {/* Hover tooltip */}
                <span
                  className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2
                             bg-[#1a1a1a] text-white text-xs font-medium px-2.5 py-1.5 rounded-lg
                             whitespace-nowrap shadow-lg opacity-0 group-hover:opacity-100
                             translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50"
                >
                  {item.label}
                  <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1a1a1a]" />
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Collapse handle notch */}
      <span className="absolute left-0 top-[104px] w-[3px] h-8 rounded-r-full bg-white/70" />
    </aside>
  );
}