const ROLE_STYLES: Record<string, { light: string; dark: string }> = {
  SUPER_ADMIN: { light: "bg-purple-50 text-purple-700 border-purple-200", dark: "dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20" },
  FRANCHISE_ADMIN: { light: "bg-blue-50 text-blue-700 border-blue-200", dark: "dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20" },
  OUTLET_MANAGER: { light: "bg-indigo-50 text-indigo-700 border-indigo-200", dark: "dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20" },
  KITCHEN_STAFF: { light: "bg-amber-50 text-amber-700 border-amber-200", dark: "dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20" },
  PICKUP_STAFF: { light: "bg-teal-50 text-teal-700 border-teal-200", dark: "dark:bg-teal-500/10 dark:text-teal-300 dark:border-teal-500/20" },
  KIOSK_DEVICE: { light: "bg-slate-100 text-slate-600 border-slate-200", dark: "dark:bg-white/[0.06] dark:text-slate-400 dark:border-white/[0.08]" },
};

const DEFAULT = { light: "bg-slate-100 text-slate-600 border-slate-200", dark: "dark:bg-white/[0.06] dark:text-slate-400 dark:border-white/[0.08]" };

export function RoleBadge({ role }: { role: string }) {
  const style = ROLE_STYLES[role] || DEFAULT;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${style.light} ${style.dark}`}
    >
      {role.replace(/_/g, " ")}
    </span>
  );
}