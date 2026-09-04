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
    <aside className="fixed left-0 top-0 h-screen w-[58px] z-30 bg-[#7A0A17] flex flex-col">
      <div className="h-[56px] flex items-center justify-center shrink-0 border-b border-white/12">
        <img
          src={logo}
          alt="MakeMyLagan"
          className="w-8 h-auto object-contain"
        />
      </div>

      <nav className="flex flex-col items-center gap-1.5 pt-4 pb-4 flex-1 overflow-y-auto scrollbar-none">
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
              className={`group relative grid place-items-center size-9 rounded-lg shrink-0 transition-colors duration-150 ${
                isActive
                  ? "bg-white/18 text-white"
                  : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon size={17} strokeWidth={isActive ? 1.9 : 1.6} />

              {isActive && (
                <span className="absolute -right-[7px] top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full bg-white" />
              )}

              <span
                className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2
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
    </aside>
  );
}
