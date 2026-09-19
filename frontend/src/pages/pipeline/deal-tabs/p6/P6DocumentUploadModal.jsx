import { useEffect, useRef, useState } from "react";
import { FileUp, ShieldCheck, X } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "../../../../components/ui/Modal";

const ACCEPT = ".pdf,.jpg,.jpeg,.png,.doc,.docx";
const FIELD =
  "w-full h-11 rounded-xl border border-black/12 px-3.5 text-[13px] text-[#111] placeholder:text-[#9CA3AF] outline-none focus:border-[#7A0A17]/40";
const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

function filePreviewUrl(file) {
  if (!file?.raw || !file.raw.type?.startsWith("image/")) return null;
  return URL.createObjectURL(file.raw);
}

function toStoredFile(file) {
  return { name: file.name, size: file.size, type: file.type, raw: file };
}

export function formatAadhaar(value) {
  return value.replace(/\D/g, "").slice(0, 12).replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatPan(value) {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 10);
}

function aadhaarDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function isAadhaarNo(value) {
  return aadhaarDigits(value).length === 12;
}

function isPanNo(value) {
  return PAN_RE.test(String(value || "").replace(/\s/g, "").toUpperCase());
}

function sideFileName(prefix, side, file) {
  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  return `${prefix}-${side.toLowerCase()}.${ext}`;
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

function NumberField({ label, value, onChange, placeholder, hint }) {
  return (
    <label className="block">
      <span className="block text-[12.5px] font-semibold text-[#111] mb-1.5">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={FIELD} />
      {hint ? <span className="block text-[11px] text-[#9CA3AF] mt-1">{hint}</span> : null}
    </label>
  );
}

function IdCardFields({ numberLabel, numberHint, number, onNumberChange, numberPlaceholder, front, back, onFront, onBack }) {
  return (
    <div className="flex flex-col gap-3">
      <NumberField
        label={numberLabel}
        value={number}
        onChange={onNumberChange}
        placeholder={numberPlaceholder}
        hint={numberHint}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SideSlot label="Front" file={front} onPick={onFront} onClear={() => onFront(null)} />
        <SideSlot label="Back" file={back} onPick={onBack} onClear={() => onBack(null)} />
      </div>
    </div>
  );
}

function OtpBlock({ otp, setOtp, sent, sending, onSend, onSubmit }) {
  return (
    <div className="rounded-xl border border-[#7A0A17]/15 bg-[#FCF5F6] px-4 py-3.5">
      <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
        <label className="block flex-1 min-w-0">
          <span className="block text-[12.5px] font-medium text-[#374151] mb-1.5">OTP</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onSubmit?.();
              }
            }}
            placeholder="Enter OTP"
            className={`${FIELD} font-semibold tracking-[0.2em]`}
          />
        </label>
        <button
          type="button"
          onClick={onSend}
          disabled={sending}
          className="h-11 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors disabled:opacity-60 shrink-0"
        >
          {sending ? "Sending…" : sent ? "Resend OTP" : "Send OTP"}
        </button>
      </div>
      {sent ? (
        <p className="text-[12px] font-medium text-[#166534] mt-2">OTP sent to the client mobile.</p>
      ) : null}
    </div>
  );
}

function validateIdCard({ idType, number, front, back, label }) {
  if (idType === "aadhaar" && !isAadhaarNo(number)) {
    return `Enter a 12-digit ${label} number.`;
  }
  if (idType === "pan" && !isPanNo(number)) {
    return `Enter a valid ${label} (ABCDE1234F).`;
  }
  if (!front || !back) {
    return `Upload ${label} front and back.`;
  }
  return "";
}

function filesFromCard(prefix, card) {
  if (!card.front || !card.back) return [];
  return [
    { name: sideFileName(prefix, "front", card.front) },
    { name: sideFileName(prefix, "back", card.back) },
  ];
}

