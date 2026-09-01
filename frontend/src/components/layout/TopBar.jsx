import { Search } from "lucide-react";

// TopBar is search-bar only.
// Greeting, period selector, CTA and profile live in the Dashboard page header.
export default function TopBar() {
  return (
    <div className="h-14 border-b border-black/10 flex items-center px-6 bg-white shrink-0">
      <div className="flex items-center gap-2 h-9 px-3 rounded-xl border border-black/15 bg-[#fafafa] w-72 focus-within:ring-2 focus-within:ring-[#8b0000]/20 focus-within:border-[#8b0000] transition-all">
        <Search size={14} className="text-[#8f95a5] shrink-0" />
        <input
          placeholder="Search here..."
          className="bg-transparent text-sm text-[#1a1a1a] placeholder:text-[#aaa] outline-none w-full"
        />
      </div>
    </div>
  );
}
