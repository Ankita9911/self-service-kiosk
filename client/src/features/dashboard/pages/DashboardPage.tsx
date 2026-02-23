import { useNavigate } from "react-router-dom";
import useAuth from "@/shared/hooks/useAuth";
import { ShieldCheck, Activity, TrendingUp } from "lucide-react";

import { useDashboard } from "../hooks/useDashboard";
import { DashboardHeader } from "../components/DashboardHeader";
import { StatCard } from "../components/StatCard";
import { QuickCard } from "../components/QuickCard";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    loading,
    visibleCards,
    greeting,
  } = useDashboard();

  return (
    <div className="space-y-8">

      <DashboardHeader
        loading={loading}
        greeting={greeting()}
        userName={user?.name?.split(" ")[0]}
      />

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
          value="Platform Wide"
          subValue="Full admin privileges"
          icon={<TrendingUp className="w-4 h-4 text-blue-500" />}
          accent="blue"
          loading={loading}
        />
      </div>
    <div className="flex items-center gap-2 text-2xl font-clash-semibold text-slate-800">
  Quick Access Cards
</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {visibleCards.map((card) => (
          <QuickCard
            key={card.title}
            title={card.title}
            description={card.description}
            icon={<card.icon className="w-5 h-5 text-orange-500" />}
            badge={card.badge}
            onClick={() => navigate(card.route)}
            loading={loading}
          />
        ))}
      </div>

    </div>
  );
}