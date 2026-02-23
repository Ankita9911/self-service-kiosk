import { cn } from "@/shared/lib/utils";

export function ShimmerCell({ w = "w-24" }: { w?: string }) {
  return (
    <td className="px-5 py-4">
      <div className={cn("relative overflow-hidden bg-slate-100 rounded-lg h-4", w)}>
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.4s_ease-in-out_infinite] bg-linear-to-r from-transparent via-white/70 to-transparent" />
      </div>
    </td>
  );
}