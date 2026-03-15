interface ShimmerProps {
  w?: string;
  h?: string;
  rounded?: string;
  className?: string;
}

interface ShimmerCellProps extends ShimmerProps {
  tdClassName?: string;
}

export function Shimmer({
  w = "w-24",
  h = "h-4",
  rounded = "rounded-md",
  className = "",
}: ShimmerProps) {
  return (
    <div
      className={`relative overflow-hidden ${h} ${w} ${rounded} bg-slate-100 dark:bg-white/[0.06] ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
    </div>
  );
}

export function ShimmerCell({
  w = "w-24",
  h = "h-4",
  rounded = "rounded-md",
  tdClassName = "",
}: ShimmerCellProps) {
  return (
    <td className={`px-5 py-4 ${tdClassName}`}>
      <Shimmer w={w} h={h} rounded={rounded} />
    </td>
  );
}
