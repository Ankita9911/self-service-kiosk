const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-50 text-purple-700 border-purple-200",
  FRANCHISE_ADMIN: "bg-blue-50 text-blue-700 border-blue-200",
  OUTLET_MANAGER: "bg-orange-50 text-orange-700 border-orange-200",
  KITCHEN_STAFF: "bg-amber-50 text-amber-700 border-amber-200",
  PICKUP_STAFF: "bg-teal-50 text-teal-700 border-teal-200",
  KIOSK_DEVICE: "bg-slate-100 text-slate-600 border-slate-200",
};

export function RoleBadge({ role }: { role: string }) {
  const style =
    ROLE_STYLES[role] ||
    "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-clash-semibold border ${style}`}>
      {role.replace(/_/g, " ")}
    </span>
  );
}