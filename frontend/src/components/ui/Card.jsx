export default function Card({ children, className = "", padding = true, ...props }) {
  return (
    <div
      {...props}
      className={`bg-white border border-black/10 rounded-2xl ${padding ? "p-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
