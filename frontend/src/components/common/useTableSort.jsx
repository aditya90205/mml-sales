import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

function parseSortNumber(v) {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  const s = String(v ?? "").replace(/[₹,%h]/gi, "").replace(/,/g, "").trim();
  if (!s || !/^-?\d/.test(s)) return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

export function compareValues(a, b, dir = "asc") {
  const an = parseSortNumber(a);
  const bn = parseSortNumber(b);
  if (an != null && bn != null) return dir === "asc" ? an - bn : bn - an;
  const as = String(a ?? "");
  const bs = String(b ?? "");
  const cmp = as.localeCompare(bs, undefined, { numeric: true, sensitivity: "base" });
  return dir === "asc" ? cmp : -cmp;
}

export function useTableSort(rows, { defaultKey = null, defaultDir = "asc", getValue } = {}) {
  const [sort, setSort] = useState({ key: defaultKey, dir: defaultDir });

  const toggle = (key) => {
    if (!key) return;
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };

  const sorted = useMemo(() => {
    const list = Array.isArray(rows) ? rows : [];
    if (!sort.key) return list;
    const arr = [...list];
    arr.sort((a, b) => {
      const av = getValue ? getValue(a, sort.key) : a?.[sort.key];
      const bv = getValue ? getValue(b, sort.key) : b?.[sort.key];
      return compareValues(av, bv, sort.dir);
    });
    return arr;
  }, [rows, sort, getValue]);

  return { sorted, sort, toggle };
}

export function SortableTh({
  label,
  sortKey,
  sort,
  onSort,
  unsortable = false,
  className = "",
  children,
}) {
  const canSort = !unsortable && Boolean(sortKey) && typeof onSort === "function";
  const active = sort?.key === sortKey;

  return (
    <th
      onClick={() => canSort && onSort(sortKey)}
      className={`group select-none ${canSort ? "cursor-pointer hover:text-[#4B5563]" : ""} ${className}`}
    >
      <span className="inline-flex items-end gap-1 leading-tight">
        {children ?? <span className="whitespace-pre-line">{label}</span>}
        {canSort && (
          active ? (
            sort.dir === "asc" ? (
              <ChevronUp size={12} className="text-[#7A0A17] shrink-0 mb-px" />
            ) : (
              <ChevronDown size={12} className="text-[#7A0A17] shrink-0 mb-px" />
            )
          ) : (
            <ChevronUp size={12} className="text-[#D1D5DB] opacity-0 group-hover:opacity-100 shrink-0 mb-px" />
          )
        )}
      </span>
    </th>
  );
}
