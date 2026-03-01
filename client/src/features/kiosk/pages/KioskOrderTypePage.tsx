import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function getKioskToken(): string | null {
  const token = localStorage.getItem("kiosk_token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "KIOSK_DEVICE") return null;
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return token;
  } catch {
    return null;
  }
}

export default function KioskOrderTypePage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!getKioskToken()) {
      navigate("/kiosk/login", { replace: true });
    }
  }, [navigate]);

  function selectType(type: "DINE_IN" | "TAKE_AWAY") {
    localStorage.setItem("kiosk_order_type", type);
    navigate("/kiosk", { replace: true });
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center px-8 select-none">
      {/* Subtle background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-125 h-125 rounded-full bg-orange-50 opacity-60" />
        <div className="absolute -bottom-48 -right-48 w-150 h-150 rounded-full bg-amber-50 opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        {/* Heading */}
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-tight">
          Welcome! Let's get started
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          How would you like to enjoy your meal today?
        </p>

        {/* Option cards */}
        <div className="mt-10 w-full space-y-4">
          {/* Dine In */}
          <button
            onClick={() => selectType("DINE_IN")}
            className="w-full group flex flex-col items-center gap-3 py-8 px-6 rounded-2xl border-2 border-slate-100 bg-white hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100 active:scale-[0.98] transition-all duration-150"
          >
            {/* Table icon */}
            <svg
              viewBox="0 0 48 48"
              className="w-12 h-12 text-orange-500 group-hover:scale-110 transition-transform duration-150"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Table top surface */}
              <rect x="6" y="14" width="36" height="6" rx="2" />
              {/* Left leg */}
              <line x1="13" y1="20" x2="11" y2="38" />
              {/* Right leg */}
              <line x1="35" y1="20" x2="37" y2="38" />
              {/* Cross bar */}
              <line x1="12" y1="30" x2="36" y2="30" />
            </svg>
            <div>
              <p className="text-lg font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                Dine In
              </p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Relax and enjoy your meal in our comfortable seating area
              </p>
            </div>
          </button>

          {/* Take Away */}
          <button
            onClick={() => selectType("TAKE_AWAY")}
            className="w-full group flex flex-col items-center gap-3 py-8 px-6 rounded-2xl border-2 border-slate-100 bg-white hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100 active:scale-[0.98] transition-all duration-150"
          >
            {/* Shopping bag icon */}
            <svg
              viewBox="0 0 48 48"
              className="w-12 h-12 text-orange-500 group-hover:scale-110 transition-transform duration-150"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Bag body */}
              <path d="M10 18h28l-3 22H13L10 18z" />
              {/* Handle left */}
              <path d="M17 18c0-3.866 3.134-7 7-7s7 3.134 7 7" />
              {/* Latch */}
              <path d="M20 26c0 2.209 1.791 4 4 4s4-1.791 4-4" />
            </svg>
            <div>
              <p className="text-lg font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                Take Away
              </p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                On the go? We'll have your meal ready for you to take away
              </p>
            </div>
          </button>
        </div>

        {/* Back link */}
        <button
          onClick={() => navigate("/kiosk/landing", { replace: true })}
          className="mt-8 text-sm font-semibold text-orange-500 hover:text-orange-600 underline underline-offset-4 transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
