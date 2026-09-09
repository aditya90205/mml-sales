import { Search, X } from "lucide-react";

/**
 * Live search field with clear (X). Filters as the user types — no Search button needed.
 */
export default function SearchField({
  value = "",
  onChange,
  placeholder = "Search...",
  className = "",
  inputClassName = "",
  size = "md",
}) {
  const isSm = size === "sm";
  const hasValue = Boolean(String(value).length);

  return (
    <div
      className={`flex items-center gap-2 rounded-xl bg-white border border-black/10 focus-within:border-[#7A0A17]/40 transition-colors ${
        isSm ? "h-9 px-3" : "h-10 px-3.5"
      } ${className}`}
    >
      <Search size={isSm ? 14 : 15} className="text-[#9CA3AF] shrink-0" />
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`bg-transparent text-[#111] placeholder:text-[#9CA3AF] outline-none w-full min-w-0 ${
          isSm ? "text-xs" : "text-[13px]"
        } ${inputClassName}`}
      />
      {hasValue ? (
        <button
          type="button"
          onClick={() => onChange?.("")}
          className="size-5 rounded-full grid place-items-center text-[#9CA3AF] hover:text-[#4B5563] hover:bg-black/5 shrink-0 transition-colors"
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      ) : null}
    </div>
  );
}
