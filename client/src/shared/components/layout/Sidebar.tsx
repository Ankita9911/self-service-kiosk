import { NavLink, useNavigate } from "react-router-dom";
import { NAV_ITEMS } from "@/shared/constants/navigation";
import { usePermission } from "@/shared/hooks/usePermissions";
import {
  ChefHat,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface NavItem {
  path: string;
  label: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  permission?: string;
  badge?: string | number;
  isNew?: boolean;
  group?: string;
}

type NavGroup = {
  label?: string;
  items: NavItem[];
};

function buildGroups(items: NavItem[]): NavGroup[] {
  const grouped: Record<string, NavItem[]> = {};
  const ungrouped: NavItem[] = [];

  items.forEach((item) => {
    if ((item as any).group) {
      const g = (item as any).group as string;
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(item);
    } else {
      ungrouped.push(item);
    }
  });

  const groups: NavGroup[] = [];
  if (ungrouped.length) groups.push({ items: ungrouped });
  Object.entries(grouped).forEach(([label, items]) => {
    groups.push({ label, items });
  });
  return groups;
}

interface SidebarProps {
  collapsed: boolean;
  onCollapseChange: (v: boolean) => void;
}

export default function Sidebar({ collapsed, onCollapseChange }: SidebarProps) {
  const { hasPermission } = usePermission();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<NavItem[]>([]);
  const [activeResultIdx, setActiveResultIdx] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const visibleItems = (NAV_ITEMS as NavItem[]).filter(
    (item) => !item.permission || hasPermission(item.permission),
  );

  const groups = buildGroups(visibleItems);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setActiveResultIdx(0);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = visibleItems.filter((item) =>
      item.label.toLowerCase().includes(q),
    );
    setSearchResults(results);
    setActiveResultIdx(0);
  }, [searchQuery]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        if (collapsed) onCollapseChange(false);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [collapsed, onCollapseChange]);

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveResultIdx((i) => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveResultIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && searchResults[activeResultIdx]) {
      navigate(searchResults[activeResultIdx].path);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleSearchResultClick = (path: string) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <aside
      className={`
        ${collapsed ? "w-[60px]" : "w-[220px]"}
        bg-white dark:bg-[#111318]
        border-r border-slate-100 dark:border-white/[0.06]
        h-screen flex flex-col sticky top-0
        transition-all duration-300 ease-in-out
        z-40 shrink-0
      `}
    >
      <div className="h-16 flex items-center px-3.5 border-b border-slate-100 dark:border-white/[0.06] gap-2.5 shrink-0">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm shadow-indigo-200 dark:shadow-indigo-900/50 shrink-0">
          <ChefHat className="w-4 h-4 text-white" strokeWidth={2.2} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden min-w-0">
            <p className="text-[13.5px] font-bold text-slate-800 dark:text-white tracking-tight leading-none truncate">
              Hyper Kitchen
            </p>
            <p className="text-[9.5px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
              Management
            </p>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-3 pt-3 pb-1 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onKeyDown={handleSearchKeyDown}
              className="
                w-full h-8 pl-8 pr-8 rounded-lg
                bg-slate-50 dark:bg-white/[0.05]
                border border-slate-200 dark:border-white/[0.08]
                text-[12px] text-slate-700 dark:text-slate-300
                placeholder:text-slate-400 dark:placeholder:text-slate-600
                focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-300 dark:focus:border-indigo-500/50
                transition
              "
            />
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSearchOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] bg-slate-100 dark:bg-white/[0.08] text-slate-400 dark:text-slate-500 px-1.5 py-0.5 rounded font-mono pointer-events-none">
                ⌘K
              </kbd>
            )}
          </div>

          {searchOpen && searchQuery && (
            <div className="mt-1.5 bg-white dark:bg-[#1a1d26] border border-slate-100 dark:border-white/[0.08] rounded-xl shadow-xl shadow-slate-200/60 dark:shadow-black/30 overflow-hidden z-50">
              {searchResults.length === 0 ? (
                <div className="px-4 py-3 text-[12px] text-slate-400 dark:text-slate-500">
                  No pages found for "{searchQuery}"
                </div>
              ) : (
                <div className="py-1">
                  {searchResults.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleSearchResultClick(item.path)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2.5 text-[12.5px] font-medium text-left transition
                          ${
                            i === activeResultIdx
                              ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                          }
                        `}
                      >
                        {Icon && (
                          <Icon
                            className="w-3.5 h-3.5 shrink-0"
                            strokeWidth={1.8}
                          />
                        )}
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {collapsed && (
        <div className="px-2 pt-3 pb-1 shrink-0">
          <button
            onClick={() => {
              onCollapseChange(false);
              setTimeout(() => searchInputRef.current?.focus(), 150);
            }}
            className="w-full h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-white/[0.05] border border-slate-200 dark:border-white/[0.08] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
            title="Search (⌘K)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-1 scrollbar-hide">
        {groups.map((group, gi) => (
          <div
            key={gi}
            className={
              gi > 0
                ? "mt-4 pt-3 border-t border-slate-100 dark:border-white/[0.05]"
                : ""
            }
          >
            {group.label && !collapsed && (
              <p className="text-[9.5px] font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-2.5 mb-1.5">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => `
                    group flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-medium mb-1 last:mb-0
                    transition-all duration-150 relative
                    ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {Icon && (
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive
                              ? "text-indigo-500 dark:text-indigo-400"
                              : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                          }`}
                          strokeWidth={isActive ? 2.2 : 1.8}
                        />
                      )}
                      {!collapsed && (
                        <>
                          <span className="truncate flex-1">{item.label}</span>
                          {item.badge && (
                            <span className="text-[10px] font-bold bg-indigo-600 text-white rounded-full px-1.5 py-0.5 leading-none min-w-[18px] text-center">
                              {item.badge}
                            </span>
                          )}
                          {item.isNew && !item.badge && (
                            <span className="text-[9px] font-bold bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full px-1.5 py-0.5 leading-none uppercase tracking-wide">
                              New
                            </span>
                          )}
                        </>
                      )}
                      {/* Active indicator dot for collapsed */}
                      {collapsed && isActive && (
                        <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 dark:border-white/[0.06] p-2 shrink-0">
        <button
          onClick={() => onCollapseChange(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition text-[12px] font-medium"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <>
              <PanelLeftClose className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
