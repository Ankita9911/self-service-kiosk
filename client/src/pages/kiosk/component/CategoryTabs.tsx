import type { MenuCategory } from "../../../lib/menuCache";

interface CategoryTabsProps {
  categories: MenuCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryTabs({ categories, selectedCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-2 p-3 min-w-max">
        {categories.map((category) => {
          const isActive = category._id === selectedCategory;
          return (
            <button
              key={category._id}
              onClick={() => onCategoryChange(category._id)}
              className={`
                px-6 py-3 rounded-xl font-black text-base uppercase tracking-tight italic
                transition-all duration-300 whitespace-nowrap
                min-w-[140px] active:scale-95
                ${isActive 
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 scale-105' 
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                }
              `}
            >
              {category.name}
              <div className={`text-xs font-bold tracking-wider mt-0.5 ${isActive ? 'text-orange-100' : 'text-slate-300'}`}>
                {category.items.length} items
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}