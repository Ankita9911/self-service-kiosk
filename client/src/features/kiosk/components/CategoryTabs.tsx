import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { trackEvent } from "@/features/kiosk/telemetry";
import type { MenuCategory } from "../types/menu.types";

interface CategoryTabsProps {
  categories: MenuCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export default function CategoryTabs({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  const seenImpressionsRef = useRef<Set<string>>(new Set());
  const availableCategories = categories.filter((cat) =>
    cat._id === "__COMBOS__" ? true : cat.items && cat.items.length > 0,
  );

  useEffect(() => {
    availableCategories.forEach((category) => {
      if (seenImpressionsRef.current.has(String(category._id))) return;
      seenImpressionsRef.current.add(String(category._id));
      trackEvent({
        name: "kiosk.menu_category_impression",
        page: "menu",
        component: "category_tabs",
        action: "impression",
        target: String(category._id),
        payload: {
          categoryName: category.name,
        },
      });
    });
  }, [availableCategories]);

  if (availableCategories.length === 0) return null;

  return (
    <div
      className="overflow-x-auto scrollbar-hide"
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #f1f2f4",
        padding: "10px 14px",
      }}
    >
      <div className="flex gap-2.5" style={{ minWidth: "max-content" }}>
        {availableCategories.map((category, index) => {
          const isActive = category._id === selectedCategory;

          return (
            <motion.button
              key={category._id}
              onClick={() => onCategoryChange(category._id)}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.04,
                duration: 0.3,
                ease: "easeOut",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center justify-start focus:outline-none"
              style={{
                width: "94px",
                height: "94px",
                borderRadius: "24px",
                padding: "7px 7px 8px",
                background: isActive
                  ? "linear-gradient(170deg, #16b8a1 0%, #0e9f89 100%)"
                  : "#ffffff",
                border: isActive
                  ? "1px solid rgba(12, 154, 133, 0.75)"
                  : "1px solid #eff1f3",
                boxShadow: isActive
                  ? "0 10px 22px rgba(22, 184, 161, 0.34)"
                  : "0 4px 14px rgba(15, 23, 42, 0.08)",
                gap: "5px",
                transition: "all 0.25s ease",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  padding: "2px",
                  background: "#ffffff",
                  boxShadow: isActive
                    ? "0 4px 10px rgba(6, 120, 104, 0.28)"
                    : "0 3px 8px rgba(0, 0, 0, 0.14)",
                  transition: "all 0.25s ease",
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
                    border: "2px solid rgba(255,255,255,0.95)",
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
                        fontSize: "20px",
                      }}
                    >
                      🍽️
                    </div>
                  )}
                </div>
              </div>

              <span
                style={{
                  fontSize: "10px",
                  fontWeight: isActive ? 700 : 600,
                  color: isActive ? "#ffffff" : "#475569",
                  textAlign: "center",
                  lineHeight: "1.2",
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
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
