import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, KeyRound } from "lucide-react";
import Sidebar from "./Sidebar";
import useAuth from "@/hooks/useAuth";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 bg-[#fafafa] min-h-screen">
        {/* Top Bar */}
        <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          
          {/* Left - Role */}
          <h1 className="font-semibold text-slate-700">
            {user?.role?.replace("_", " ")}
          </h1>

          {/* Right - Profile Actions */}
          <div className="flex items-center gap-4">

            {/* Change Password */}
            <button
              onClick={() => navigate("/reset-password")}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-orange-600 transition"
            >
              <KeyRound className="w-4 h-4" />
              Change Password
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>

            {/* Avatar */}
            <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
