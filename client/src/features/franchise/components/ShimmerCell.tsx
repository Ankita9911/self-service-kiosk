interface Props {
  w?: string;
}

export function ShimmerCell({ w = "w-24" }: Props) {
  return (
    <td className="px-5 py-4">
      <div className={`relative overflow-hidden bg-slate-100 dark:bg-white/[0.06] rounded-lg h-4 ${w}`}>
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/10 to-transparent" />
      </div>
    </td>
  );
}