import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentVisitorSession,
  trackEvent,
  trackPageView,
} from "@/features/kiosk/telemetry";
import {
  getKioskLandingConfig,
  getKioskToken,
} from "@/shared/lib/kioskSession";

export default function KioskLandingPage() {
  const navigate = useNavigate();
  const { landingImage, landingTitle, landingSubtitle } =
    getKioskLandingConfig();

  useEffect(() => {
    if (!getKioskToken()) {
      navigate("/kiosk/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    trackPageView("landing");

    return () => {
      if (!getCurrentVisitorSession()) return;
      trackEvent({
        name: "kiosk.page_exited",
        page: "landing",
        component: "page",
        action: "exit",
      });
    };
  }, []);

  const title = landingTitle || "Discover Our Menu";
  const subtitle =
    landingSubtitle ||
    "Explore an array of fresh and flavorful options tailored to satisfy your taste buds.";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-hidden bg-linear-to-br from-[#e6f7f3] via-[#f6fcfa] to-white p-4 md:p-6 select-none cursor-pointer"
      onClick={() => {
        trackEvent({
          name: "kiosk.landing_start_tapped",
          page: "landing",
          component: "landing_screen",
          action: "tap",
          target: "start_anywhere",
        });
        navigate("/kiosk/order-type", { replace: true });
      }}
    >
      {/* Background decorative blobs */}
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

      <div className="relative z-10 w-full max-w-4xl rounded-[34px] border border-[#d7eee8] bg-white/90 px-6 py-8 md:px-10 md:py-10 text-center shadow-[0_24px_70px_rgba(14,159,137,0.14)] backdrop-blur-sm">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#cce9e2] bg-[#e9f8f4] px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-[#0e9f89] animate-pulse" />
          <span className="text-[11px] font-bold tracking-[0.08em] text-[#0e9f89] uppercase">
            Self Service Kiosk
          </span>
        </div>

        {/* Image or placeholder illustration */}
        <div className="mb-8 w-full flex items-center justify-center">
          {landingImage ? (
            <div className="w-full rounded-[26px] border border-[#e3f3ef] bg-white p-3 shadow-[0_16px_38px_rgba(15,23,42,0.1)]">
              <img
                src={landingImage}
                alt="Landing illustration"
                className="max-h-[46vh] w-full rounded-[20px] object-contain"
                draggable={false}
              />
            </div>
          ) : (
            /* SVG placeholder illustration of food/menu */
            <div className="w-full rounded-[26px] border border-[#e3f3ef] bg-white p-3 shadow-[0_16px_38px_rgba(15,23,42,0.1)]">
              <svg
                viewBox="0 0 400 320"
                className="mx-auto w-full max-w-105 max-h-[46vh]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse cx="200" cy="220" rx="150" ry="25" fill="#d9f2ec" />
                <circle
                  cx="200"
                  cy="185"
                  r="115"
                  fill="#f6fdfa"
                  stroke="#7dd6c6"
                  strokeWidth="4"
                />
                <circle cx="200" cy="185" r="90" fill="#e8f8f3" />
                <circle
                  cx="200"
                  cy="170"
                  r="45"
                  fill="#16b8a1"
                  opacity="0.85"
                />
                <circle cx="200" cy="170" r="32" fill="#75d9c8" />
                <ellipse
                  cx="182"
                  cy="210"
                  rx="22"
                  ry="14"
                  fill="#71d4a0"
                  opacity="0.9"
                />
                <ellipse
                  cx="218"
                  cy="210"
                  rx="22"
                  ry="14"
                  fill="#71d4a0"
                  opacity="0.9"
                />
                <circle
                  cx="164"
                  cy="175"
                  r="18"
                  fill="#6ed2c3"
                  opacity="0.85"
                />
                <circle
                  cx="236"
                  cy="175"
                  r="18"
                  fill="#6ed2c3"
                  opacity="0.85"
                />
                <rect
                  x="95"
                  y="130"
                  width="6"
                  height="80"
                  rx="3"
                  fill="#9aa9b8"
                />
                <rect
                  x="88"
                  y="130"
                  width="4"
                  height="30"
                  rx="2"
                  fill="#9aa9b8"
                />
                <rect
                  x="103"
                  y="130"
                  width="4"
                  height="30"
                  rx="2"
                  fill="#9aa9b8"
                />
                <rect
                  x="299"
                  y="130"
                  width="6"
                  height="80"
                  rx="3"
                  fill="#9aa9b8"
                />
                <path
                  d="M299 130 Q316 145 305 165"
                  stroke="#9aa9b8"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight mb-3">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="mx-auto text-base md:text-lg text-slate-500 leading-relaxed max-w-xl">
          {subtitle}
        </p>

        {/* Tap prompt */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-linear-to-r from-[#16b8a1] to-[#0e9f89] text-white text-sm font-bold shadow-lg shadow-[#8ddfd1] animate-pulse">
            <span>Tap anywhere to start</span>
          </div>
          <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
            Quick • Contactless • Easy
          </p>
        </div>
      </div>
    </div>
  );
}
