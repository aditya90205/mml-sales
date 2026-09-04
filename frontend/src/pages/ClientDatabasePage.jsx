import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Filter, Flag, Mail, MessageSquare, Phone, Plus, Search, X } from "lucide-react";
import { toast } from "react-toastify";
import { CLIENTS } from "../utils/clientsData.js";
import { readSavedGroups, removeSavedGroup } from "../utils/clientGroups.js";

const STATUS_STYLES = {
  Active: "bg-[#DCFCE7] text-[#15803D] border-[#16A34A]/25",
  Inactive: "bg-[#FEE2E2] text-[#DC2626] border-[#DC2626]/20",
};

function StatusCell({ status, married }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap border ${STATUS_STYLES[status] || "bg-[#F1F2F4] text-[#6B7280] border-black/10"}`}>
        {status}
      </span>
      {married && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F1F2F4] text-[#6B7280] border border-black/10">
          Married
        </span>
      )}
    </div>
  );
}

function IconBtn({ label, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="size-7 grid place-items-center rounded-lg hover:bg-black/4 transition-colors"
    >
      {children}
    </button>
  );
}

export default function ClientDatabasePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [savedGroups, setSavedGroups] = useState([]);

  useEffect(() => {
    setSavedGroups(readSavedGroups());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CLIENTS;
    return CLIENTS.filter((c) =>
      [c.name, c.clientId, c.phone, c.status, c.branch, c.reason].some((v) => String(v).toLowerCase().includes(q))
    );
  }, [query]);

  const applySearch = () => setQuery(search);

  const handleRemoveGroup = (id, name) => {
    setSavedGroups(removeSavedGroup(id));
    toast.error(`${name} group removed.`);
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="px-5 pt-5 pb-8 flex flex-col gap-5 min-w-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h1 className="text-[26px] font-bold text-[#111] tracking-tight">Client Database</h1>
          <button
            type="button"
            onClick={() => toast.info("Exporting clients...")}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-semibold text-[#4B5563] hover:bg-[#FAFAFB] transition-colors"
          >
            <Plus size={14} /> Export
          </button>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 h-10 px-3.5 rounded-xl bg-white border border-black/10 flex-1 basis-[240px] max-w-[420px] focus-within:border-[#7A0A17]/40 transition-colors">
            <Search size={15} className="text-[#9CA3AF] shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              placeholder="Search..."
              className="bg-transparent text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none w-full min-w-0"
            />
          </div>

          <button
            type="button"
            onClick={applySearch}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors shrink-0"
          >
            <Search size={14} /> Search
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors shrink-0"
          >
            <Filter size={14} /> Filter
          </button>

          {["All", "No grouping", "All branches"].map((label) => (
            <button
              key={label}
              type="button"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-white border border-black/10 text-[13px] font-medium text-[#4B5563] hover:bg-[#FAFAFB] transition-colors shrink-0"
            >
              {label}
              <ChevronDown size={14} className="text-[#9CA3AF]" />
            </button>
          ))}

          <button
            type="button"
            onClick={() => navigate("/clients/create-group")}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors shrink-0 ml-auto"
          >
            Create Client Groups
          </button>
        </div>

        <div className="bg-white border border-black/10 rounded-2xl px-5 py-4 flex items-center gap-3 flex-wrap">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#9CA3AF] shrink-0">Saved Groups:</p>
          {savedGroups.length === 0 ? (
            <p className="text-[13px] text-[#9CA3AF]">No saved groups yet — create one above.</p>
          ) : (
            savedGroups.map((g) => (
              <span
                key={g.id}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FCF5F6] border border-[#7A0A17]/20 text-[#7A0A17] text-[13px] font-semibold"
              >
                {g.name}
                <button
                  type="button"
                  onClick={() => handleRemoveGroup(g.id, g.name)}
                  aria-label={`Remove ${g.name}`}
                  className="hover:opacity-70"
                >
                  <X size={13} />
                </button>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-6 flex-wrap text-[13px] font-medium text-[#374151]">
          <span className="flex items-center gap-1.5">
            <Flag size={14} className="text-[#DC2626] fill-[#DC2626]" /> Low Probability
          </span>
          <span className="flex items-center gap-1.5">
            <Flag size={14} className="text-[#D97706] fill-[#D97706]" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <Flag size={14} className="text-[#16A34A] fill-[#16A34A]" /> High
          </span>
        </div>

        <div className="overflow-x-auto border border-black/8 rounded-xl bg-white">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-black/8 bg-[#FAFAFB] text-[#9CA3AF] uppercase text-[10px] font-extrabold tracking-wide">
                <th className="px-4 py-3 whitespace-nowrap">Client Name</th>
                <th className="px-4 py-3 whitespace-nowrap">Client ID</th>
                <th className="px-4 py-3 whitespace-nowrap">Phone</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Address</th>
                <th className="px-4 py-3 whitespace-nowrap">Owner</th>
                <th className="px-4 py-3 whitespace-nowrap">Branch</th>
                <th className="px-4 py-3 whitespace-nowrap">Last Contact</th>
                <th className="px-4 py-3 whitespace-nowrap">Reason</th>
                <th className="px-4 py-3 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/6">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-[13px] text-[#9CA3AF] font-medium">
                    No clients found.
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAFAFB] transition-colors align-top">
                    <td className="px-4 py-3.5 text-[13px] font-bold text-[#111] whitespace-nowrap">{c.name}</td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] whitespace-nowrap">{c.clientId}</td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] whitespace-nowrap">{c.phone}</td>
                    <td className="px-4 py-3.5"><StatusCell status={c.status} married={c.married} /></td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] max-w-[200px]">{c.address}</td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] whitespace-nowrap">{c.owner}</td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] whitespace-nowrap">{c.branch}</td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] whitespace-nowrap">{c.lastContact}</td>
                    <td className="px-4 py-3.5 text-[13px] font-medium text-[#374151] max-w-[180px]">{c.reason}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-0.5">
                        <IconBtn label={`Call ${c.name}`} onClick={() => toast.info(`Calling ${c.name}...`)}>
                          <Phone size={14} className="text-[#16A34A]" />
                        </IconBtn>
                        <IconBtn label={`Message ${c.name}`} onClick={() => toast.info(`Messaging ${c.name}...`)}>
                          <MessageSquare size={14} className="text-[#D97706]" />
                        </IconBtn>
                        <IconBtn label={`Email ${c.name}`} onClick={() => toast.info(`Emailing ${c.name}...`)}>
                          <Mail size={14} className="text-[#2563EB]" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
