import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, KeyRound, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "@/shared/providers/ThemeProvider";
import type { User } from "@/features/users/types/user.types";

interface UserDropdownProps {
  user: (User & { mustChangePassword?: boolean }) | null;
  onLogoutRequest: () => void;
}

function getInitials(name?: string): string {
  if (!name) return "A";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserDropdown({ user, onLogoutRequest }: UserDropdownProps) {
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const initials = getInitials(user?.name);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition group"
      >
        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[12px] font-bold shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40 shrink-0 select-none">
          {initials}
        </div>
        <div className="hidden sm:block text-left min-w-0">
          <p className="text-[12.5px] font-semibold text-slate-800 dark:text-white leading-none truncate max-w-[120px]">
            {user?.name ?? "Admin"}
          </p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1a1d26] border border-slate-100 dark:border-white/[0.08] rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/30 overflow-hidden z-50">
          <div className="px-4 py-3.5 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-100 dark:border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 dark:text-white truncate leading-none">
                  {user?.name ?? "Admin"}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                  {(user as any)?.email ?? user?.role?.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>

          <div className="py-1.5">
            <button
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-200 transition group"
            >
              {isDark
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-indigo-400 dark:text-indigo-300" />
              }
              <span className="flex-1 text-left">Dark Mode</span>
              <span className={`flex items-center justify-center w-8 h-4 rounded-full transition-colors duration-300 ${isDark ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"}`}>
                <span className={`w-3 h-3 bg-white rounded-full shadow transition-transform duration-300 ${isDark ? "translate-x-2" : "-translate-x-2"}`} />
              </span>
            </button>

            <button
              onClick={() => { setOpen(false); navigate("/reset-password"); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-200 transition"
            >
              <KeyRound className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              Change Password
            </button>
          </div>

          <div className="border-t border-slate-100 dark:border-white/[0.06] py-1.5">
            <button
              onClick={() => { setOpen(false); onLogoutRequest(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.08] transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
