import { Construction } from "lucide-react";

/** Placeholder shown for deal-detail tabs that haven't been built yet. */
export default function ComingSoonTab({ label }) {
  return (
    <div className="bg-white border border-black/8 rounded-2xl p-10 flex flex-col items-center justify-center text-center gap-3">
      <span className="size-11 rounded-xl bg-[#FFF1F2] text-[#7A0A17] grid place-items-center">
        <Construction size={20} />
      </span>
      <p className="text-[14px] font-bold text-[#111]">{label} is coming soon</p>
      <p className="text-[12.5px] text-[#9CA3AF] max-w-[360px]">
        This tab is being built next. Check back shortly for the {label.toLowerCase()} workflow.
      </p>
    </div>
  );
}
