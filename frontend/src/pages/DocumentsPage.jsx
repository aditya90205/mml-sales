import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Download, Eye, Filter, MoreVertical, Search } from "lucide-react";
import { toast } from "react-toastify";
import MediaLibraryPage from "./MediaLibraryPage";

const TABS = ["Documents", "Media"];

const DOC_BORDER_COLORS = ["#F59E0B", "#3B82F6", "#16A34A", "#EAB308"];

const INITIAL_DOCUMENTS = [
  { id: 1, title: "Employee Contract", category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 2, title: "Offer Letter", category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 3, title: "Salary Certificate", category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 4, title: "Experience Certificate", category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 5, title: "Data Privacy and Security Policy", category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 6, title: "Emergency Contact Form", category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 7, title: "Expense Reimbursement Policy", category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 8, title: "Remote Work Policy", category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
  { id: 9, title: "Code of Conduct Policy", category: "Personal Documents", version: "v1.1", updated: "2024-01-01", downloads: 30 },
];

const PAGE_SIZE = 8;

function Pagination({ page, totalPages, totalItems, pageSize, onChange }) {
  if (totalItems === 0) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  return (
    <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280]">
      <p>
        Showing {start} to {end} of {totalItems} documents
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-[#FAFAFB] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`size-7 rounded-lg font-bold ${
              n === page ? "bg-[#16A34A] text-white" : "border border-black/10 bg-white hover:bg-[#FAFAFB] text-[#374151]"
            }`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="px-3 py-1.5 rounded-lg border border-black/10 bg-white hover:bg-[#FAFAFB] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function DocumentsTab() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = INITIAL_DOCUMENTS.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search..."
            className="w-full bg-white border border-black/12 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-[#7A0A17]"
          />
        </div>
        <button
          type="button"
          className="bg-[#7A0A17] hover:bg-[#600712] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-2xs flex items-center gap-1"
        >
          <Search size={14} /> Search
        </button>
        <button
          type="button"
          className="bg-white border border-black/12 hover:bg-[#FAFAFB] text-[#374151] text-xs font-bold px-3.5 py-2 rounded-xl shadow-2xs flex items-center gap-1.5"
        >
          <Filter size={14} /> Filter
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {paged.map((doc, idx) => (
          <div
            key={doc.id}
            className="bg-white border border-black/10 rounded-2xl p-4 shadow-sm border-t-4"
            style={{ borderTopColor: DOC_BORDER_COLORS[idx % DOC_BORDER_COLORS.length] }}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-sm font-extrabold text-[#111827] leading-snug">{doc.title}</h3>
              <button
                type="button"
                onClick={() => toast.info(`Viewing ${doc.title}`)}
                className="text-[#9CA3AF] hover:text-[#111] shrink-0"
              >
                <Eye size={15} />
              </button>
            </div>
            <p className="text-[11px] text-[#9CA3AF] mb-2.5">Last Update: {doc.updated}</p>

            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFEDD5] text-[#C2410C] border border-[#EA580C]/20">
                {doc.category}
              </span>
              <span className="text-[10px] font-bold text-[#9CA3AF]">{doc.version}</span>
            </div>
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#DBEAFE] text-[#2563EB] border border-[#2563EB]/20 mb-3">
              Published
            </span>

            <div className="flex items-center justify-between pt-3 border-t border-black/6">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face"
                  alt=""
                  className="size-6 rounded-full object-cover shrink-0"
                />
                <span className="text-[11px] font-bold text-[#374151] truncate">Company</span>
                <span className="inline-flex items-center gap-1 shrink-0">
                  <Download size={13} className="text-[#9CA3AF]" />
                  <span className="text-[11px] font-bold text-[#6B7280]">{doc.downloads}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => toast.success(`Downloading ${doc.title}`)}
                  className="text-[#16A34A] hover:opacity-70"
                  aria-label="Download"
                >
                  <Download size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => toast.info(`More options for ${doc.title}`)}
                  className="text-[#9CA3AF] hover:text-[#111]"
                >
                  <MoreVertical size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onChange={setPage}
      />
    </div>
  );
}

export default function DocumentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(() =>
    tabParam === "media" ? "Media" : "Documents"
  );

  useEffect(() => {
    setActiveTab(tabParam === "media" ? "Media" : "Documents");
  }, [tabParam]);

  const selectTab = (tab) => {
    setActiveTab(tab);
    if (tab === "Media") {
      setSearchParams({ tab: "media" }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5 md:p-6 min-h-full">
      <div>
        <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">
          Documents & Media
        </h1>
        <p className="text-[13px] text-[#6B7280] mt-0.5">
          Manage company documents and media library
        </p>
      </div>

      <div className="border-b border-black/8">
        <nav className="flex items-center gap-6 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => selectTab(tab)}
                className={`pb-3 text-sm font-bold transition-all relative whitespace-nowrap ${
                  isActive
                    ? "text-[#7A0A17]"
                    : "text-[#6B7280] hover:text-[#111827]"
                }`}
              >
                {tab}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#7A0A17] rounded-t-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {activeTab === "Documents" && <DocumentsTab />}
      {activeTab === "Media" && <MediaLibraryPage embedded />}
    </div>
  );
}
