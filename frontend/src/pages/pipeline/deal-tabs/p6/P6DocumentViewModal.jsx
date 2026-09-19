import { useEffect, useState } from "react";
import { Eye, FileText, MapPin } from "lucide-react";
import Modal from "../../../../components/ui/Modal";
import StatusPill from "../../../../components/common/StatusPill";
import { comparisonSummary, formatGpsCoords, isCameraGpsItem } from "./p6ChecklistData.js";

const STATUS_TONE = {
  match: "green",
  partial: "amber",
  mismatch: "red",
  "document-only": "blue",
  missing: "gray",
};

const STATUS_LABEL = {
  match: "Match",
  partial: "Partial match",
  mismatch: "Mismatch",
  "document-only": "On document only",
  missing: "Missing",
};

function filePreviewUrl(file) {
  if (!file?.raw || !file.raw.type?.startsWith("image/")) return null;
  return URL.createObjectURL(file.raw);
}

function DocumentTile({ file, fallback }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const url = filePreviewUrl(file);
    setPreview(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  const label = file?.side ? file.side[0].toUpperCase() + file.side.slice(1) : fallback;

  return (
    <div className="rounded-xl border border-black/10 bg-[#FAFAFB] p-3 min-h-[140px] flex flex-col">
      <p className="text-[11.5px] font-bold text-[#111]">{label}</p>
      {preview ? (
        <img src={preview} alt={label} className="mt-2 h-28 w-full object-cover rounded-lg border border-black/8 bg-white" />
      ) : (
        <div className="mt-2 flex-1 rounded-lg border border-black/8 bg-white grid place-items-center px-3 py-6 text-center">
          <FileText size={18} className="text-[#7A0A17] mx-auto" />
          <p className="text-[12px] font-medium text-[#374151] mt-1.5 break-all">{file?.name || "Document"}</p>
        </div>
      )}
    </div>
  );
}

function CompareRow({ row, extractedLabel = "From document" }) {
  return (
    <div className="rounded-xl border border-black/8 overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-[#FAFAFB] border-b border-black/6">
        <p className="text-[12.5px] font-semibold text-[#111]">{row.label}</p>
        <StatusPill tone={STATUS_TONE[row.status] || "gray"}>{STATUS_LABEL[row.status] || row.status}</StatusPill>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <div className="px-3.5 py-2.5 sm:border-r border-black/6">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{extractedLabel}</p>
          <p className="text-[13px] text-[#111] mt-0.5 leading-snug">{row.extracted || "—"}</p>
        </div>
        <div className="px-3.5 py-2.5 border-t sm:border-t-0 border-black/6">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[#9CA3AF]">On profile</p>
          <p className="text-[13px] text-[#111] mt-0.5 leading-snug">{row.profile || "—"}</p>
        </div>
      </div>
    </div>
  );
}

export default function P6DocumentViewModal({ open, item, onClose, onVerify }) {
  if (!open || !item) return null;

  const isIdCard = item.upload === "id-card" || item.idType === "aadhaar" || item.idType === "pan";
  const isCameraGps = isCameraGpsItem(item);
  const files = item.files || [];
  const comparison = item.comparison || [];
  const summary = comparisonSummary(comparison);
  const subtitle = isIdCard
    ? "Extracted from the card, then compared with the existing profile."
    : isCameraGps
      ? "Photo clicked on camera. GPS address is compared with the profile address."
      : "Uploaded file.";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`View ${item.title}`}
      subtitle={subtitle}
      icon={isCameraGps ? <MapPin size={18} /> : <Eye size={18} />}
      iconBg="#F3E8F0"
      iconColor="#7A0A17"
      width="max-w-2xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors"
          >
            Close
          </button>
          {!item.done && onVerify ? (
            <button
              type="button"
              onClick={onVerify}
              className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
            >
              Verify
            </button>
          ) : null}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {isIdCard ? (
          <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-2.5">
            <p className="text-[12.5px] font-semibold text-[#92400E]">Placeholder demo</p>
            <p className="text-[12px] text-[#B45309] mt-0.5 leading-snug">
              Production will OCR the card and match name, date of birth and address with the intake profile. This screen is how the RM will review it.
            </p>
          </div>
        ) : null}

        {isCameraGps ? (
          <div className="rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-2.5">
            <p className="text-[12.5px] font-semibold text-[#92400E]">Check the visit address</p>
            <p className="text-[12px] text-[#B45309] mt-0.5 leading-snug">
              Compare the GPS address from where the photo was clicked with the profile address, then Verify if it matches.
            </p>
          </div>
        ) : null}

        <section>
          <p className="text-[12px] font-bold text-[#111] mb-2">{isCameraGps ? "Captured photo" : "Uploaded document"}</p>
          {files.length ? (
            <div className={`grid grid-cols-1 ${isCameraGps ? "" : "sm:grid-cols-2"} gap-3`}>
              {files.map((file, index) => (
                <DocumentTile key={`${file.name}-${index}`} file={file} fallback={isCameraGps ? "Photo" : index === 0 ? "Front" : "Back"} />
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#6B7280]">No file attached.</p>
          )}
        </section>

        {isCameraGps && item.gps ? (
          <section className="rounded-xl border border-black/8 bg-[#FAFAFB] px-3.5 py-3">
            <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[#9CA3AF] inline-flex items-center gap-1">
              <MapPin size={12} /> Clicked at
            </p>
            <p className="text-[13.5px] font-semibold text-[#111] mt-1 leading-snug">{item.gps.address || "—"}</p>
            <p className="text-[11.5px] text-[#6B7280] mt-1">
              {[formatGpsCoords(item.gps), item.gps.capturedAt].filter(Boolean).join(" · ")}
            </p>
          </section>
        ) : null}

        {(isIdCard || isCameraGps) && comparison.length ? (
          <section>
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-[12px] font-bold text-[#111]">Compared with existing profile</p>
            </div>
            {summary ? <p className="text-[12px] text-[#6B7280] mb-2.5">{summary}</p> : null}
            <div className="flex flex-col gap-2.5">
              {comparison.map((row) => (
                <CompareRow key={row.key} row={row} extractedLabel={isCameraGps ? "Clicked at" : "From document"} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </Modal>
  );
}
