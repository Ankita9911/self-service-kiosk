import { motion } from "framer-motion";
import type { MenuCategory } from "../types/menu.types";

interface CategoryTabsProps {
  categories: MenuCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryTabs({ categories, selectedCategory, onCategoryChange }: CategoryTabsProps) {
  const availableCategories = categories.filter(cat =>
    cat._id === "__COMBOS__" ? true : cat.items && cat.items.length > 0
  );

  if (availableCategories.length === 0) return null;

  return (
    <div
      className="overflow-x-auto scrollbar-hide"
      style={{
        background: "linear-gradient(to bottom, #ffffff, #f9f9f9)",
        borderBottom: "1px solid #f0f0f0",
        padding: "12px 16px",
      }}
    >
      <div className="flex gap-3" style={{ minWidth: "max-content" }}>
        {availableCategories.map((category, index) => {
          const isActive = category._id === selectedCategory;

          return (
            <motion.button
              key={category._id}
              onClick={() => onCategoryChange(category._id)}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.3, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center focus:outline-none"
              style={{ gap: "6px", minWidth: "72px" }}
            >
              {/* Circle image */}
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  padding: "3px",
                  background: isActive
                    ? "linear-gradient(135deg, #0abfa3, #079e87)"
                    : "linear-gradient(135deg, #e4e4e4, #cecece)",
                  boxShadow: isActive
                    ? "0 4px 14px rgba(10, 191, 163, 0.4)"
                    : "0 2px 6px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2.5px solid white",
                    background: "#f0f0f0",
                  }}
                >
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px",
                      }}
                    >
                      🍽️
                    </div>
                  )}
                </div>

                {/* Active dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeDot"
                    style={{
                      position: "absolute",
                      bottom: "1px",
                      right: "2px",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background: "#0abfa3",
                      border: "2px solid white",
                      boxShadow: "0 1px 4px rgba(10,191,163,0.5)",
                    }}
                    transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                  />
                )}
              </div>

              {/* Label */}
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#0abfa3" : "#777",
                  textAlign: "center",
                  lineHeight: "1.3",
                  maxWidth: "72px",
                  transition: "color 0.2s ease",
                  fontFamily: "'DM Sans', 'Nunito', sans-serif",
                  letterSpacing: "-0.01em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {category.name}
              </span>

              {/* Active underline indicator */}
              <motion.div
                style={{
                  width: isActive ? "20px" : "0px",
                  height: "3px",
                  borderRadius: "2px",
                  background: "#0abfa3",
                  transition: "width 0.3s ease",
                }}
              />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}