import { useEffect, useRef, useState } from "react";
import { Camera, FileUp, Loader2, MapPin, ShieldCheck, X } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../../../../components/ui/Modal";

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.doc,.docx";

function filePreviewUrl(file) {
  if (!file?.raw || !file.raw.type?.startsWith("image/")) return null;
  return URL.createObjectURL(file.raw);
}

function toStoredFile(file) {
  return { name: file.name, size: file.size, type: file.type, raw: file };
}

function toStoredFileFromBlob(blob, name) {
  const file = new File([blob], name, { type: blob.type || "image/jpeg" });
  return { name: file.name, size: file.size, type: file.type, raw: file };
}

function sideFileName(prefix, side, file) {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  return `${prefix}-${side.toLowerCase()}.${ext}`;
}

function stopStream(stream) {
  stream?.getTracks().forEach((track) => track.stop());
}

function formatCapturedAt(date) {
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function readGps() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not available on this device."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    });
  });
}

async function reverseGeocode(lat, lng) {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(lat)}&longitude=${encodeURIComponent(lng)}&localityLanguage=en`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not resolve address.");
  const data = await res.json();
  const parts = [data.locality, data.city, data.principalSubdivision, data.postcode, data.countryName]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .filter((part, index, list) => list.findIndex((item) => item.toLowerCase() === part.toLowerCase()) === index);
  return parts.join(", ") || `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
}

