interface Props {
  categories: { _id: string; name: string }[];
  selectedCategoryId: string;
  onSelect: (id: string) => void;
}

export function CategoryFilter({ categories, selectedCategoryId, onSelect }: Props) {
  const all = [{ _id: "ALL", name: "All Items" }, ...categories];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="inline-flex items-center gap-1 bg-white dark:bg-[#161920] border border-slate-100 dark:border-white/[0.07] rounded-xl p-1 flex-wrap">
        {all.map((c) => (
          <button
            key={c._id}
            onClick={() => onSelect(c._id)}
            className={`px-3.5 h-7 rounded-lg text-xs font-semibold transition-all ${
              selectedCategoryId === c._id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}