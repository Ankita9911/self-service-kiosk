import { ChefHat, Eye, EyeOff, Wifi, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  deviceId: string;
  setDeviceId: (v: string) => void;
  secret: string;
  setSecret: (v: string) => void;
  showSecret: boolean;
  setShowSecret: (v: boolean) => void;
  loading: boolean;
  error: string | null;
  onLogin: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

export default function KioskLoginCard({
  deviceId,
  setDeviceId,
  secret,
  setSecret,
  showSecret,
  setShowSecret,
  loading,
  error,
  onLogin,
  onKeyDown,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-md mx-4"
    >
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div
          className="px-10 pt-10 pb-8 text-center"
          style={{
            background:
              "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)",
          }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm mb-5 shadow-lg">
            <ChefHat className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>

          <h1 className="text-3xl font-black text-white">
            Hyper Kitchen
          </h1>
          <p className="text-orange-100 text-sm font-semibold mt-2 tracking-wider uppercase">
            Kiosk Terminal
          </p>
        </div>

        {/* FORM */}
        <div className="px-10 py-8 space-y-4">

          {/* DEVICE ID */}
          <input
            value={deviceId}
            onChange={(e) => setDeviceId(e.target.value.toUpperCase())}
            onKeyDown={onKeyDown}
            placeholder="DEVICE ID"
            className="w-full h-14 px-5 rounded-2xl border-2 border-gray-100 bg-gray-50 font-black text-xl tracking-[0.25em] focus:border-orange-400 focus:bg-white transition-all"
          />

          {/* SECRET */}
          <div className="relative">
            <input
              type={showSecret ? "text" : "password"}
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Secret Key"
              className="w-full h-14 px-5 pr-14 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:border-orange-400 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showSecret ? <EyeOff /> : <Eye />}
            </button>
          </div>

          {/* ERROR */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 bg-red-50 border-2 border-red-100 rounded-2xl px-4 py-3"
              >
                <AlertCircle className="w-4 h-4 text-red-500" />
                <p className="text-sm font-semibold text-red-600">
                  {error}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUBMIT */}
          <motion.button
            onClick={onLogin}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full h-16 rounded-2xl font-black text-xl text-white shadow-xl"
            style={{
              background: loading
                ? "#fdba74"
                : "linear-gradient(135deg, #f97316 0%, #ea580c 60%, #c2410c 100%)",
            }}
          >
            {loading ? "Connecting..." : (
              <span className="flex items-center justify-center gap-2">
                <Wifi className="w-5 h-5" />
                Activate Kiosk
              </span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}