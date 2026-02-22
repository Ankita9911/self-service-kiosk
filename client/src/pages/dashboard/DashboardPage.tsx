import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { usePermission } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";

import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard,
  Store,
  Users,
  ShieldCheck,
  Activity,
  ChevronRight,
  TrendingUp,
  Clock,
} from "lucide-react";

/* ─── Shimmer skeleton ─── */
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-100 rounded-lg ${className}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 to-transparent" />
    </div>
  );
}

/* ─── Stat card ─── */
function StatCard({
  label,
  value,
  subValue,
  icon,
  accent = "orange",
  loading = false,
}: {
  label: string;
  value: string;
  subValue?: string;
  icon: React.ReactNode;
  accent?: "orange" | "emerald" | "blue";
  loading?: boolean;
}) {
  const accentMap = {
    orange: {
      ring: "ring-orange-100",
      bg: "bg-orange-50",
      text: "text-orange-600",
      dot: "bg-orange-400",
    },
    emerald: {
      ring: "ring-emerald-100",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      dot: "bg-emerald-400",
    },
    blue: {
      ring: "ring-blue-100",
      bg: "bg-blue-50",
      text: "text-blue-600",
      dot: "bg-blue-400",
    },
  };
  const a = accentMap[accent];

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex justify-between">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-8 w-8 rounded-xl" />
        </div>
        <Shimmer className="h-7 w-32" />
        <Shimmer className="h-3 w-20" />
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-300 ring-1 ${a.ring}`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-clash-semibold uppercase tracking-widest text-slate-400">
          {label}
        </span>
        <div className={`h-9 w-9 rounded-xl ${a.bg} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className={`text-2xl font-clash-bold ${a.text} tracking-tight`}>
        {value}
      </p>
      {subValue && (
        <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${a.dot}`} />
          {subValue}
        </p>
      )}
    </div>
  );
}

/* ─── Quick access card ─── */
function QuickCard({
  title,
  description,
  icon,
  badge,
  onClick,
  loading,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  onClick: () => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 space-y-4">
        <div className="flex justify-between">
          <Shimmer className="h-12 w-12 rounded-xl" />
          <Shimmer className="h-5 w-5 rounded" />
        </div>
        <Shimmer className="h-5 w-32 mt-4" />
        <Shimmer className="h-3 w-full" />
        <Shimmer className="h-3 w-3/4" />
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group text-left w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-7 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-300 relative overflow-hidden"
    >
      {/* Decorative orb */}
      <div className="absolute -bottom-6 -right-6 w-28 h-28 bg-orange-50 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-500" />

      <div className="flex justify-between items-start mb-6 relative">
        <div className="h-12 w-12 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors duration-200">
          {icon}
        </div>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="text-[10px] font-clash-medium bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {badge}
            </span>
          )}
          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all duration-200" />
        </div>
      </div>

      <h3 className="text-base font-clash-semibold text-slate-800 group-hover:text-orange-700 transition-colors mb-2 relative">
        {title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed relative">
        {description}
      </p>
    </button>
  );
}

/* ─── Main ─── */
export default function DashboardPage() {
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Simulate initial load shimmer
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const cards = [
    {
      title: "Franchises",
      description:
        "Manage and monitor all registered franchise partners across the network.",
      permission: PERMISSIONS.FRANCHISE_VIEW,
      route: "/super-admin/franchises",
      icon: <Users className="w-5 h-5 text-orange-500" />,
      badge: "Partners",
    },
    {
      title: "Outlets",
      description:
        "Oversee operational kiosk outlets, locations, and performance metrics.",
      permission: PERMISSIONS.OUTLET_VIEW,
      route: "/outlets",
      icon: <Store className="w-5 h-5 text-orange-500" />,
      badge: "Locations",
    },
    {
      title: "Devices",
      description:
        "Monitor and manage kiosk hardware and software status across all outlets.",
      permission: PERMISSIONS.DEVICE_VIEW,
      route: "/devices",
      icon: <Activity className="w-5 h-5 text-orange-500" />,
      badge: "Hardware",
    },
  ];

  const visibleCards = cards.filter((c) => hasPermission(c.permission));

  const greeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-8">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-clash-semibold text-orange-500 uppercase tracking-widest">
              Overview
            </span>
          </div>
          {loading ? (
            <>
              <Shimmer className="h-8 w-48 mb-2" />
              <Shimmer className="h-4 w-64" />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-clash-bold text-slate-900 tracking-tight">
                {greeting()},{" "}
                <span className="text-orange-500">{user?.name?.split(" ")[0]}</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Here's your platform overview for today.
              </p>
            </>
          )}
        </div>

       {/* Live clock */}
        {/* <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm self-start sm:self-auto">
          <Clock className="w-4 h-4 text-orange-400" />
          <div>
            <p className="text-xs text-slate-400 leading-none">Current Time</p>
            <p className="text-sm font-mono font-bold text-slate-700 mt-0.5">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </div> 
        </div> */}
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          label="Your Role"
          value={user?.role?.replace(/_/g, " ") || "N/A"}
          subValue="Active session"
          icon={<ShieldCheck className="w-4 h-4 text-orange-500" />}
          accent="orange"
          loading={loading}
        />
        <StatCard
          label="System Status"
          value="Operational"
          subValue="All services online"
          icon={<Activity className="w-4 h-4 text-emerald-500" />}
          accent="emerald"
          loading={loading}
        />
        <StatCard
          label="Access Scope"
          value={
            hasPermission(PERMISSIONS.FRANCHISE_VIEW)
              ? "Platform Wide"
              : "Outlet Level"
          }
          subValue={
            hasPermission(PERMISSIONS.FRANCHISE_VIEW)
              ? "Full admin privileges"
              : "Limited access"
          }
          icon={<TrendingUp className="w-4 h-4 text-blue-500" />}
          accent="blue"
          loading={loading}
        />
      </div>

      {/* ── Quick access ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-base font-clash-bold text-slate-800">Quick Access</h2>
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">
            {visibleCards.length} module{visibleCards.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2].map((i) => (
              <QuickCard
                key={i}
                title=""
                description=""
                icon={null}
                onClick={() => {}}
                loading
              />
            ))}
          </div>
        ) : visibleCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visibleCards.map((card) => (
              <QuickCard
                key={card.title}
                title={card.title}
                description={card.description}
                icon={card.icon}
                badge={card.badge}
                onClick={() => navigate(card.route)}
                loading={false}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
            <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">
              No management modules available
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Contact your administrator for access.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}