import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "@/lib/navigation";
import { usePermission } from "@/hooks/usePermissions";

export default function Sidebar() {
  const { hasPermission } = usePermission();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen p-6">
      <h2 className="text-xl font-bold mb-8 text-orange-600">
        Hyper Kitchen
      </h2>

      <nav className="space-y-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-2 rounded-md transition ${
                  isActive
                    ? "bg-orange-100 text-orange-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
