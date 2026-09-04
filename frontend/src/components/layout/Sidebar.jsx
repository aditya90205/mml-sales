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
  BarChart3,
  Wallet,
  Snowflake,
  Handshake,
} from "lucide-react";
import logo from "../../assets/logo.png";

const NAV_ITEMS = [
  { label: "Dashboard",       icon: LayoutDashboard, to: "/dashboard" },
  { label: "Calendar",        icon: CalendarDays,    to: "/calendar" },
  { label: "Bulk Upload",     icon: Upload,          to: "/bulk-upload" },
  { label: "Pipeline Board",  icon: KanbanSquare,    to: "/pipeline" },
  { label: "Post Sales",      icon: Handshake,       to: "/post-sales" },
  { label: "Campaign",        icon: Megaphone,       to: "/campaign/management" },
  { label: "Client Database", icon: Database,        to: "/clients" },
  { label: "Win / Loss",      icon: BarChart3,       to: "/win-loss" },
  { label: "Incentives",      icon: Wallet,          to: "/incentives" },
  { label: "Cold Pool",       icon: Snowflake,       to: "/cold-pool" },
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
                 flex flex-col overflow-hidden
                 transition-[width,box-shadow] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)]
                 shadow-[4px_0_24px_rgba(0,0,0,0.18)] hover:shadow-[8px_0_32px_rgba(0,0,0,0.28)]"
    >
      <div className="h-[56px] flex items-center gap-3 px-[11px] shrink-0 border-b border-white/12">
        <img
          src={logo}
          alt="MakeMyLagan"
          className="w-8 h-auto object-contain shrink-0"
        />
        <span
          className="text-white font-semibold text-[13px] whitespace-nowrap
                     opacity-0 -translate-x-2 pointer-events-none
                     group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0
                     transition-[opacity,transform] duration-300 ease-out
                     group-hover/sidebar:delay-100"
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
              className={`relative flex items-center h-9 mx-2.5 rounded-lg shrink-0 transition-colors duration-150 ${
                isActive
                  ? "bg-white/18 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-white pointer-events-none"
                />
              )}

              <span className="grid place-items-center size-9 shrink-0">
                <item.icon size={17} strokeWidth={isActive ? 1.9 : 1.6} />
              </span>

              <span
                className="text-[13px] font-medium whitespace-nowrap pr-4 -ml-1
                           opacity-0 -translate-x-2 pointer-events-none
                           group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0
                           transition-[opacity,transform] duration-300 ease-out
                           group-hover/sidebar:delay-100"
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
