const SIZES = {
  xs:  "size-6 text-[10px]",
  sm:  "size-8 text-xs",
  md:  "size-10 text-sm",
  lg:  "size-12 text-base",
  xl:  "size-16 text-xl",
};

function getInitials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function Avatar({ src, name = "", size = "md", className = "", statusColor }) {
  return (
    <span className={`relative inline-block shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${SIZES[size]} rounded-full object-cover`}
        />
      ) : (
        <span
          className={`${SIZES[size]} rounded-full bg-[#f5f4fe] text-[#7B6CF6] font-semibold grid place-items-center`}
        >
          {getInitials(name)}
        </span>
      )}
      {statusColor && (
        <span
          className="absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-white"
          style={{ backgroundColor: statusColor }}
        />
      )}
    </span>
  );
}
