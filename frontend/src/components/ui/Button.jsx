import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-[#8b0000] text-white hover:bg-[#6e0000] active:bg-[#5a0000]",
  secondary: "bg-white text-[#8b0000] border border-[#8b0000] hover:bg-[#fdf0f0]",
  ghost: "bg-transparent text-[#515052] hover:bg-black/5",
  danger: "bg-[#df264f] text-white hover:bg-[#c0203f]",
  outline: "bg-white text-[#515052] border border-black/15 hover:bg-[#f9f8f6]",
};

const SIZES = {
  xs: "text-xs px-2.5 py-1.5 rounded-lg",
  sm: "text-sm px-3 py-2 rounded-lg",
  md: "text-sm px-4 py-2.5 rounded-xl",
  lg: "text-base px-5 py-3 rounded-xl",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  leftIcon,
  rightIcon,
  ...props
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b0000]/40 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin shrink-0" />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {children}
      {!loading && rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
}
