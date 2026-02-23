import { motion } from "framer-motion";
import type { MenuCategory } from "../../../shared/lib/menuCache";

interface CategoryTabsProps {
  categories: MenuCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryTabs({ categories, selectedCategory, onCategoryChange }: CategoryTabsProps) {
  const availableCategories = categories.filter(cat => cat.items && cat.items.length > 0);

  if (availableCategories.length === 0) {
    return null;
  }

  return (
    <div className="overflow-x-auto scrollbar-hide bg-gradient-to-b from-white to-gray-50">
      <div className="flex gap-3 p-4 min-w-max">
        {availableCategories.map((category) => {
          const isActive = category._id === selectedCategory;
          
          return (
            <motion.button
              key={category._id}
              onClick={() => onCategoryChange(category._id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative px-8 py-4 rounded-2xl font-bold text-base
                transition-all duration-300 whitespace-nowrap min-w-36 overflow-hidden
                ${isActive 
                  ? 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 text-white shadow-xl shadow-orange-300/50' 
                  : 'bg-white text-gray-600 hover:text-gray-900 shadow-md hover:shadow-lg border-2 border-gray-100 hover:border-orange-200'
                }
              `}
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500"
                  style={{ borderRadius: '1rem' }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className="relative z-10">
                <div className={`font-black text-lg ${isActive ? 'text-white' : 'text-gray-900'}`}>
                  {category.name}
                </div>
                <div 
                  className={`text-xs font-semibold mt-1 ${isActive ? 'text-orange-100' : 'text-gray-400'}`}
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  {category.items.length} item{category.items.length !== 1 ? 's' : ''}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
