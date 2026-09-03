/**
 * Wraps a tab's content in a blurred, non-interactive preview with a
 * lock notice on top — used for tabs (Payments, P6 Checklist) that only
 * unlock once the deal reaches a later stage.
 */
export default function LockedTabOverlay({ title, message, children }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px]">
        <span className="font-bold text-[#E8395B]">{title}</span>{" "}
        <span className="text-[#E8395B]/70">{message}</span>
      </p>
      <div className="pointer-events-none select-none blur-[3px] opacity-80">{children}</div>
    </div>
  );
}
