import Modal from "./ui/Modal";
import { toast } from "react-toastify";
import { Eye, Download, Trash2, Copy, Image as ImageIcon, FileText } from "lucide-react";

function slugify(name, ext) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${base}.${(ext || "png").toLowerCase()}`;
}

function mimeType(ext) {
  return ext === "PDF" ? "application/pdf" : `image/${(ext || "png").toLowerCase()}`;
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm text-[#8a8a8a]">{label}</p>
      {children}
    </div>
  );
}

export default function MediaDetailsModal({ file, onClose, onDelete }) {
  if (!file) return null;

  const fileName = slugify(file.name, file.ext);
  const fileUrl = `https://demo.workdo.io/hrm-saas/storage/media/${fileName}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(fileUrl);
    toast.success("File URL copied to clipboard.");
  };

  const handleView = () => toast.success("Opening file preview...");
  const handleDownload = () => toast.success("Downloading file...");
  const handleDelete = () => {
    onDelete?.(file);
    onClose?.();
    toast.success("File deleted.");
  };

  return (
    <Modal
      open={!!file}
      onClose={onClose}
      title="Media Details"
      icon={<ImageIcon size={18} />}
      iconBg="#eafdec"
      iconColor="#12a44a"
      width="max-w-[1240px]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
        <div className="min-h-[420px] rounded-2xl bg-[#f4f4f6] flex items-center justify-center">
          {file.ext === "PDF" ? (
            <FileText size={72} className="text-[#c7becf]" />
          ) : (
            <ImageIcon size={72} className="text-[#c7becf]" />
          )}
        </div>

        <div className="flex flex-col gap-6">
          <Field label="File Name">
            <p className="text-base font-semibold text-black break-all">{fileName}</p>
          </Field>

          <Field label="Display Name">
            <p className="text-base font-semibold text-black">{file.name}</p>
          </Field>

          <Field label="File Type">
            <span className="inline-flex w-fit px-3 py-1 rounded-full border border-black/10 bg-[#f4f4f6] text-sm font-medium text-black">
              {mimeType(file.ext)}
            </span>
          </Field>

          <Field label="File Size">
            <p className="text-base font-semibold text-black">{file.size}</p>
          </Field>

          <Field label="Upload Date">
            <p className="text-base font-semibold text-black">{file.date}</p>
          </Field>

          <Field label="File URL">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-[#f4f4f6] p-3">
              <p className="text-sm text-[#6f7886] break-all">{fileUrl}</p>
              <button
                type="button"
                onClick={handleCopy}
                className="shrink-0 text-[#6f7886] hover:text-black"
                title="Copy URL"
              >
                <Copy size={16} />
              </button>
            </div>
          </Field>

          <div className="flex flex-col gap-3 pt-2">
            <p className="text-lg font-semibold text-black">Actions</p>
            <button
              type="button"
              onClick={handleView}
              className="flex items-center justify-center gap-2 h-12 rounded-lg border border-black/10 text-sm font-semibold text-black hover:bg-black/5 transition-colors"
            >
              <Eye size={18} /> View
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 h-12 rounded-lg border border-black/10 text-sm font-semibold text-black hover:bg-black/5 transition-colors"
            >
              <Download size={18} /> Download
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center justify-center gap-2 h-12 rounded-lg bg-[#df264f] text-sm font-semibold text-white hover:bg-[#c11f43] transition-colors"
            >
              <Trash2 size={18} /> Delete File
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
