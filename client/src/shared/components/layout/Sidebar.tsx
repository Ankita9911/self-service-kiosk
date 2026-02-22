import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "@/shared/lib/navigation";
import { usePermission } from "@/shared/hooks/usePermissions";
import { ChefHat } from "lucide-react";

export default function Sidebar() {
  const { hasPermission } = usePermission();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <aside className="w-64 bg-[#0f1117] border-r border-white/5 h-screen flex flex-col sticky top-0 shadow-2xl">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-[15px] font-clash-bold text-white leading-none tracking-tight">
              Hyper Kitchen
            </h2>
            <p className="text-[10px] font-satoshi text-slate-500 mt-0.5 tracking-widest uppercase">
              Management Suite
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group flex items-center gap-3 pl-3 pr-3 py-2.5 rounded-lg text-sm font-satoshi-medium transition-all duration-200 border-l-2 -ml-px ${
                  isActive
                    ? "border-l-orange-400 bg-orange-500/10 text-orange-400"
                    : "border-l-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5 hover:border-l-orange-400"
                }`
              }
            >
              {Icon && (
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-colors`}
                />
              )}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer hint */}
      <div className="px-6 py-4 border-t border-white/5">
        <p className="text-[10px] text-slate-600 text-center">
          © {new Date().getFullYear()} Hyper Kitchen
        </p>
      </div>
    </aside>
  );
}