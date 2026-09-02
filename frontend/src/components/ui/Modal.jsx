import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  icon,
  iconBg = "#E7F8EF",
  iconColor = "#16A34A",
  children,
  footer,
  width = "max-w-lg",
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      {/* panel */}
      <div
        className={`relative z-10 w-full ${width} bg-white rounded-2xl shadow-xl flex flex-col max-h-[90vh]`}
      >
        {/* header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <span
                className="size-9 rounded-xl grid place-items-center shrink-0"
                style={{ backgroundColor: iconBg, color: iconColor }}
              >
                {icon}
              </span>
            )}
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-[#1a1a1a] truncate">{title}</h2>
              {subtitle && <p className="text-xs text-[#6f7886] mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#6f7886] hover:bg-black/5 transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        {/* body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
        {/* footer */}
        {footer && <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-black/10 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
