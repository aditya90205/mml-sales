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
  Megaphone,
} from "lucide-react";
import logo from "../../assets/logo.png";

const NAV_ITEMS = [
  { label: "Dashboard",       icon: LayoutDashboard, to: "/dashboard" },
  { label: "Calendar",        icon: CalendarDays,    to: "/calendar" },
  { label: "Bulk Upload",     icon: Upload,          to: "/bulk-upload" },
  { label: "Pipeline Board",  icon: KanbanSquare,    to: "/pipeline" },
  { label: "Campaign",        icon: Megaphone,       to: "/campaign/management" },
  { label: "Client Database", icon: Database,        to: "/clients" },
  { label: "Tasks",           icon: CheckSquare,     to: "/tasks" },
  { label: "HRMS",            icon: Users,           to: "/hrms" },
  { label: "Leaderboard",     icon: Trophy,          to: "/leaderboard" },
  { label: "Contest",         icon: Gift,            to: "/contest" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside
      className="group/sidebar fixed left-0 top-0 h-screen w-[58px] hover:w-[228px] z-[60] bg-[#7A0A17]
                 flex flex-col overflow-x-hidden transition-[width] duration-300 ease-in-out
                 shadow-[4px_0_24px_rgba(0,0,0,0.18)] hover:shadow-[8px_0_32px_rgba(0,0,0,0.28)]"
    >
      <div className="h-[56px] flex items-center gap-3 px-[11px] shrink-0 border-b border-white/12">
        <img
          src={logo}
          alt="MakeMyLagan"
          className="w-8 h-auto object-contain shrink-0"
        />
        <span
          className="text-white font-semibold text-[13px] whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100
                     transition-opacity duration-200 group-hover/sidebar:delay-150"
        >
          MakeMyLagan
        </span>
      </div>

      <nav className="flex flex-col gap-1.5 pt-4 pb-4 flex-1 overflow-y-auto overflow-x-hidden scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const isActive =
            location.pathname === item.to ||
            location.pathname.startsWith(item.to + "/");

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              aria-label={item.label}
              className={`relative flex items-center h-9 mx-2.5 rounded-lg shrink-0 overflow-hidden transition-colors duration-150 ${
                isActive
                  ? "bg-white/18 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="relative grid place-items-center size-9 shrink-0">
                <item.icon size={17} strokeWidth={isActive ? 1.9 : 1.6} />
                {isActive && (
                  <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full bg-white" />
                )}
              </span>

              <span
                className="text-[13px] font-medium whitespace-nowrap pr-4 -ml-1 opacity-0
                           group-hover/sidebar:opacity-100 transition-opacity duration-200
                           group-hover/sidebar:delay-150"
              >
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