function SideSlot({ label, file, onPick, onClear }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const url = filePreviewUrl(file);
    setPreview(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div className="rounded-xl border border-dashed border-black/15 bg-[#FAFAFB] p-3.5 min-h-[140px] flex flex-col">
      <p className="text-[12px] font-bold text-[#111]">{label}</p>
      {file ? (
        <div className="mt-2.5 flex-1 flex flex-col gap-2 min-w-0">
          {preview ? (
            <img src={preview} alt={label} className="h-20 w-full object-cover rounded-lg border border-black/8 bg-white" />
          ) : (
            <div className="h-20 rounded-lg border border-black/8 bg-white grid place-items-center text-[11px] font-medium text-[#6B7280]">
              {file.name}
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11.5px] text-[#16A34A] truncate min-w-0">{file.name}</p>
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center justify-center size-7 rounded-lg text-[#6B7280] hover:bg-white hover:text-[#111] shrink-0"
              aria-label={`Remove ${label}`}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 flex-1 rounded-lg border border-black/10 bg-white px-3 py-4 text-center hover:bg-[#F8F9FA] transition-colors"
        >
          <FileUp size={16} className="mx-auto text-[#7A0A17]" />
          <p className="text-[12px] font-semibold text-[#111] mt-1.5">Upload {label.toLowerCase()}</p>
          <p className="text-[11px] text-[#9CA3AF] mt-0.5">PDF, JPG or PNG</p>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const next = e.target.files?.[0];
          e.target.value = "";
          if (next) onPick(toStoredFile(next));
        }}
      />
    </div>
  );
}

function FileListSlot({ files, onAdd, onRemove }) {
  const inputRef = useRef(null);

  return (
    <div className="flex flex-col gap-2.5">
      {files.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between gap-2 rounded-xl border border-black/8 bg-[#FAFAFB] px-3 py-2"
            >
              <p className="text-[12.5px] font-medium text-[#16A34A] truncate min-w-0">{file.name}</p>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="inline-flex items-center justify-center size-7 rounded-lg text-[#6B7280] hover:bg-white hover:text-[#111] shrink-0"
                aria-label={`Remove ${file.name}`}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="h-10 px-4 rounded-xl border border-black/12 bg-white text-[13px] font-semibold text-[#111] hover:bg-[#FAFAFB] transition-colors self-start"
      >
        Attach &amp; Upload
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const next = e.target.files?.[0];
          e.target.value = "";
          if (next) onAdd(toStoredFile(next));
        }}
      />
    </div>
  );
}

function CameraGpsSlot({ item, photo, gps, locating, onCaptured, onClear }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraError, setCameraError] = useState("");
  const [starting, setStarting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [retryKey, setRetryKey] = useState(0);
  const facing = item?.cameraFacing || (item?.id === "house-gps" ? "environment" : "user");

  useEffect(() => {
    const url = filePreviewUrl(photo);
    setPreview(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [photo]);

  useEffect(() => {
    if (photo) return undefined;
    let cancelled = false;
    setCameraError("");
    setStarting(true);
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stopStream(stream);
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch {
        if (!cancelled) setCameraError("Camera access is needed. Allow the camera and try again.");
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();
    return () => {
      cancelled = true;
      stopStream(streamRef.current);
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [photo, facing, item?.id, retryKey]);

  const handleClickPhoto = async () => {
    const video = videoRef.current;
    if (!video?.videoWidth) {
      toast.info("Camera is still starting.");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) {
      toast.error("Could not capture the photo.");
      return;
    }
    const stored = toStoredFileFromBlob(blob, `${item.id || "selfie"}.jpg`);
    onCaptured({ photo: stored, gps: null, locating: true });
    try {
      const pos = await readGps();
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      let address = "";
      try {
        address = await reverseGeocode(lat, lng);
      } catch {
        address = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }
      onCaptured({
        photo: stored,
        locating: false,
        gps: {
          lat,
          lng,
          accuracy: pos.coords.accuracy,
          address,
          capturedAt: formatCapturedAt(new Date()),
        },
      });
    } catch {
      onCaptured({
        photo: stored,
        locating: false,
        gps: null,
        locationError: "Location could not be read. Allow location and retake the photo.",
      });
    }
  };

  if (photo) {
    return (
      <div className="flex flex-col gap-3">
        {preview ? (
          <img src={preview} alt="Captured" className="w-full h-56 object-cover rounded-xl border border-black/8 bg-black" />
        ) : null}
        <div className="rounded-xl border border-black/8 bg-[#FAFAFB] px-3.5 py-3">
          <p className="text-[10.5px] font-semibold uppercase tracking-wide text-[#9CA3AF] inline-flex items-center gap-1">
            <MapPin size={12} /> Clicked at
          </p>
          {locating ? (
            <p className="text-[13px] text-[#6B7280] mt-1.5 inline-flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> Getting GPS address…
            </p>
          ) : gps?.address ? (
            <>
              <p className="text-[13.5px] font-semibold text-[#111] mt-1 leading-snug">{gps.address}</p>
              <p className="text-[11.5px] text-[#6B7280] mt-1">
                {Number(gps.lat).toFixed(5)}, {Number(gps.lng).toFixed(5)}
                {gps.accuracy != null ? ` · ±${Math.round(gps.accuracy)}m` : ""}
                {gps.capturedAt ? ` · ${gps.capturedAt}` : ""}
              </p>
            </>
          ) : (
            <p className="text-[13px] text-[#B45309] mt-1.5">Location missing. Allow location and retake the photo.</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClear}
          className="h-10 px-4 rounded-xl border border-black/12 bg-white text-[13px] font-semibold text-[#111] hover:bg-[#FAFAFB] transition-colors self-start"
        >
          Retake
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-xl overflow-hidden bg-black">
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-56 object-cover" />
        {starting ? (
          <div className="absolute inset-0 grid place-items-center bg-black/55 text-white text-[13px] font-medium">
            Starting camera…
          </div>
        ) : null}
      </div>
      {cameraError ? (
        <div className="flex flex-col gap-2">
          <p className="text-[12.5px] text-[#B45309]">{cameraError}</p>
          <button
            type="button"
            onClick={() => {
              setCameraError("");
              setRetryKey((n) => n + 1);
            }}
            className="h-10 px-4 rounded-xl border border-black/12 bg-white text-[13px] font-semibold text-[#111] hover:bg-[#FAFAFB] transition-colors self-start"
          >
            Try camera again
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleClickPhoto}
          disabled={starting}
          className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors disabled:opacity-50 self-start inline-flex items-center gap-2"
        >
          <Camera size={15} />
          Click photo
        </button>
      )}
    </div>
  );
}

function filesFromCard(prefix, card) {
  if (!card.front || !card.back) return [];
  return [
    { name: sideFileName(prefix, "front", card.front), side: "front", type: card.front.type, raw: card.front.raw },
    { name: sideFileName(prefix, "back", card.back), side: "back", type: card.back.type, raw: card.back.raw },
  ];
}

export default function P6DocumentUploadModal({ open, item, onClose, onUploaded }) {
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [files, setFiles] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [gps, setGps] = useState(null);
  const [locating, setLocating] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const extractTimer = useRef(null);

  const kind = item?.upload;
  const isIdCard = kind === "id-card";
  const isCameraGps = kind === "camera-gps";
  const isAadhaar = item?.idType === "aadhaar";
  const isPan = item?.idType === "pan";

  useEffect(() => {
    if (!open || !item) return;
    setFront(null);
    setBack(null);
    setFiles(item.files?.map((f) => ({ name: f.name, side: f.side, type: f.type, raw: f.raw })) || []);
    setPhoto(null);
    setGps(null);
    setLocating(false);
    setExtracting(false);
    return () => {
      if (extractTimer.current) window.clearTimeout(extractTimer.current);
    };
  }, [open, item]);

  if (!open || !item) return null;

  const handleSubmit = () => {
    if (isIdCard) {
      if (!front || !back) {
        toast.info(`Upload ${isAadhaar ? "Aadhaar" : "PAN"} front and back.`);
        return;
      }
      setExtracting(true);
      extractTimer.current = window.setTimeout(() => {
        onUploaded?.({ files: filesFromCard(item.id, { front, back }) });
      }, 900);
      return;
    }

    if (isCameraGps) {
      if (!photo) {
        toast.info("Click a photo from the camera first.");
        return;
      }
      if (locating) {
        toast.info("Wait for the GPS address.");
        return;
      }
      if (!gps?.address && gps?.lat == null) {
        toast.info("Location is required. Allow location and retake.");
        return;
      }
      onUploaded?.({
        files: [{ name: photo.name, type: photo.type, raw: photo.raw }],
        gps,
      });
      return;
    }

    if (!files.length) {
      toast.info("Attach at least one file.");
      return;
    }
    onUploaded?.({ files: files.map((f) => ({ name: f.name, type: f.type, raw: f.raw })) });
  };

  const subtitle = isIdCard
    ? "Upload front and back. We'll extract name, DOB and address, then compare with the existing profile."
    : isCameraGps
      ? "Click from the camera. We'll save the GPS address from where the photo was taken."
      : "Attach files the same way as Documents & KYC.";

  const busy = extracting || locating;

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={`Upload ${item.title}`}
      subtitle={subtitle}
      icon={isCameraGps ? <Camera size={18} /> : isAadhaar || isPan ? <ShieldCheck size={18} /> : <FileUp size={18} />}
      iconBg="#F3E8F0"
      iconColor="#7A0A17"
      width="max-w-lg"
      hideClose={busy}
      footer={
        extracting ? null : (
          <>
            <button
              type="button"
              onClick={onClose}
              disabled={locating}
              className="h-10 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={locating}
              className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors disabled:opacity-50"
            >
              {isCameraGps ? "Save photo" : "Upload"}
            </button>
          </>
        )
      }
    >
      {extracting ? (
        <div className="py-10 px-4 text-center">
          <Loader2 size={28} className="mx-auto text-[#7A0A17] animate-spin" />
          <p className="text-[14px] font-semibold text-[#111] mt-3">Reading the card…</p>
          <p className="text-[12.5px] text-[#6B7280] mt-1.5 max-w-sm mx-auto leading-snug">
            Placeholder: production OCR will extract name, date of birth and address, then match them with the client profile.
          </p>
        </div>
      ) : isIdCard ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SideSlot label="Front" file={front} onPick={setFront} onClear={() => setFront(null)} />
          <SideSlot label="Back" file={back} onPick={setBack} onClear={() => setBack(null)} />
        </div>
      ) : isCameraGps ? (
        <CameraGpsSlot
          item={item}
          photo={photo}
          gps={gps}
          locating={locating}
          onCaptured={({ photo: nextPhoto, gps: nextGps, locating: nextLocating }) => {
            if (nextPhoto) setPhoto(nextPhoto);
            setGps(nextGps);
            setLocating(Boolean(nextLocating));
          }}
          onClear={() => {
            setPhoto(null);
            setGps(null);
            setLocating(false);
          }}
        />
      ) : (
        <FileListSlot
          files={files}
          onAdd={(file) => {
            setFiles((prev) => [...prev, file]);
            toast.success(`Attached ${file.name}`);
          }}
          onRemove={(index) => setFiles((prev) => prev.filter((_, i) => i !== index))}
        />
      )}
    </Modal>
  );
}
