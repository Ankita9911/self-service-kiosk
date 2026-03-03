import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getKioskLandingConfig, getKioskToken } from "@/shared/lib/kioskSession";

export default function KioskLandingPage() {
  const navigate = useNavigate();
  const { landingImage, landingTitle, landingSubtitle } = getKioskLandingConfig();

  useEffect(() => {
    if (!getKioskToken()) {
      navigate("/kiosk/login", { replace: true });
    }
  }, [navigate]);

  const title = landingTitle || "Discover Our Menu";
  const subtitle =
    landingSubtitle ||
    "Explore an array of fresh and flavorful options tailored to satisfy your taste buds.";

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center bg-white select-none cursor-pointer"
      onClick={() => navigate("/kiosk/order-type", { replace: true })}
    >
      {/* Background decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-125 h-125 rounded-full bg-orange-50 opacity-70" />
        <div className="absolute -bottom-40 -right-40 w-150 h-150 rounded-full bg-amber-50 opacity-60" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-8 max-w-2xl w-full">
        {/* Image or placeholder illustration */}
        <div className="mb-10 w-full flex items-center justify-center">
          {landingImage ? (
            <img
              src={landingImage}
              alt="Landing illustration"
              className="max-h-[55vh] max-w-full object-contain drop-shadow-2xl"
              draggable={false}
            />
          ) : (
            /* SVG placeholder illustration of food/menu */
            <svg
              viewBox="0 0 400 320"
              className="w-full max-w-105 max-h-[55vh]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Plate */}
              <ellipse cx="200" cy="220" rx="150" ry="25" fill="#F3E8D8" />
              <circle cx="200" cy="185" r="115" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="4" />
              <circle cx="200" cy="185" r="90" fill="#FEF3C7" />
              {/* Food items */}
              <circle cx="200" cy="170" r="45" fill="#FB923C" opacity="0.85" />
              <circle cx="200" cy="170" r="32" fill="#FDBA74" />
              <ellipse cx="182" cy="210" rx="22" ry="14" fill="#86EFAC" opacity="0.9" />
              <ellipse cx="218" cy="210" rx="22" ry="14" fill="#86EFAC" opacity="0.9" />
              <circle cx="164" cy="175" r="18" fill="#FCA5A5" opacity="0.85" />
              <circle cx="236" cy="175" r="18" fill="#FCA5A5" opacity="0.85" />
              {/* Fork */}
              <rect x="95" y="130" width="6" height="80" rx="3" fill="#D1D5DB" />
              <rect x="88" y="130" width="4" height="30" rx="2" fill="#D1D5DB" />
              <rect x="103" y="130" width="4" height="30" rx="2" fill="#D1D5DB" />
              {/* Knife */}
              <rect x="299" y="130" width="6" height="80" rx="3" fill="#D1D5DB" />
              <path d="M299 130 Q316 145 305 165" stroke="#D1D5DB" strokeWidth="3" fill="none" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight leading-tight mb-4">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-slate-500 leading-relaxed max-w-md">
          {subtitle}
        </p>

        {/* Tap prompt */}
        <div className="mt-12 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-orange-500 text-white text-sm font-semibold shadow-lg shadow-orange-200 animate-pulse">
            <span>Tap anywhere to start</span>
          </div>
        </div>
      </div>
    </div>
  );
}