export default function P6DocumentUploadModal({ open, item, onClose, onUploaded }) {
  const [number, setNumber] = useState("");
  const [front, setFront] = useState(null);
  const [back, setBack] = useState(null);
  const [files, setFiles] = useState([]);
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const kind = item?.upload;
  const isIdCard = kind === "id-card";
  const isAadhaar = item?.idType === "aadhaar";
  const isPan = item?.idType === "pan";
  const needsOtp = Boolean(item?.otp);

  useEffect(() => {
    if (!open || !item) return;
    setFront(null);
    setBack(null);
    setFiles(item.files?.map((f) => ({ name: f.name })) || []);
    setOtp("");
    setSending(false);
    setSent(false);
    if (item.number) {
      setNumber(isAadhaar ? formatAadhaar(item.number) : isPan ? formatPan(item.number) : item.number);
    } else {
      setNumber("");
    }
  }, [open, item, isAadhaar, isPan]);

  if (!open || !item) return null;

  const handleSendOtp = () => {
    if (isAadhaar && !isAadhaarNo(number)) {
      toast.info("Enter a 12-digit Aadhaar number first.");
      return;
    }
    if (isPan && !isPanNo(number)) {
      toast.info("Enter a valid PAN number first.");
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setOtp("1234");
      toast.success("OTP sent to client mobile.");
    }, 400);
  };

  const handleSubmit = () => {
    if (isIdCard) {
      const error = validateIdCard({
        idType: item.idType,
        number,
        front,
        back,
        label: isAadhaar ? "Aadhaar" : "PAN",
      });
      if (error) {
        toast.info(error);
        return;
      }
      if (needsOtp) {
        if (!sent) {
          toast.info("Send OTP first.");
          return;
        }
        if (!otp.trim()) {
          toast.info("Enter the OTP.");
          return;
        }
      }
      onUploaded?.({
        number: isAadhaar ? aadhaarDigits(number) : formatPan(number),
        files: filesFromCard(item.id, { front, back }),
      });
      return;
    }

    if (!files.length) {
      toast.info("Attach at least one file.");
      return;
    }
    onUploaded?.({ files: files.map((f) => ({ name: f.name })) });
  };

  const subtitle = isAadhaar
    ? "Enter Aadhaar number, upload front and back, then submit."
    : isPan
      ? "Enter PAN number, upload front and back, then submit."
      : "Attach files the same way as Documents & KYC.";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isIdCard ? `Verify ${item.title}` : `Upload ${item.title}`}
      subtitle={subtitle}
      icon={isAadhaar || isPan ? <ShieldCheck size={18} /> : <FileUp size={18} />}
      iconBg="#F3E8F0"
      iconColor="#7A0A17"
      width="max-w-lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-xl border border-black/10 text-[13px] font-semibold text-[#374151] hover:bg-[#FAFAFB] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="h-10 px-4 rounded-xl bg-[#7A0A17] text-white text-[13px] font-semibold hover:bg-[#640712] transition-colors"
          >
            Submit
          </button>
        </>
      }
    >
      {isIdCard ? (
        <div className="flex flex-col gap-4">
          <IdCardFields
            numberLabel={isAadhaar ? "Aadhaar number" : "PAN number"}
            numberHint={isAadhaar ? "12 digits." : "10 characters, e.g. ABCDE1234F."}
            number={number}
            onNumberChange={(value) => setNumber(isAadhaar ? formatAadhaar(value) : formatPan(value))}
            numberPlaceholder={isAadhaar ? "1234 5678 9012" : "ABCDE1234F"}
            front={front}
            back={back}
            onFront={setFront}
            onBack={setBack}
          />
          {needsOtp ? (
            <OtpBlock
              otp={otp}
              setOtp={setOtp}
              sent={sent}
              sending={sending}
              onSend={handleSendOtp}
              onSubmit={handleSubmit}
            />
          ) : null}
        </div>
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
