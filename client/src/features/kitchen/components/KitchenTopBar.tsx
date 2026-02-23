interface Props {
  totalActive: number;
  lastUpdated: Date;
  onRefresh: () => void;
}

export function KitchenTopBar({
  totalActive,
  lastUpdated,
  onRefresh,
}: Props) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
        <h1 className="text-xl font-bold text-gray-900">
          Kitchen Display
        </h1>
        {totalActive > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {totalActive} active
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <p className="text-xs text-gray-400">
          Updated{" "}
          {lastUpdated.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>

        <button
          onClick={onRefresh}
          className="text-xs text-blue-600 hover:text-blue-800 font-medium border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>
    </div>
  );
}