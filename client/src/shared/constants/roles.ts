import { Crown, Shield, Store, ChefHat, PackageCheck } from "lucide-react";
import { createElement, type ReactNode } from "react";

export const ROLE_ICONS: Record<string, ReactNode> = {
	SUPER_ADMIN: createElement(Crown, { className: "w-3 h-3" }),
	FRANCHISE_ADMIN: createElement(Shield, { className: "w-3 h-3" }),
	OUTLET_MANAGER: createElement(Store, { className: "w-3 h-3" }),
	KITCHEN_STAFF: createElement(ChefHat, { className: "w-3 h-3" }),
	PICKUP_STAFF: createElement(PackageCheck, { className: "w-3 h-3" }),
};

export const ROLE_BADGE_STYLES: Record<string, string> = {
	SUPER_ADMIN:
		"bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
	FRANCHISE_ADMIN:
		"bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
	OUTLET_MANAGER:
		"bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
	KITCHEN_STAFF:
		"bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
	PICKUP_STAFF:
		"bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
};

const DEFAULT_ROLE_BADGE_STYLE =
	"bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";

export function getRoleIcon(role?: string): ReactNode {
	return role && ROLE_ICONS[role]
		? ROLE_ICONS[role]
		: createElement(Shield, { className: "w-3 h-3" });
}

export function getRoleBadgeStyle(role?: string): string {
	return role && ROLE_BADGE_STYLES[role]
		? ROLE_BADGE_STYLES[role]
		: DEFAULT_ROLE_BADGE_STYLE;
}
