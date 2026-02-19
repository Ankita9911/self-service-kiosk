import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  ShieldCheck, 
  Activity, 
  ChevronRight 
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      title: "Franchises",
      description: "Manage and monitor all registered franchise partners.",
      roles: ["SUPER_ADMIN"],
      route: "/super-admin/franchises",
      icon: <Users className="w-6 h-6 text-orange-500" />,
    },
    {
      title: "Outlets",
      description: "Oversee operational kiosk outlets and performance.",
      roles: ["SUPER_ADMIN", "FRANCHISE_ADMIN"],
      route: "/outlets",
      icon: <Store className="w-6 h-6 text-orange-500" />,
    },
  ];

  const visibleCards = cards.filter((card) =>
    card.roles.includes(user?.role || "")
  );

  return (
    <div className="w-full min-h-screen bg-[#fafafa] text-slate-900">
      {/* Top Decorative Bar */}
      <div className="h-1.5 w-full bg-linear-to-r from-orange-400 to-orange-600" />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        
        {/* ===== Header Section ===== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <LayoutDashboard className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium uppercase tracking-wider text-orange-600/80">
                Administration
              </span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="text-slate-500 mt-1">
              Welcome back, <span className="font-semibold text-slate-700">{user?.name}</span>. Here is your system overview.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
             <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold">
                {user?.name?.charAt(0) || 'A'}
             </div>
             <div className="pr-4">
                <p className="text-xs text-slate-500 leading-none">Logged in as</p>
                <p className="text-sm font-medium">{user?.role?.replace('_', ' ')}</p>
             </div>
          </div>
        </div>

        {/* ===== Stats Section ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Your Role" 
            value={user?.role?.replace('_', ' ') || "N/A"} 
            icon={<ShieldCheck className="w-5 h-5 text-orange-500" />} 
          />
          <StatCard 
            label="System Status" 
            value="Operational" 
            subValue="All services online"
            statusColor="text-emerald-600"
            icon={<Activity className="w-5 h-5 text-emerald-500" />} 
          />
          <StatCard 
            label="Access Level" 
            value="Full Access" 
            subValue="Verified Session"
            icon={<ShieldCheck className="w-5 h-5 text-orange-500" />} 
          />
        </div>

        {/* ===== Action Cards ===== */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-800">Quick Access</h2>
            <div className="h-px flex-1 bg-slate-200 ml-4"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {visibleCards.length > 0 ? (
              visibleCards.map((card) => (
                <Card
                  key={card.title}
                  onClick={() => navigate(card.route)}
                  className="group cursor-pointer border-slate-200 bg-white hover:bg-orange-50/30 hover:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden"
                >
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start">
                      <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        {card.icon}
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transform group-hover:translate-x-1 transition-all" />
                    </div>
                    
                    <div className="mt-6 space-y-2">
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-orange-700 transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-slate-500 leading-relaxed">
                        {card.description}
                      </p>
                    </div>

                    {/* Subtle decorative background element */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                <p className="text-slate-500">No management options available for your role.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Component for Stats to keep code clean
function StatCard({ label, value, subValue, icon, statusColor = "text-orange-600" }: any) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-500 uppercase tracking-tight">{label}</p>
          {icon}
        </div>
        <div>
          <p className={`text-2xl font-bold ${statusColor}`}>
            {value}
          </p>
          {subValue && <p className="text-xs text-slate-400 mt-1">{subValue}</p>}
        </div>
      </CardContent>
    </Card>
  );
}