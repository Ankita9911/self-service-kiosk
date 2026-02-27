export function ShimmerCell({ w = "w-24" }: { w?: string }) {
  return (
    <td className="px-5 py-4">
      <div
        className={`h-4 ${w} rounded-md bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100
          dark:from-white/[0.04] dark:via-white/10 dark:to-white/[0.04]
          animate-shimmer bg-[length:400%_100%]`}
      />
    </td>
  );
}