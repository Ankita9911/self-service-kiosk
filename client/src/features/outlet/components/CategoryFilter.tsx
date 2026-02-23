interface Props {
  categories: { _id: string; name: string }[];
  selectedCategoryId: string;
  onSelect: (id: string) => void;
}

export function CategoryFilter({
  categories,
  selectedCategoryId,
  onSelect,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("ALL")}
        className={`px-3 h-10 rounded-xl text-xs font-semibold transition-all ${
          selectedCategoryId === "ALL"
            ? "bg-orange-500 text-white shadow-sm"
            : "bg-slate-100 text-slate-500 hover:bg-slate-200"
        }`}
      >
        All
      </button>

      {categories.map((c) => (
        <button
          key={c._id}
          onClick={() => onSelect(c._id)}
          className={`px-3 h-10 rounded-xl text-xs font-semibold transition-all ${
            selectedCategoryId === c._id
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}