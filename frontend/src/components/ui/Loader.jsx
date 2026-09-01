import { Loader2 } from "lucide-react";

export function Spinner({ size = 20, className = "" }) {
  return (
    <Loader2
      size={size}
      className={`animate-spin text-[#8b0000] ${className}`}
    />
  );
}

export default function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64 w-full">
      <Spinner size={32} />
    </div>
  );
}
