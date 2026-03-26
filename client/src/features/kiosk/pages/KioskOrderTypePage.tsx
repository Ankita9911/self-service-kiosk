import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentVisitorSession,
  trackEvent,
  trackPageView,
} from "@/features/kiosk/telemetry";
import { getKioskToken } from "@/shared/lib/kioskSession";

export default function KioskOrderTypePage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!getKioskToken()) {
      navigate("/kiosk/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    trackPageView("order_type");

    return () => {
      if (!getCurrentVisitorSession()) return;
      trackEvent({
        name: "kiosk.page_exited",
        page: "order_type",
        component: "page",
        action: "exit",
      });
    };
  }, []);

  function selectType(type: "DINE_IN" | "TAKE_AWAY") {
    localStorage.setItem("kiosk_order_type", type);
    trackEvent({
      name: "kiosk.order_type_selected",
      page: "order_type",
      component: "order_type_selection",
      action: "select",
      target: type,
    });
    navigate("/kiosk", { replace: true });
  }

  return (
    <div className="fixed inset-0 overflow-hidden bg-linear-to-br from-[#e6f7f3] via-[#f7fcfb] to-white p-4 md:p-6 select-none">
      {/* Themed background atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-44 -left-44 h-130 w-130 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(22,184,161,0.2) 0%, rgba(22,184,161,0.08) 46%, rgba(22,184,161,0) 70%)",
          }}
        />
        <div
          className="absolute -bottom-52 -right-52 h-155 w-155 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(14,159,137,0.16) 0%, rgba(14,159,137,0.06) 50%, rgba(14,159,137,0) 72%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#0f766e 1px, transparent 1px), linear-gradient(90deg, #0f766e 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-3xl items-center justify-center">
        <div className="w-full rounded-[34px] border border-[#d7eee8] bg-white/90 px-6 py-8 md:px-10 md:py-10 text-center shadow-[0_24px_70px_rgba(14,159,137,0.14)] backdrop-blur-sm">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#cce9e2] bg-[#e9f8f4] px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-[#0e9f89] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.08em] text-[#0e9f89] uppercase">
              Choose Service Type
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight leading-tight">
            Welcome! Let's get started
          </h1>
          <p className="mt-2 text-sm md:text-base text-slate-500">
            How would you like to enjoy your meal today?
          </p>

          {/* Option cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Dine In */}
            <button
              onClick={() => selectType("DINE_IN")}
              className="w-full group flex flex-col items-center gap-3 py-7 px-5 rounded-[26px] border border-[#e2f1ed] bg-white hover:border-[#7fd7c7] hover:shadow-[0_14px_30px_rgba(14,159,137,0.18)] active:scale-[0.98] transition-all duration-150"
            >
              {/* Table icon */}
              <svg
                viewBox="0 0 48 48"
                className="w-12 h-12 text-[#0e9f89] group-hover:scale-110 transition-transform duration-150"
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
                <p className="text-lg font-bold text-slate-800 group-hover:text-[#0e9f89] transition-colors">
                  Dine In
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Relax and enjoy your meal in our comfortable seating area
                </p>
              </div>
            </button>

            {/* Take Away */}
            <button
              onClick={() => selectType("TAKE_AWAY")}
              className="w-full group flex flex-col items-center gap-3 py-7 px-5 rounded-[26px] border border-[#e2f1ed] bg-white hover:border-[#7fd7c7] hover:shadow-[0_14px_30px_rgba(14,159,137,0.18)] active:scale-[0.98] transition-all duration-150"
            >
              {/* Shopping bag icon */}
              <svg
                viewBox="0 0 48 48"
                className="w-12 h-12 text-[#0e9f89] group-hover:scale-110 transition-transform duration-150"
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
                <p className="text-lg font-bold text-slate-800 group-hover:text-[#0e9f89] transition-colors">
                  Take Away
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  On the go? We'll have your meal ready for you to take away
                </p>
              </div>
            </button>
          </div>

          {/* Back link */}
          <button
            onClick={() => {
              trackEvent({
                name: "kiosk.order_type_back_clicked",
                page: "order_type",
                component: "order_type_selection",
                action: "back",
                target: "landing",
              });
              navigate("/kiosk/landing", { replace: true });
            }}
            className="mt-7 text-sm font-semibold text-[#0e9f89] hover:text-[#0b8b78] underline underline-offset-4 transition-colors"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
