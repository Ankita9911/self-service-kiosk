import { cn } from "@/shared/utils/commonFunction";

interface Props {
  tab: "READY" | "ALL";
  readyCount: number;
  totalCount: number;
  onChange: (tab: "READY" | "ALL") => void;
}

export function PickupTabs({
  tab,
  readyCount,
  totalCount,
  onChange,
}: Props) {
  return (
    <div className="bg-white border-b border-gray-100 px-6 flex gap-4">
      <button
        onClick={() => onChange("READY")}
        className={cn(
          "py-3 text-sm font-semibold border-b-2 transition-colors",
          tab === "READY"
            ? "border-green-500 text-green-700"
            : "border-transparent text-gray-500 hover:text-gray-700"
        )}
      >
        Ready for Pickup
        {readyCount > 0 && (
          <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
            {readyCount}
          </span>
        )}
      </button>

      <button
        onClick={() => onChange("ALL")}
        className={cn(
          "py-3 text-sm font-semibold border-b-2 transition-colors",
          tab === "ALL"
            ? "border-blue-500 text-blue-700"
            : "border-transparent text-gray-500 hover:text-gray-700"
        )}
      >
        All Active
        {totalCount > 0 && (
          <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
            {totalCount}
          </span>
        )}
      </button>
    </div>
  );
}