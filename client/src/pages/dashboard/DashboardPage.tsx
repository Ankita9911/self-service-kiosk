import { useNavigate } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const cards = [
    {
      title: "Franchises",
      description: "Manage all franchises",
      roles: ["SUPER_ADMIN"],
      route: "/super-admin/franchises",
    },
    {
      title: "Outlets",
      description: "Manage operational outlets",
      roles: ["SUPER_ADMIN", "FRANCHISE_ADMIN"],
      route: "/outlets",
    },
  ];

  const visibleCards = cards.filter((card) =>
    card.roles.includes(user?.role || "")
  );

  return (
    <div className="w-full min-h-screen bg-orange-50/40">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">

        {/* ===== Header Section ===== */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-orange-600">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.name}
          </p>
        </div>

        {/* ===== Stats Section ===== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-orange-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                Your Role
              </p>
              <p className="text-xl font-semibold text-orange-600">
                {user?.role}
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                System Status
              </p>
              <p className="text-xl font-semibold text-green-600">
                Operational
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-white shadow-sm">
            <CardContent className="p-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                Access Level
              </p>
              <p className="text-xl font-semibold text-orange-600">
                Authorized
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ===== Action Cards ===== */}
        <div>
          <h2 className="text-lg font-semibold mb-6 text-orange-600">
            Quick Access
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {visibleCards.map((card) => (
              <Card
                key={card.title}
                onClick={() => navigate(card.route)}
                className="cursor-pointer border-orange-200 bg-white shadow-sm hover:shadow-md hover:border-orange-400 transition-all duration-200"
              >
                <CardContent className="p-6 space-y-2">
                  <h3 className="text-lg font-semibold text-orange-600">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
