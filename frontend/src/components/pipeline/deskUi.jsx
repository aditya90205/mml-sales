import { ChevronDown } from "lucide-react";
import StatusPill from "../common/StatusPill";
import ChecklistCheck from "../common/ChecklistCheck";
import { SortableTh } from "../common/useTableSort.jsx";

export const FIELD =
  "w-full h-11 border border-black/12 rounded-xl px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none bg-white focus:border-[#7A0A17] transition-colors";

export function DeskPage({ title, actions, children }) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-3 sm:px-5 pt-4 sm:pt-5 pb-8 flex flex-col gap-4 sm:gap-5 min-w-0">
        <div className="flex items-start sm:items-center justify-between gap-3 flex-wrap">
          <h1 className="text-[22px] sm:text-[26px] font-bold text-[#111] tracking-tight min-w-0 break-words">
            {title}
          </h1>
          {actions && (
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-wrap w-full sm:w-auto">
              {actions}
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

export function OutlineButton({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 h-10 px-3 sm:px-4 rounded-xl bg-white border border-black/10 text-[12.5px] sm:text-[13px] font-semibold text-[#7A0A17] hover:bg-[#FAFAFB] transition-colors whitespace-nowrap flex-1 sm:flex-none"
    >
      {children}
    </button>
  );
}

export function PrimaryButton({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 h-10 px-3 sm:px-4 rounded-xl bg-[#7A0A17] text-white text-[12.5px] sm:text-[13px] font-semibold hover:bg-[#640712] transition-colors whitespace-nowrap flex-1 sm:flex-none"
    >
      {children}
    </button>
  );
}

export function FilterSelect({ value, onChange, options }) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-9 max-w-full pl-3.5 pr-8 rounded-xl bg-white border border-black/10 text-[12.5px] font-medium text-[#4B5563] outline-none cursor-pointer hover:bg-[#FAFAFB] transition-colors"
      >
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
      <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
    </div>
  );
}

export function ProgressMeter({ label, percent, color = "#16A34A" }) {
  return (
    <div className="w-full sm:w-[160px] sm:min-w-[150px]">
      <p className="text-[12px] font-semibold text-[#111] text-left sm:text-right mb-1.5">{label}</p>
      <div className="h-1.5 rounded-full bg-[#F1F2F4] overflow-hidden">
        <div className="h-full rounded-full transition-[width]" style={{ width: `${Math.min(100, Math.max(0, percent))}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export function Field({ label, required, children }) {
  return (
    <div className="min-w-0">
      <label className="block text-[12.5px] font-semibold text-[#111] mb-1.5">
        {label}
        {required && <span className="text-[#E8395B]"> *</span>}
      </label>
      {children}
    </div>
  );
}

export function SectionCard({ title, subtitle, meta, action, children, footnote }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-4 sm:p-5 overflow-hidden">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="min-w-0 flex-1">
          {title && <h3 className="text-[14px] sm:text-[15px] font-bold text-[#111] break-words">{title}</h3>}
          {subtitle && <p className="text-[12px] text-[#9CA3AF] mt-0.5 break-words">{subtitle}</p>}
          {meta && <p className="text-[12px] text-[#6B7280] mt-0.5 break-words">{meta}</p>}
        </div>
        {action && <div className="flex items-center gap-2 shrink-0 flex-wrap w-full sm:w-auto">{action}</div>}
      </div>
      {children}
      {footnote && (
        <p className="text-[11.5px] text-[#9CA3AF] bg-[#FAFAFB] border border-black/6 rounded-xl px-3.5 py-2.5 mt-4">
          {footnote}
        </p>
      )}
    </div>
  );
}

export function CheckRow({ done, title, note, status, tone, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center gap-3 py-3.5 border-b border-black/5 last:border-0 text-left cursor-pointer"
    >
      <ChecklistCheck done={done} />
      <div className="min-w-0 flex-1 flex items-center justify-between gap-2 flex-wrap">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[#111] leading-snug">{title}</p>
          {note && <p className="text-[11.5px] text-[#9CA3AF] mt-0.5 leading-snug break-words">{note}</p>}
        </div>
        {status && <StatusPill tone={tone}>{status}</StatusPill>}
      </div>
    </button>
  );
}

export function TimelineItem({ tone = "green", title, note, time, last }) {
  const colors = {
    green: "bg-[#16A34A]",
    amber: "bg-[#F59E0B]",
    red: "bg-[#E8395B]",
    gray: "bg-[#D1D5DB]",
    blue: "bg-[#3B82F6]",
  };
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <span className={`size-2.5 rounded-full mt-1.5 ${colors[tone] || colors.green}`} />
        {!last && <span className="w-px flex-1 bg-black/8 mt-1" />}
      </div>
      <div className={`min-w-0 flex-1 ${last ? "pb-0" : "pb-5"}`}>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-[#111]">{title}</p>
            {note && <p className="text-[12px] text-[#6B7280] mt-0.5 leading-relaxed">{note}</p>}
          </div>
          {time && <p className="text-[11.5px] text-[#9CA3AF] whitespace-nowrap">{time}</p>}
        </div>
      </div>
    </div>
  );
}

export function DeskTable({ columns, sort, onSort, children }) {
  const cols = columns.map((col) => (typeof col === "string" ? { label: col } : col));
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr className="bg-[#FAF3F2]">
            {cols.map((col, i) => (
              <SortableTh
                key={col.key || col.label}
                label={col.label}
                sortKey={col.key}
                sort={sort}
                onSort={onSort}
                unsortable={col.unsortable}
                className={`px-3 py-2 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap ${
                  i === 0 ? "rounded-l-lg" : ""
                } ${i === cols.length - 1 ? "rounded-r-lg" : ""}`}
              />
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, strong, muted }) {
  return (
    <td
      className={`px-3 py-3 text-[12.5px] whitespace-nowrap ${
        strong ? "font-semibold text-[#111]" : muted ? "text-[#9CA3AF]" : "text-[#4B5563]"
      }`}
    >
      {children}
    </td>
  );
}

export function StepLabel({ n, children }) {
  return (
    <div className="flex items-center gap-2 mb-3 sm:mb-4">
      <span className="size-5 rounded-full bg-[#FDECEE] text-[#E8395B] text-[11px] font-bold grid place-items-center shrink-0">
        {n}
      </span>
      <p className="text-[13px] sm:text-[13.5px] font-bold text-[#111] min-w-0 break-words">{children}</p>
    </div>
  );
}
