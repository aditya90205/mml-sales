import { useMemo, useState } from "react";
import Modal from "../components/ui/Modal";
import MediaDetailsModal from "../components/MediaDetailsModal";
import { toast } from "react-toastify";
import SearchField from "../components/common/SearchField.jsx";
import {
  Upload,
  LayoutGrid,
  List,
  ChevronDown,
  Image as ImageIcon,
  FileText,
  Folder,
  HardDrive,
  Images,
  Files,
  Calendar,
  Plus,
} from "lucide-react";

const initialFolders = [
  { id: "f1", name: "Company - Assets", count: 3 },
  { id: "f2", name: "Company - Docs", count: 3 },
  { id: "f3", name: "Company - Branding", count: 4 },
];

const initialFiles = [
  { id: 1, name: "Company Salary Slip", ext: "PNG", size: "150 KB", date: "2025-09-11", folder: "f1" },
  { id: 2, name: "Company Brand Kit", ext: "PNG", size: "500 KB", date: "2025-09-11", folder: "f3" },
  { id: 3, name: "Company Timesheet", ext: "PNG", size: "400 KB", date: "2025-09-11", folder: "f1" },
  { id: 4, name: "Company Templates", ext: "PDF", size: "750 KB", date: "2025-09-11", folder: "f2" },
  { id: 5, name: "Company Policy", ext: "PDF", size: "250 KB", date: "2025-09-11", folder: "f2" },
  { id: 6, name: "Company Logo", ext: "PNG", size: "60 KB", date: "2025-09-11", folder: "f3" },
  { id: 7, name: "Company Banner", ext: "PNG", size: "40 KB", date: "2025-09-11", folder: "f3" },
  { id: 8, name: "Company Chart", ext: "PNG", size: "300 KB", date: "2025-09-11", folder: "f1" },
  { id: 9, name: "Company Employee Handbook", ext: "PDF", size: "500 KB", date: "2025-09-11", folder: "f2" },
  { id: 10, name: "Company Letterhead", ext: "PNG", size: "25 KB", date: "2025-09-11", folder: "f3" },
];

const IMAGE_EXTS = ["PNG", "JPG", "JPEG"];

function sizeToKb(size) {
  const match = /([\d.]+)\s*(KB|MB)/i.exec(size);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  return match[2].toUpperCase() === "MB" ? value * 1024 : value;
}

