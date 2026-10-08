import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import {
  Check,
  CloudUpload,
  FileText,
  Folder,
  Image as ImageIcon,
  User,
  X,
} from "lucide-react";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ["image/png", "image/jpeg", "image/jpg"];

const DOS = [
  "Use a clear, high-quality photo",
  "Keep your face clearly visible",
  "Use a simple, clean background",
  "Use a recent professional photo",
];

const DONTS = [
  "Don't upload blurry or pixelated photos",
  "Don't use group photos",
  "Don't use screenshots or heavily edited images",
  "Don't upload inappropriate or unrelated images",
];

function isAllowedFile(file) {
  const name = (file?.name || "").toLowerCase();
  const typeOk = ACCEPT.includes(file?.type) || /\.(png|jpe?g)$/.test(name);
  return Boolean(file) && typeOk;
}

function fileToAvatarDataUrl(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const max = 360;
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.86));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that image."));
    };
    img.src = url;
  });
}

export default function ChangeProfilePhotoModal({ open, onClose, onSave }) {
  const inputRef = useRef(null);
  const previewRef = useRef("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => () => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = "";
    }
  }, []);

  useEffect(() => {
    if (open) return;
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
      previewRef.current = "";
    }
    setFile(null);
    setPreview("");
    setDragging(false);
    setSaving(false);
  }, [open]);

  if (!open) return null;

  const pickFile = (next) => {
    if (!next) return;
    if (!isAllowedFile(next)) {
      toast.error("Use a PNG, JPG, or JPEG photo.");
      return;
    }
    if (next.size > MAX_BYTES) {
      toast.error("Photo must be 5 MB or smaller.");
      return;
    }
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const url = URL.createObjectURL(next);
    previewRef.current = url;
    setFile(next);
    setPreview(url);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const upload = async () => {
    if (!file) {
      toast.info("Choose a photo first.");
      return;
    }
    setSaving(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      onSave?.(dataUrl);
      toast.success("Profile photo updated.");
      onClose?.();
    } catch (err) {
      toast.error(err?.message || "Could not upload that photo.");
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="change-profile-photo-title">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 flex w-full max-w-[720px] max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-black/8 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="size-10 rounded-full grid place-items-center text-white bg-[#7A0A17] shrink-0">
              <User size={18} strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <h2 id="change-profile-photo-title" className="text-[16px] font-semibold text-[#7A0A17] leading-tight">
                Change Profile Photo
              </h2>
              <p className="text-[12.5px] text-[#6B7280] mt-0.5">
                Upload a clear profile photo for this client.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#6f7886] hover:bg-black/5 transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 min-h-0">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`rounded-2xl border border-dashed px-5 py-5 text-center transition-colors ${
              dragging ? "border-[#7A0A17] bg-[#F9ECEE]" : "border-[#7A0A17]/25 bg-[#FCF5F6]"
            }`}
          >
            {preview ? (
              <img src={preview} alt="Selected profile" className="size-16 mx-auto rounded-full object-cover ring-4 ring-white shadow-sm" />
            ) : (
              <CloudUpload size={34} className="mx-auto text-[#7A0A17]" strokeWidth={1.6} />
            )}
            <p className="mt-2.5 text-[15px] font-semibold text-[#7A0A17] truncate">
              {preview ? file?.name : "Upload Your Photo"}
            </p>
            <p className="mt-1 text-[13px] text-[#6B7280]">Drag and drop your image here or</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-3 inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              <Folder size={15} />
              Browse Files
            </button>
            <p className="mt-2.5 text-[12px] text-[#9CA3AF]">PNG, JPG or JPEG · Max 5 MB</p>
            <input
              ref={inputRef}
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              className="hidden"
              onChange={(e) => {
                pickFile(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          <div className="flex items-center gap-2 mt-4 mb-2.5">
            <FileText size={15} className="text-[#7A0A17]" />
            <p className="text-[14px] font-semibold text-[#7A0A17]">Photo Guidelines</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-[#F3FBF6] border border-[#D7F3E3] px-3.5 py-3">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-[#16A34A]">
                <span className="size-5 rounded-full bg-[#16A34A] text-white grid place-items-center">
                  <Check size={12} strokeWidth={3} />
                </span>
                Do&apos;s
              </p>
              <ul className="mt-2 space-y-1.5">
                {DOS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[12.5px] text-[#374151] leading-snug">
                    <Check size={13} className="text-[#16A34A] mt-0.5 shrink-0" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-[#FCF5F6] border border-[#7A0A17]/15 px-3.5 py-3">
              <p className="flex items-center gap-2 text-[13px] font-semibold text-[#7A0A17]">
                <span className="size-5 rounded-full bg-[#7A0A17] text-white grid place-items-center">
                  <X size={12} strokeWidth={3} />
                </span>
                Don&apos;ts
              </p>
              <ul className="mt-2 space-y-1.5">
                {DONTS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[12.5px] text-[#374151] leading-snug">
                    <X size={13} className="text-[#7A0A17] mt-0.5 shrink-0" strokeWidth={2.5} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-t border-black/8 shrink-0 bg-white">
          <div className="flex items-center gap-3.5 text-[12px] text-[#6B7280]">
            <span className="inline-flex items-center gap-2">
              <ImageIcon size={15} className="text-[#7A0A17]" />
              <span>
                Supported formats:
                <span className="block text-[#111] font-medium leading-tight">PNG, JPG, JPEG</span>
              </span>
            </span>
            <span className="w-px h-8 bg-black/10" />
            <span className="inline-flex items-center gap-2">
              <FileText size={15} className="text-[#7A0A17]" />
              <span>
                Maximum file size:
                <span className="block text-[#111] font-semibold leading-tight">5 MB</span>
              </span>
            </span>
          </div>
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 rounded-xl border border-[#7A0A17] bg-white text-[13px] font-semibold text-[#7A0A17] hover:bg-[#FCF5F6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={upload}
              disabled={saving}
              className="h-10 px-5 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] disabled:opacity-60 transition-colors"
            >
              {saving ? "Uploading..." : "Upload Photo"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
