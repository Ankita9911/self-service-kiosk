import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LogOut, KeyRound, ChevronDown,
  Crown, Shield, Store, ChefHat, PackageCheck,
  Sun, Moon, Check
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import useAuth from "@/shared/hooks/useAuth";
import { useTheme } from "@/shared/providers/ThemeProvider";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}


function getRoleIcon(role?: string) {
  const cls = "w-3 h-3";
  switch (role) {
    case "SUPER_ADMIN":     return <Crown className={cls} />;
    case "FRANCHISE_ADMIN": return <Shield className={cls} />;
    case "OUTLET_MANAGER":  return <Store className={cls} />;
    case "KITCHEN_STAFF":   return <ChefHat className={cls} />;
    case "PICKUP_STAFF":    return <PackageCheck className={cls} />;
    default:                return <Shield className={cls} />;
  }
}

const ROLE_STYLES: Record<string, string> = {
  SUPER_ADMIN:     "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20",
  FRANCHISE_ADMIN: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  OUTLET_MANAGER:  "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  KITCHEN_STAFF:   "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  PICKUP_STAFF:    "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
};

function getRoleStyle(role?: string) {
  return role && ROLE_STYLES[role]
    ? ROLE_STYLES[role]
    : "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
}

function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-[12px] text-slate-400 dark:text-slate-500">
      <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition">
        Home
      </span>
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1">
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span
            className={
              i === parts.length - 1
                ? "text-slate-700 dark:text-slate-200 font-medium"
                : "hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition"
            }
          >
            {p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        </span>
      ))}
    </nav>
  );
}

const TOAST_STYLES: Record<ToastType, string> = {
  success: "border-l-emerald-500 dark:border-l-emerald-400",
  error:   "border-l-red-500 dark:border-l-red-400",
  warning: "border-l-amber-500 dark:border-l-amber-400",
  info:    "border-l-indigo-500 dark:border-l-indigo-400",
};

const TOAST_ICONS: Record<ToastType, string> = {
  success: "✓",
  error:   "✕",
  warning: "⚠",
  info:    "i",
};

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            pointer-events-auto flex items-start gap-3
            bg-white dark:bg-[#1e2130] border border-slate-100 dark:border-white/[0.08]
            border-l-4 ${TOAST_STYLES[t.type]}
            rounded-xl px-4 py-3 shadow-xl shadow-slate-200/60 dark:shadow-black/30
            max-w-xs text-[13px] font-medium text-slate-700 dark:text-slate-300
            animate-slide-up
          `}
        >
          <span className="shrink-0 text-[11px] mt-0.5 opacity-60 font-bold">
            {TOAST_ICONS[t.type]}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = (message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };
  return { toasts, show };
}

function LogoutModal({
  open, onConfirm, onCancel,
}: {
  open: boolean; onConfirm: () => void; onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white dark:bg-[#1a1d26] border border-slate-100 dark:border-white/[0.08] rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4">
        <div className="w-11 h-11 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <LogOut className="w-5 h-5 text-red-500 dark:text-red-400" />
        </div>
        <h3 className="text-[16px] font-bold text-slate-800 dark:text-white text-center mb-1">
          Sign out?
        </h3>
        <p className="text-[13px] text-slate-400 dark:text-slate-500 text-center mb-7">
          You'll be redirected to the login page.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-white/[0.1] text-[13px] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-[13px] text-white transition font-semibold shadow-sm shadow-red-200 dark:shadow-red-900/30"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function VDivider() {
  return <div className="h-5 w-px bg-slate-100 dark:bg-white/[0.07] mx-0.5" />;
}


export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
   const { theme, toggleTheme, isDark } = useTheme();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toasts, show: showToast } = useToast();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogoutConfirm = () => {
    logout();
    setLogoutOpen(false);
  };

  const initials = user?.name
    ?.split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "A";

  return (
    <div className="flex min-h-screen bg-[#f7f8fb] dark:bg-[#0d0f16] transition-colors duration-300">
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapseChange={setSidebarCollapsed}
      />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

      
        <header className="
          h-16 bg-white dark:bg-[#111318]
          border-b border-slate-100 dark:border-white/[0.06]
          px-5 flex items-center justify-between
          sticky top-0 z-30 shrink-0
          transition-colors duration-300
        ">
         
          <Breadcrumb />

        
          <div className="flex items-center gap-1.5">


            <VDivider />

         
            <span className={`
              hidden sm:inline-flex items-center gap-1.5
              px-2.5 py-1 rounded-lg border
              text-[10.5px] font-semibold uppercase tracking-wide
              ${getRoleStyle(user?.role)}
            `}>
              {getRoleIcon(user?.role)}
              {user?.role?.replace(/_/g, " ")}
            </span>

            <VDivider />

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
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
                  className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropdownOpen && (
                <div className="
                  absolute right-0 top-full mt-2 w-56
                  bg-white dark:bg-[#1a1d26]
                  border border-slate-100 dark:border-white/[0.08]
                  rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/30
                  overflow-hidden z-50
                ">
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
                      <span className="flex-1 text-left">
                        {isDark ? "Light mode" : "Dark mode"}
                      </span>
                      <span className={`
                        flex items-center justify-center w-8 h-4 rounded-full transition-colors duration-300
                        ${isDark ? "bg-indigo-500" : "bg-slate-200 dark:bg-slate-700"}
                      `}>
                        <span className={`
                          w-3 h-3 bg-white rounded-full shadow transition-transform duration-300
                          ${isDark ? "translate-x-2" : "-translate-x-2"}
                        `} />
                      </span>
                    </button>

                
                    <button
                      onClick={() => { setDropdownOpen(false); navigate("/reset-password"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-slate-200 transition"
                    >
                      <KeyRound className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                      Change Password
                    </button>
                  </div>

                
                  <div className="border-t border-slate-100 dark:border-white/[0.06] py-1.5">
                    <button
                      onClick={() => { setDropdownOpen(false); setLogoutOpen(true); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-[12.5px] text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/[0.08] transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

       
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <Outlet context={{ showToast }} />
        </main>
      </div>

      <LogoutModal
        open={logoutOpen}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setLogoutOpen(false)}
      />
      <ToastContainer toasts={toasts} />
    </div>
  );
}