function formatKb(kb) {
  return kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${Math.round(kb)} KB`;
}

function FileThumbnail({ ext }) {
  const isPdf = ext === "PDF";
  return (
    <div className="relative h-32 bg-[#f4f4f6] flex items-center justify-center">
      <span className="absolute top-2 left-2 text-[11px] font-bold text-[#9aa0ab] tracking-wide">{ext}</span>
      {isPdf ? (
        <div className="absolute top-2 right-2 size-7 rounded-md bg-[#7A0A17] text-white text-[9px] font-bold grid place-items-center">
          PDF
        </div>
      ) : (
        <div className="absolute top-2 right-2 size-2.5 rounded-full bg-[#7A0A17]" />
      )}
      {isPdf ? (
        <FileText size={40} className="text-[#c7becf]" />
      ) : (
        <ImageIcon size={40} className="text-[#c7becf]" />
      )}
    </div>
  );
}

function UploadMediaForm({ onClose, onUpload }) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col items-center justify-center gap-4 border-2 border-dashed border-black/15 rounded-2xl py-14 px-6 cursor-pointer hover:border-[#7A0A17] transition-colors">
        <div className="size-14 rounded-full bg-[#f1f1f4] grid place-items-center">
          <Upload size={22} className="text-[#6f7886]" />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-black">Upload your images</p>
          <p className="text-sm text-[#8a8a8a] mt-1">Drag and drop your images here, or click to browse</p>
        </div>
        <span className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#7A0A17] text-white text-sm font-semibold hover:bg-[#600712] transition-colors">
          <Plus size={18} /> Choose Files
        </span>
        <input
          type="file"
          multiple
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) onUpload(e.target.files);
            onClose();
          }}
        />
      </label>
    </div>
  );
}

export default function MediaLibraryPage({ embedded = false }) {
  const [folders, setFolders] = useState(initialFolders);
  const [files, setFiles] = useState(initialFiles);
  const [activeFolder, setActiveFolder] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortDesc, setSortDesc] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [viewingFile, setViewingFile] = useState(null);

  const visibleFiles = useMemo(() => {
    let list = activeFolder === "all" ? files : files.filter((f) => f.folder === activeFolder);
    if (search.trim()) {
      list = list.filter((f) =>
        `${f.name} ${f.ext ?? ""} ${f.size ?? ""} ${f.date ?? ""} ${f.folder ?? ""}`
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      );
    }
    list = [...list].sort((a, b) => (sortDesc ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));
    return list;
  }, [files, activeFolder, search, sortDesc]);

  const totalKb = useMemo(() => files.reduce((sum, f) => sum + sizeToKb(f.size), 0), [files]);
  const imageCount = useMemo(() => files.filter((f) => IMAGE_EXTS.includes(f.ext)).length, [files]);

  const folderCounts = useMemo(() => {
    const map = {};
    for (const f of files) {
      if (!f.folder) continue;
      map[f.folder] = (map[f.folder] || 0) + 1;
    }
    return map;
  }, [files]);

  const handleCreateFolder = () => {
    const name = newFolderName.trim();
    if (!name) {
      toast.error("Please enter a folder name.");
      return;
    }
    if (folders.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      toast.error("A folder with this name already exists.");
      return;
    }
    const id = `f${Date.now()}`;
    setFolders((prev) => [...prev, { id, name, count: 0 }]);
    setNewFolderName("");
    setCreatingFolder(false);
    setActiveFolder(id);
    toast.success(`Folder “${name}” created.`);
  };

  const handleUpload = (fileList) => {
    const uploaded = Array.from(fileList).map((file, i) => ({
      id: Date.now() + i,
      name: file.name.replace(/\.[^.]+$/, ""),
      ext: (file.name.split(".").pop() || "PNG").toUpperCase(),
      size:
        file.size >= 1024 * 1024
          ? `${(file.size / 1024 / 1024).toFixed(1)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`,
      date: new Date().toISOString().slice(0, 10),
      folder: activeFolder === "all" ? null : activeFolder,
    }));
    setFiles((prev) => [...uploaded, ...prev]);
    toast.success(`${uploaded.length} file${uploaded.length > 1 ? "s" : ""} uploaded.`);
  };

  const handleDeleteFile = (file) => {
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
  };

  return (
    <div className={`flex flex-col gap-5 min-h-full ${embedded ? "" : "p-5 md:p-6"}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {!embedded && (
          <h1 className="text-[22px] font-extrabold text-[#111827] tracking-tight">Media Library</h1>
        )}
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#7A0A17] hover:bg-[#600712] text-white text-[13px] font-bold shadow-sm transition-colors ml-auto"
        >
          <Upload size={15} />
          Upload Media
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left sidebar */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-6 bg-white border border-black/10 rounded-2xl p-4">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-semibold text-black">Quick Access</p>
            <button
              type="button"
              onClick={() => setActiveFolder("all")}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeFolder === "all" ? "bg-[#fbebec] text-[#7A0A17]" : "text-black hover:bg-black/5"
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Folder size={16} /> All Files
              </span>
              <span className="text-xs font-semibold text-[#8a8a8a]">{files.length}</span>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-black">Folders</p>
              <button
                type="button"
                onClick={() => setCreatingFolder((c) => !c)}
                className="text-[#6f7886] hover:text-[#7A0A17]"
                aria-label="Add folder"
              >
                <Plus size={18} />
              </button>
            </div>

            {creatingFolder && (
              <div className="flex flex-col gap-2">
                <input
                  autoFocus
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Folder name..."
                  className="h-10 px-3 rounded-lg border border-black/12 text-sm outline-none focus:border-[#7A0A17]"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCreateFolder}
                    className="flex-1 h-9 rounded-lg bg-[#7A0A17] text-white text-sm font-semibold hover:bg-[#600712]"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCreatingFolder(false);
                      setNewFolderName("");
                    }}
                    className="flex-1 h-9 rounded-lg border border-black/10 text-sm font-medium text-black hover:bg-black/5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {folders.map((folder) => {
              const count = folderCounts[folder.id] ?? folder.count ?? 0;
              return (
                <button
                  type="button"
                  key={folder.id}
                  onClick={() => setActiveFolder(folder.id)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeFolder === folder.id ? "bg-[#fbebec] text-[#7A0A17]" : "text-black hover:bg-black/5"
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Folder size={16} className="shrink-0" />
                    <span className="truncate">{folder.name}</span>
                  </span>
                  <span className="text-xs font-semibold text-[#8a8a8a] shrink-0 ml-2">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="border-t border-black/10 pt-4 flex flex-col gap-2 mt-auto">
            <p className="text-sm font-semibold text-black flex items-center gap-2">
              <HardDrive size={16} /> Storage
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6f7886]">Used</span>
              <span className="font-semibold text-black">{formatKb(totalKb)}</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="flex items-center gap-3 flex-wrap">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search media files..."
              className="flex-1 min-w-[220px] !h-11 !rounded-lg"
            />

            <div className="flex items-center rounded-lg border border-black/10 overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`size-11 grid place-items-center transition-colors ${
                  viewMode === "grid" ? "bg-[#7A0A17] text-white" : "text-[#6f7886] hover:bg-black/5"
                }`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`size-11 grid place-items-center transition-colors border-l border-black/10 ${
                  viewMode === "list" ? "bg-[#7A0A17] text-white" : "text-[#6f7886] hover:bg-black/5"
                }`}
              >
                <List size={18} />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSortDesc((d) => !d)}
              className="flex items-center gap-2 h-11 px-4 rounded-lg border border-black/10 text-sm font-medium text-black hover:bg-black/5 whitespace-nowrap bg-white"
            >
              Date{" "}
              <ChevronDown size={16} className={`transition-transform ${sortDesc ? "" : "rotate-180"}`} />
            </button>

            <span className="flex items-center gap-1.5 h-11 px-3 rounded-lg bg-[#fbebec] text-[#7A0A17] text-sm font-semibold whitespace-nowrap">
              <Files size={16} /> {visibleFiles.length} Files
            </span>
            <span className="flex items-center gap-1.5 h-11 px-3 rounded-lg bg-[#fbebec] text-[#7A0A17] text-sm font-semibold whitespace-nowrap">
              <HardDrive size={16} /> {formatKb(totalKb)}
            </span>
            <span className="flex items-center gap-1.5 h-11 px-3 rounded-lg bg-[#eef1ff] text-[#2b7fff] text-sm font-semibold whitespace-nowrap">
              <Images size={16} /> {imageCount} Images
            </span>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
              {visibleFiles.map((file) => (
                <div
                  key={file.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setViewingFile(file)}
                  onKeyDown={(e) => e.key === "Enter" && setViewingFile(file)}
                  className="border border-black/10 rounded-xl overflow-hidden bg-white cursor-pointer hover:shadow-md hover:border-black/20 transition-shadow"
                >
                  <FileThumbnail ext={file.ext} />
                  <div className="p-3 flex flex-col gap-1.5">
                    <p className="text-sm font-semibold text-black truncate">{file.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-[#8a8a8a]">
                      <HardDrive size={12} /> {file.size}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#8a8a8a]">
                      <Calendar size={12} /> {file.date}
                    </div>
                  </div>
                </div>
              ))}
              {visibleFiles.length === 0 && (
                <p className="col-span-full text-center text-sm text-[#8a8a8a] py-12">No files found.</p>
              )}
            </div>
          ) : (
            <div className="border border-black/10 rounded-xl overflow-hidden bg-white">
              <div className="grid grid-cols-[1fr_120px_140px] bg-[#f9f8f6] border-b border-black/10 px-4 py-3 text-xs font-semibold text-[#8a8a8a]">
                <span>Name</span>
                <span>Size</span>
                <span>Date</span>
              </div>
              {visibleFiles.map((file) => (
                <div
                  key={file.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setViewingFile(file)}
                  onKeyDown={(e) => e.key === "Enter" && setViewingFile(file)}
                  className="grid grid-cols-[1fr_120px_140px] items-center px-4 py-3 border-b border-black/5 last:border-b-0 cursor-pointer hover:bg-black/[0.03] transition-colors"
                >
                  <span className="flex items-center gap-2.5 text-sm font-medium text-black truncate">
                    {file.ext === "PDF" ? (
                      <FileText size={16} className="text-[#7A0A17] shrink-0" />
                    ) : (
                      <ImageIcon size={16} className="text-[#7A0A17] shrink-0" />
                    )}
                    {file.name}
                  </span>
                  <span className="text-sm text-[#6f7886]">{file.size}</span>
                  <span className="text-sm text-[#6f7886]">{file.date}</span>
                </div>
              ))}
              {visibleFiles.length === 0 && (
                <p className="text-center text-sm text-[#8a8a8a] py-12">No files found.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        title="Upload Media Files"
        icon={<Upload size={18} />}
        iconBg="#eafdec"
        iconColor="#12a44a"
        width="max-w-[560px]"
      >
        <UploadMediaForm onClose={() => setShowUpload(false)} onUpload={handleUpload} />
      </Modal>

      <MediaDetailsModal
        file={viewingFile}
        onClose={() => setViewingFile(null)}
        onDelete={handleDeleteFile}
      />
    </div>
  );
}
