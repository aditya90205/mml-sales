/** Outlined action button used in deal-tab card headers (Open full form, Add note, …). */
export default function TabHeaderButton({ children, onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="shrink-0 h-9 px-3.5 rounded-xl bg-white border border-black/10 text-[12.5px] font-medium text-[#111] hover:bg-[#FAFAFB] transition-colors"
    >
      {children}
    </button>
  );
}
