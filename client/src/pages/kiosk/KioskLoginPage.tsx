import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { kioskLogin } from "@/services/device.service";
import { ChefHat, Eye, EyeOff, Wifi, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function KioskLoginPage() {
  const navigate = useNavigate();
  const [deviceId, setDeviceId] = useState("");
  const [secret, setSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!deviceId.trim() || !secret.trim()) {
      setError("Please enter both Device ID and Secret Key.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { token } = await kioskLogin(deviceId.trim().toUpperCase(), secret.trim());
      localStorage.setItem("kiosk_token", token);
      navigate("/kiosk", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Invalid Device ID or Secret Key.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 60% 10%, #fff7ed 0%, #ffedd5 40%, #fed7aa 100%)",
      }}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(circle, #f97316 0%, #ea580c 50%, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-48 -left-48 w-[700px] h-[700px] rounded-full opacity-15"
          style={{
            background:
              "radial-gradient(circle, #fb923c 0%, #f97316 50%, transparent 70%)",
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md mx-4"
      >
        {/* Card */}
        <div
          className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
          style={{ boxShadow: "0 32px 80px -12px rgba(249,115,22,0.25), 0 8px 32px -8px rgba(0,0,0,0.1)" }}
        >
          {/* Header */}
          <div
            className="px-10 pt-10 pb-8 text-center"
            style={{
              background:
                "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)",
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-5 shadow-lg"
            >
              <ChefHat className="w-10 h-10 text-white" strokeWidth={1.5} />
            </motion.div>
            <h1
              className="text-3xl font-black text-white leading-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Hyper Kitchen
            </h1>
            <p
              className="text-orange-100 text-sm font-semibold mt-2 tracking-wider uppercase"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Kiosk Terminal
            </p>
          </div>

          {/* Form */}
          <div className="px-10 py-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p
                className="text-xs font-semibold text-gray-400 tracking-widest uppercase"
                style={{ fontFamily: "var(--font-body)" }}
              >
                Device Authentication Required
              </p>
            </div>

            <div className="space-y-4">
              {/* Device ID */}
              <div>
                <label
                  className="block text-xs font-bold text-gray-500 mb-2 tracking-wider uppercase"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Device ID
                </label>
                <input
                  type="text"
                  value={deviceId}
                  onChange={(e) =>
                    setDeviceId(e.target.value.toUpperCase())
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. K7MN9Q"
                  maxLength={10}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 bg-gray-50 text-gray-900 font-black text-xl tracking-[0.25em] placeholder:text-gray-300 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                  style={{ fontFamily: "var(--font-display)" }}
                />
              </div>

              {/* Secret Key */}
              <div>
                <label
                  className="block text-xs font-bold text-gray-500 mb-2 tracking-wider uppercase"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter secret key"
                    autoComplete="off"
                    className="w-full h-14 px-5 pr-14 rounded-2xl border-2 border-gray-100 bg-gray-50 text-gray-900 font-mono text-base placeholder:font-sans placeholder:text-gray-300 focus:outline-none focus:border-orange-400 focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showSecret ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  className="mt-4 flex items-center gap-3 bg-red-50 border-2 border-red-100 rounded-2xl px-4 py-3"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p
                    className="text-sm font-semibold text-red-600"
                    style={{ fontFamily: "var(--font-body)" }}
                  >
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              onClick={handleLogin}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="mt-6 w-full h-16 rounded-2xl font-black text-xl text-white shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden"
              style={{
                background: loading
                  ? "#fdba74"
                  : "linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%)",
                fontFamily: "var(--font-display)",
                boxShadow: loading
                  ? "none"
                  : "0 8px 24px -4px rgba(249,115,22,0.5)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-[3px] border-white/40 border-t-white rounded-full animate-spin" />
                  Connecting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Wifi className="w-5 h-5" />
                  Activate Kiosk
                </span>
              )}
            </motion.button>

            <p
              className="text-center text-xs text-gray-400 mt-5 leading-relaxed"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Contact your outlet manager if you don't have your Device ID or Secret Key.
            </p>
          </div>
        </div>

        {/* Bottom label */}
        <p className="text-center text-xs text-orange-400/60 font-semibold mt-5 tracking-widest uppercase">
          © {new Date().getFullYear()} Hyper Kitchen — Management Suite
        </p>
      </motion.div>
    </div>
  );
}