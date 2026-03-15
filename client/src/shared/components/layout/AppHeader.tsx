import { getRoleIcon, getRoleBadgeStyle } from "@/shared/constants/roles";
import { UserDropdown } from "./UserDropdown";
import type { User } from "@/features/users/types/user.types";

interface AppHeaderProps {
  user: (User & { mustChangePassword?: boolean }) | null;
  onLogoutRequest: () => void;
}

function VDivider() {
  return <div className="h-5 w-px bg-slate-100 dark:bg-white/[0.07] mx-0.5" />;
}

export function AppHeader({ user, onLogoutRequest }: AppHeaderProps) {
  return (
    <header className="h-16 bg-white dark:bg-[#111318] border-b border-slate-100 dark:border-white/[0.06] px-5 flex items-center justify-end sticky top-0 z-30 shrink-0 transition-colors duration-300">
      <div className="flex items-center gap-1.5">
        <VDivider />

        <span
          className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10.5px] font-semibold uppercase tracking-wide ${getRoleBadgeStyle(user?.role)}`}
        >
          {getRoleIcon(user?.role)}
          {user?.role?.replace(/_/g, " ")}
        </span>

        <VDivider />

        <UserDropdown user={user} onLogoutRequest={onLogoutRequest} />
      </div>
    </header>
  );
}
