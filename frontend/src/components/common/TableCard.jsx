import { SortableTh } from "./useTableSort.jsx";

/**
 * White card with a title/subtitle header, a horizontally-scrollable data
 * table and an optional footnote.
 * `columns` may be strings or `{ label, key, unsortable }`.
 * Pass `sort` + `onSort` from `useTableSort` to enable header sorting.
 */
export default function TableCard({ title, subtitle, badge, columns, children, footnote, sort, onSort }) {
  const cols = columns.map((col) => (typeof col === "string" ? { label: col } : col));

  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
        <div className="min-w-0">
          <h3 className="text-[14px] font-bold text-[#111]">{title}</h3>
          {subtitle && <p className="text-[12px] text-[#9CA3AF] mt-0.5">{subtitle}</p>}
        </div>
        {badge}
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full border-collapse min-w-[560px]">
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

      {footnote && (
        <p className="text-[11.5px] text-[#9CA3AF] bg-[#FAFAFB] border border-black/6 rounded-xl px-3.5 py-2.5 mt-4">
          {footnote}
        </p>
      )}
    </div>
  );
}
