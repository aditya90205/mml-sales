import { useRef, useState } from "react";
import { ChevronDown, Download, FileSpreadsheet, Trash2, Upload } from "lucide-react";
import { toast } from "react-toastify";
// TopBar is provided by Layout
import TableCard from "../components/common/TableCard";
import StatusPill from "../components/common/StatusPill";
import { useTableSort } from "../components/common/useTableSort.jsx";

const STATS = [
  { label: "Imports this month", value: "14",    note: "8 Meta, 4 Google, 2 Excel", noteTone: "green", caption: "All sources tagged" },
  { label: "Rows processed",     value: "1,284", note: "96% accepted",              noteTone: "green", caption: "Last 30 days" },
  { label: "Rejected rows",      value: "52",    note: "Missing source or mobile",  noteTone: "red",   caption: "Downloadable error file" },
  { label: "Duplicates merged",  value: "38",    note: "On mobile and email",       noteTone: "green", caption: "Auto-merge on exact match" },
];

const MAPPING_FIELDS = [
  { value: "first_name", label: "First name" },
  { value: "last_name",  label: "Last name" },
  { value: "mobile",     label: "Mobile" },
  { value: "alt_mobile", label: "Alt mobile" },
  { value: "city",       label: "City / area" },
  { value: "skip",       label: "Not imported" },
];

const COLUMNS = [
  { key: "first_name", letter: "A", header: "first_name", field: "first_name" },
  { key: "last_name",  letter: "B", header: "last_name",  field: "last_name" },
  { key: "mobile",     letter: "C", header: "mobile",     field: "mobile" },
  { key: "alt_no",     letter: "D", header: "alt_no",     field: "alt_mobile" },
  { key: "locality",   letter: "E", header: "locality",   field: "city" },
];

const PREVIEW_ROWS = [
  { first_name: "Ritika", last_name: "Sharma", mobile: "98*****210", alt_no: "-",           locality: "Rohini" },
  { first_name: "Aman",   last_name: "Gupta",  mobile: "98*****210", alt_no: "98*****210",  locality: "Pitampura" },
  { first_name: "Neha",   last_name: "Jain",   mobile: "98*****210", alt_no: "-",           locality: "Dwarka" },
  { first_name: "Sahil",  last_name: "Arora",  mobile: "98*****210", alt_no: "98*****210",  locality: "Rohini" },
];

const RECENT_IMPORTS = [
  { source: "Meta Lead Ads · hourly sync",  rows: 26, accepted: 24, rejected: 2, duplicate: 3,  status: "Completed" },
  { source: "Google Ads · daily sync",      rows: 31, accepted: 31, rejected: 0, duplicate: 0,  status: "Completed" },
  { source: "leads-newspaper-aug-wl.xlsx",  rows: 48, accepted: 44, rejected: 4, duplicate: 5,  status: "Completed" },
  { source: "LinkedIn export.csv",          rows: 19, accepted: 12, rejected: 7, duplicate: 8,  status: "Partial" },
  { source: "sabha-event-jul.xlsx",         rows: 64, accepted: 64, rejected: 0, duplicate: 2,  status: "Completed" },
];

const STATUS_TONES = { Completed: "green", Partial: "amber", Failed: "red" };

function StatCard({ label, value, note, noteTone, caption }) {
  const noteColor = noteTone === "red" ? "text-[#E8395B]" : "text-[#16A34A]";
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-5 min-w-0">
      <p className="text-[10.5px] font-semibold text-[#9CA3AF] uppercase tracking-wide">{label}</p>
      <p className="text-[26px] font-bold text-[#111] mt-1.5">{value}</p>
      <p className={`text-[12px] font-semibold mt-2 ${noteColor}`}>{note}</p>
      <p className="text-[11px] text-[#9CA3AF] mt-0.5">{caption}</p>
    </div>
  );
}

