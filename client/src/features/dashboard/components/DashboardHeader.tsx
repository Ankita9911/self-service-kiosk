import { LayoutDashboard } from "lucide-react";
import { Shimmer } from "./Shimmer";

interface Props {
  loading: boolean;
  greeting: string;
  userName?: string;
}

export function DashboardHeader({
  loading,
  greeting,
  userName,
}: Props) {
  return (
    <div>
      {loading ? (
        <>
          <Shimmer className="h-8 w-48 mb-2" />
          <Shimmer className="h-4 w-64" />
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            <LayoutDashboard className="w-4 h-4 text-orange-500" />
            <span className="text-xs uppercase text-orange-500">
              Overview
            </span>
          </div>

          <h1 className="text-3xl font-bold">
            {greeting},{" "}
            <span className="text-orange-500">
              {userName}
            </span>
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Here's your platform overview for today.
          </p>
        </>
      )}
    </div>
  );
}