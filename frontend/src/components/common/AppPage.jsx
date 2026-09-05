import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

export function AppPage({ title, subtitle, actions, children }) {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pt-5 pb-8 flex flex-col gap-5 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h1 className="text-[26px] font-bold text-[#111] tracking-tight">{title}</h1>
            {subtitle && <p className="text-[13.5px] text-[#6B7280] mt-1 max-w-3xl leading-relaxed">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2.5 shrink-0 flex-wrap pt-0.5">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

export function OutlineBtn({ children, onClick, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors whitespace-nowrap ${className}`}
    >
      {children}
    </button>
  );
}

export function PrimaryBtn({ children, onClick, type = "button", className = "" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors whitespace-nowrap ${className}`}
    >
      {children}
    </button>
  );
}

export function NativeSelect({ value, onChange, options }) {
  return (
    <div className="relative shrink-0">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none h-10 pl-4 pr-9 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] outline-none cursor-pointer hover:bg-[#FAFAFB] transition-colors"
      >
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
    </div>
  );
}

const NOTE_TONE = {
  green: "text-[#16A34A]",
  red: "text-[#E8395B]",
  amber: "text-[#D97706]",
  grey: "text-[#6B7280]",
};

export function MetricCard({ label, value, note, detail, detailLink, noteTone = "grey", highlight = false, compact = false, className = "" }) {
  return (
    <div
      className={`rounded-2xl min-w-0 border ${compact ? "px-3 py-3" : "p-4"} ${
        highlight ? "bg-[#FCF5F6] border-[#7A0A17]/20" : "bg-white border-black/8"
      } ${className}`}
    >
      <p
        className={`font-semibold ${compact ? "text-[10px] uppercase tracking-wide" : "text-[12px]"} ${
          highlight ? "text-[#7A0A17]" : "text-[#6B7280]"
        }`}
      >
        {label}
      </p>
      <p className={`font-bold leading-tight ${compact ? "text-[22px] mt-1" : "text-[26px] mt-1.5"} ${highlight ? "text-[#7A0A17]" : "text-[#111]"}`}>
        {value}
      </p>
      {note && (
        <p className={`font-semibold ${compact ? "text-[11px] mt-1 leading-snug" : "text-[12px] mt-2"} ${highlight ? "text-[#7A0A17]/80" : NOTE_TONE[noteTone] || NOTE_TONE.grey}`}>
          {note}
        </p>
      )}
      {detailLink ? (
        <Link
          to={detailLink.to}
          className={`inline-flex items-center justify-center w-full rounded-lg bg-[#7A0A17] text-white font-semibold hover:bg-[#640712] transition-colors ${
            compact ? "h-7 px-2 mt-2 text-[11px]" : "h-8 px-3 mt-2.5 text-[12px]"
          }`}
        >
          {detailLink.label}
        </Link>
      ) : (
        detail && (
          <p className={`text-[#9CA3AF] font-medium leading-snug ${compact ? "text-[10.5px] mt-0.5" : "text-[11.5px] mt-1"}`}>
            {detail}
          </p>
        )
      )}
    </div>
  );
}

export function Panel({ title, subtitle, action, children, footnote }) {
  return (
    <section className="bg-white border border-black/8 rounded-2xl p-5">
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-bold text-[#111]">{title}</h2>}
            {subtitle && <p className="text-[12px] text-[#9CA3AF] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2 shrink-0 flex-wrap">{action}</div>}
        </div>
      )}
      {children}
      {footnote && <p className="text-[11.5px] text-[#9CA3AF] mt-4 leading-relaxed">{footnote}</p>}
    </section>
  );
}

export function Th({ children, className = "" }) {
  return (
    <th className={`px-4 py-3 text-left text-[10px] font-extrabold text-[#9CA3AF] uppercase tracking-wide whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, strong, muted, className = "" }) {
  return (
    <td
      className={`px-4 py-3 text-[13px] whitespace-nowrap ${
        strong ? "font-semibold text-[#111]" : muted ? "text-[#9CA3AF]" : "text-[#374151] font-medium"
      } ${className}`}
    >
      {children}
    </td>
  );
}