function FieldSelect({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 pl-3 pr-8 rounded-lg bg-white border border-black/12 text-[12.5px] font-medium text-[#111] appearance-none focus:outline-none focus:border-[#7A0A17]"
      >
        {MAPPING_FIELDS.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>
      <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
    </div>
  );
}

/**
 * Bulk Import (Lead Generation) — Excel/CSV fallback for bulk lead capture,
 * alongside the API sync summary. Column mapping and preview are shown for
 * an uploaded file; the actual parse/import wiring lands once a real file
 * is selected (mock data is used here for the design pass).
 */
export default function BulkImportPage() {
  const fileInputRef = useRef(null);
  const { sorted: sortedPreview, sort: previewSort, toggle: togglePreview } = useTableSort(PREVIEW_ROWS, { defaultKey: "first_name" });
  const { sorted: sortedImports, sort: importSort, toggle: toggleImports } = useTableSort(RECENT_IMPORTS, { defaultKey: "source" });
  const [fileName, setFileName] = useState("walkin-register-aug.xlsx");
  const [mapping, setMapping] = useState(
    Object.fromEntries(COLUMNS.map((c) => [c.key, c.field]))
  );
  const [leadSource, setLeadSource] = useState("Walk-in register - South Ex");
  const [campaignTag, setCampaignTag] = useState("");

  const firstRow = PREVIEW_ROWS[0];
  const mappedColumnCount = Object.values(mapping).filter((v) => v !== "skip").length;

  const handleFileChosen = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    toast.info(`"${file.name}" selected. Column mapping and preview will update once import parsing is wired up.`);
    e.target.value = "";
  };

  const handleDeleteFile = () => {
    setFileName("");
    setMapping(Object.fromEntries(COLUMNS.map((c) => [c.key, c.field])));
    toast.success("Uploaded file removed.");
  };

  const handleImport = () => {
    toast.success(`Import queued for ${PREVIEW_ROWS.length} preview rows (96 rows in the full file).`);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#F8F9FA]">
      {/* TopBar is provided by Layout */}

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleFileChosen}
      />

      <div className="p-5 flex flex-col gap-5 overflow-y-auto scrollbar-thin">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] font-bold text-[#111] tracking-tight">Bulk Import</h1>
            <p className="text-[13px] text-[#9CA3AF] mt-1">API syncs and the Excel fallback for bulk lead data</p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => toast.info("Downloading import template...")}
              className="h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            >
              Download template
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              <Upload size={15} /> Upload file
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Quick view & mapping */}
        <div className="bg-white border border-black/8 rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
            <h3 className="text-[14px] font-bold text-[#111] shrink-0">Quick view &amp; mapping</h3>
            <p className="text-[12px] text-[#9CA3AF] max-w-[560px]">
              Pick what each column becomes right in its header. Leave a column on Not imported to skip it — map
              two columns to the name field and the CRM joins them.
            </p>
          </div>

          {/* File chip */}
          <div className="bg-[#FAFAFB] border border-black/8 rounded-xl p-3.5 flex items-center justify-between gap-3 flex-wrap mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <span className="size-10 rounded-lg bg-[#FDECEE] text-[#E8395B] font-bold text-[10.5px] grid place-items-center shrink-0">
                <FileSpreadsheet size={18} />
              </span>
              <div className="min-w-0">
                {fileName ? (
                  <>
                    <p className="text-[13px] font-semibold text-[#111] truncate">{fileName}</p>
                    <p className="text-[11.5px] text-[#9CA3AF]">
                      96 rows · 5 columns · first and last name in separate columns
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[13px] font-semibold text-[#111]">No file uploaded</p>
                    <p className="text-[11.5px] text-[#9CA3AF]">Upload a CSV or Excel file to map columns</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {fileName ? (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-9 px-4 rounded-xl bg-white border border-black/10 text-[12.5px] font-semibold text-[#4B5563] hover:bg-white/80 transition-colors"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteFile}
                    aria-label="Delete uploaded file"
                    className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-white border border-[#E8395B]/25 text-[12.5px] font-semibold text-[#E8395B] hover:bg-[#FDECEE] transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors"
                >
                  <Upload size={14} />
                  Upload
                </button>
              )}
            </div>
          </div>

          {fileName && (
            <div className="overflow-x-auto -mx-1">
            <table className="w-full border-collapse min-w-[720px]">
              <thead>
                <tr>
                  <th className="w-10 px-2 py-2 text-left text-[10px] font-semibold text-[#9CA3AF] uppercase">#</th>
                  {COLUMNS.map((col) => (
                    <th key={col.key} className="px-2 py-2 align-top min-w-[150px]">
                      <p
                        onClick={() => togglePreview(col.key)}
                        className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#9CA3AF] uppercase tracking-wide mb-1.5 cursor-pointer select-none hover:text-[#4B5563]"
                      >
                        <span className="text-[#7A0A17]">{col.letter}</span> {col.header}
                        {previewSort.key === col.key ? (previewSort.dir === "asc" ? " ▲" : " ▼") : ""}
                      </p>
                      <FieldSelect
                        value={mapping[col.key]}
                        onChange={(val) => setMapping((prev) => ({ ...prev, [col.key]: val }))}
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedPreview.map((row, i) => (
                  <tr key={`${row.first_name}-${row.last_name}-${i}`} className="border-t border-black/6">
                    <td className="px-2 py-2.5 text-[11.5px] text-[#9CA3AF]">{i + 1}</td>
                    {COLUMNS.map((col) => (
                      <td key={col.key} className="px-2 py-2.5 text-[12.5px] text-[#374151] whitespace-nowrap">
                        {row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {fileName && (
          <>
        {/* How row 1 will save */}
        <div className="bg-[#FAFAFB] border border-black/8 rounded-2xl p-4">
          <p className="text-[10.5px] font-bold text-[#7A0A17] uppercase tracking-wide mb-3">How row 1 will save</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div>
              <p className="text-[11px] text-[#9CA3AF]">First name</p>
              <p className="text-[13px] font-semibold text-[#111] mt-0.5">{firstRow.first_name}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#9CA3AF]">Last name</p>
              <p className="text-[13px] font-semibold text-[#111] mt-0.5">{firstRow.last_name}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#9CA3AF]">Mobile</p>
              <p className="text-[13px] font-semibold text-[#111] mt-0.5">98*****354</p>
            </div>
            <div>
              <p className="text-[11px] text-[#9CA3AF]">Alternate mobile</p>
              <p className="text-[13px] font-semibold text-[#111] mt-0.5">-</p>
            </div>
            <div>
              <p className="text-[11px] text-[#9CA3AF]">City / area</p>
              <p className="text-[13px] font-semibold text-[#111] mt-0.5">{firstRow.locality}</p>
            </div>
            <div>
              <p className="text-[11px] text-[#9CA3AF]">Save as</p>
              <p className="text-[13px] font-bold text-[#111] mt-0.5">
                {firstRow.first_name} {firstRow.last_name}
              </p>
            </div>
          </div>
        </div>

        {/* No lead source notice */}
        <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4">
          <p className="text-[13px] font-bold text-[#92400E] mb-3.5">
            No lead source column in this file. Set one value on all 96 rows — a list of just numbers needs only
            this.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-[720px]">
            <div>
              <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">
                Lead source for every row <span className="text-[#E8395B]">*</span>
              </label>
              <input
                type="text"
                value={leadSource}
                onChange={(e) => setLeadSource(e.target.value)}
                className="w-full h-10 px-3.5 text-[12.5px] text-[#111] bg-white border border-black/12 rounded-xl focus:outline-none focus:border-[#7A0A17]"
              />
            </div>
            <div>
              <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">Campaign / batch tag</label>
              <input
                type="text"
                value={campaignTag}
                onChange={(e) => setCampaignTag(e.target.value)}
                placeholder="Optional"
                className="w-full h-10 px-3.5 text-[12.5px] text-[#111] bg-white border border-black/12 rounded-xl placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#7A0A17]"
              />
            </div>
          </div>
        </div>

        {/* Ready banner */}
        <div className="bg-[#E7F8EF] border border-[#BBF7D0] rounded-2xl px-4 py-3.5 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-[13px] font-semibold text-[#16A34A]">
            96 rows ready · {mappedColumnCount} columns mapped · source applied to all rows
          </p>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => toast.info("Import cancelled.")}
              className="h-10 px-4 rounded-xl bg-white border border-black/10 text-[12.5px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleImport}
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[12.5px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Import 96 rows
            </button>
          </div>
        </div>
          </>
        )}

        {/* Import rules + Recent imports */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 items-start">
          <div className="bg-white border border-black/8 rounded-2xl p-5">
            <h3 className="text-[14px] font-bold text-[#111]">Import rules</h3>
            <p className="text-[12px] text-[#9CA3AF] mt-0.5 mb-4">Applied to every row of this file</p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">
                  Duplicate handling <span className="text-[#E8395B]">*</span>
                </label>
                <div className="h-10 px-3.5 rounded-xl bg-[#FAFAFB] border border-black/10 flex items-center text-[12.5px] font-medium text-[#111]">
                  Merge on mobile, keep earliest owner
                </div>
              </div>
              <div>
                <label className="block text-[11.5px] font-semibold text-[#374151] mb-1.5">Assignment</label>
                <div className="h-10 px-3.5 rounded-xl bg-[#FAFAFB] border border-black/10 flex items-center text-[12.5px] font-medium text-[#111]">
                  Auto-route after import
                </div>
                <p className="text-[11px] text-[#9CA3AF] mt-1.5">Respects the 24 hour window</p>
              </div>
            </div>
          </div>

          <TableCard
            title="Recent imports"
            subtitle="Last 7 days"
            badge={
              <button
                type="button"
                onClick={() => toast.info("Downloading error file...")}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#E8395B] hover:underline shrink-0"
              >
                <Download size={13} /> Download errors
              </button>
            }
            columns={[
              { label: "File / Integration", key: "source" },
              { label: "Rows", key: "rows" },
              { label: "Accepted", key: "accepted" },
              { label: "Rejected", key: "rejected" },
              { label: "Duplicate", key: "duplicate" },
              { label: "Status", key: "status" },
            ]}
            sort={importSort}
            onSort={toggleImports}
          >
            {sortedImports.map((row) => (
              <tr key={row.source} className="border-b border-black/5 last:border-0">
                <td className="px-3 py-2.5 text-[12.5px] font-semibold text-[#111] whitespace-nowrap">{row.source}</td>
                <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.rows}</td>
                <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.accepted}</td>
                <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.rejected}</td>
                <td className="px-3 py-2.5 text-[12px] text-[#4B5563] whitespace-nowrap">{row.duplicate}</td>
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <StatusPill tone={STATUS_TONES[row.status] || "gray"}>{row.status}</StatusPill>
                </td>
              </tr>
            ))}
          </TableCard>
        </div>
      </div>
    </div>
  );
}
