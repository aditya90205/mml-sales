import { forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, error, hint, leftIcon, rightIcon, className = "", wrapperClassName = "", ...props },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${wrapperClassName}`}>
      {label && (
        <label className="text-sm font-medium text-[#1a1a1a]">{label}</label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-[#8f95a5] pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          {...props}
          className={`w-full h-10 border rounded-xl bg-white text-sm text-[#1a1a1a] placeholder:text-[#aaa] outline-none transition-colors focus:ring-2 focus:ring-[#8b0000]/20 focus:border-[#8b0000] ${
            error ? "border-[#df264f]" : "border-black/15"
          } ${leftIcon ? "pl-9" : "px-3"} ${rightIcon ? "pr-9" : "pr-3"} ${className}`}
        />
        {rightIcon && (
          <span className="absolute right-3 text-[#8f95a5]">{rightIcon}</span>
        )}
      </div>
      {error && <p className="text-xs text-[#df264f]">{error}</p>}
      {hint && !error && <p className="text-xs text-[#8f95a5]">{hint}</p>}
    </div>
  );
});

export default Input;
