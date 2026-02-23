import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { LogOut, KeyRound, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Sidebar from "./Sidebar";
import useAuth from "@/shared/hooks/useAuth";
import { Shield, Crown, Store, ChefHat, PackageCheck } from "lucide-react";

function getRoleIcon(role?: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return <Crown className="w-3.5 h-3.5" />;
    case "FRANCHISE_ADMIN":
      return <Shield className="w-3.5 h-3.5" />;
    case "OUTLET_MANAGER":
      return <Store className="w-3.5 h-3.5" />;
    case "KITCHEN_STAFF":
      return <ChefHat className="w-3.5 h-3.5" />;
    case "PICKUP_STAFF":
      return <PackageCheck className="w-3.5 h-3.5" />;
    default:
      return <Shield className="w-3.5 h-3.5" />;
  }
}
function useToast() {
  const [toasts, setToasts] = useState<
    { id: number; message: string; type: "success" | "error" | "info" }[]
  >([]);

  const show = (
    message: string,
    type: "success" | "error" | "info" = "info",
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  };

  return { toasts, show };
}

function LogoutModal({
  open,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-[#0f1117] border border-white/10 rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 animate-scale-in">
        <div className="flex items-center justify-center w-14 h-14 bg-red-500/10 rounded-full mb-5 mx-auto">
          <LogOut className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-clash-bold text-white text-center mb-1">
          Sign out?
        </h3>
        <p className="text-sm font-satoshi text-slate-400 text-center mb-7">
          You'll be redirected to the login page.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-slate-300 hover:bg-white/5 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-sm text-white transition font-semibold shadow-lg shadow-red-500/25"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
function ToastContainer({
  toasts,
}: {
  toasts: { id: number; message: string; type: string }[];
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-xl text-sm font-medium shadow-xl border animate-slide-up pointer-events-auto max-w-xs ${
            t.type === "success"
              ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-200"
              : t.type === "error"
                ? "bg-red-900/90 border-red-500/30 text-red-200"
                : "bg-slate-800/90 border-white/10 text-slate-200"
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <span>Home</span>
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span>/</span>
          <span
            className={
              i === parts.length - 1 ? "text-orange-400 font-medium" : ""
            }
          >
            {p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toasts, show: showToast } = useToast();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
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

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen">
      
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/70 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
       
          <div className="flex flex-col justify-center">
           
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 text-orange-700 text-[11px] font-clash-semibold uppercase tracking-wide shadow-sm">
              {getRoleIcon(user?.role)}
              {user?.role?.replace(/_/g, " ")}
            </span>
          </div>

        
          <div className="flex items-center gap-2">
          
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition group"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-orange-200">
                  {user?.name?.charAt(0) || "A"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[13px] font-clash-semibold text-slate-800 leading-none">
                    {user?.name || "Admin"}
                  </p>
                  <p className="text-[11px] font-satoshi text-slate-400 mt-0.5 leading-none">
                    {user?.role?.replace(/_/g, " ")}
                  </p>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

           
              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden z-50 animate-fade-down">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                    <p className="text-xs font-satoshi text-slate-500">
                      Signed in as
                    </p>
                    <p className="text-sm font-clash-semibold text-slate-800 truncate">
                      {user?.name}
                    </p>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate("/reset-password");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-satoshi text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                    >
                      <KeyRound className="w-4 h-4 text-slate-400" />
                      Change Password
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setLogoutOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-satoshi text-red-500 hover:bg-red-50 transition"
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

      
        <main className="flex-1 p-6 md:p-8">
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
