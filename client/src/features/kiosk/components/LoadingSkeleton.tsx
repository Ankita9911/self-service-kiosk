export function CategoryTabsSkeleton() {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 p-4 min-w-max">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="px-8 py-4 rounded-2xl bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 w-40 h-16"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MenuGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white rounded-3xl overflow-hidden shadow-lg border-2 border-gray-100">
            <div className="h-48 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"></div>
            <div className="p-5 space-y-3">
              <div className="h-5 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-3/4"></div>
              <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-1/2"></div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-8 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-20"></div>
                <div className="h-12 w-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
