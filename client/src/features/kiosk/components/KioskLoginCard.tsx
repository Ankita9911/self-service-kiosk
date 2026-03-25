import {
  ChefHat,
  Eye,
  EyeOff,
  Wifi,
  AlertCircle,
  ShieldCheck,
  ScanLine,
} from "lucide-react";
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
      className="relative z-10 w-full max-w-[720px] lg:max-w-[980px] xl:max-w-5xl"
    >
      <div className="overflow-hidden rounded-[34px] border border-[#d7eee8] bg-white/90 shadow-[0_24px_70px_rgba(14,159,137,0.14)] backdrop-blur-sm">
        <div className="grid gap-0 xl:grid-cols-[1.04fr_0.96fr]">
          <div className="relative overflow-hidden border-b border-[#def1eb] px-5 py-5 md:px-7 md:py-6 lg:px-8 lg:py-7 xl:border-b-0 xl:border-r xl:px-8 xl:py-10">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(145deg, rgba(22,184,161,0.12) 0%, rgba(233,248,244,0.95) 44%, rgba(255,255,255,0.94) 100%)",
              }}
            />
            <div className="relative">
              <div className="flex flex-col gap-4 md:gap-5 xl:gap-8">
                <div className="flex flex-col gap-4 md:grid md:grid-cols-[auto_1fr] md:items-center md:gap-5 xl:block">
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#cce9e2] bg-[#e9f8f4] px-4 py-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#0e9f89] animate-pulse" />
                      <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#0e9f89]">
                        Kiosk Activation
                      </span>
                    </div>

                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-linear-to-br from-[#16b8a1] to-[#0e9f89] shadow-[0_14px_28px_rgba(14,159,137,0.22)] md:h-18 md:w-18 md:rounded-[24px]">
                        <ChefHat
                          className="h-7 w-7 text-white md:h-8 md:w-8"
                          strokeWidth={1.8}
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold tracking-[0.18em] text-[#0e9f89] md:text-sm">
                          ServeX
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-[22px] border border-[#dff1ec] bg-white/85 p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:min-h-[136px] md:p-4">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e9f8f4] text-[#0e9f89]">
                      <ScanLine className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Device bound access
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 md:text-[13px]">
                      Use the device ID configured for this terminal to activate
                      the kiosk session.
                    </p>
                  </div>

                  <div className="rounded-[22px] border border-[#dff1ec] bg-white/85 p-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] md:min-h-[136px] md:p-4">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e9f8f4] text-[#0e9f89]">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Secure session
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 md:text-[13px]">
                      The secret key is only used to establish access for this
                      kiosk and its landing experience.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-6 md:px-7 md:py-7 lg:px-8 lg:py-8 xl:px-8 xl:py-10">
            <div className="mx-auto max-w-md md:max-w-none xl:max-w-md">
              <div className="mb-5 md:mb-6">
                <h2 className="text-[1.65rem] font-black tracking-tight text-slate-800 md:text-3xl">
                  Terminal Sign In
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter the kiosk credentials provided for this outlet device.
                </p>
              </div>

              <div className="space-y-4 md:space-y-5">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#0e9f89]">
                      Device ID
                    </span>
                    <input
                      value={deviceId}
                      onChange={(e) => setDeviceId(e.target.value.toUpperCase())}
                      onKeyDown={onKeyDown}
                      placeholder="Enter device ID"
                      className="h-14 w-full rounded-[20px] border border-[#dcefe9] bg-[#f7fcfb] px-4 text-[15px] font-bold tracking-[0.16em] text-slate-800 uppercase outline-none transition-all placeholder:font-semibold placeholder:tracking-[0.08em] placeholder:text-slate-400 focus:border-[#7fd7c7] focus:bg-white focus:ring-4 focus:ring-[#16b8a1]/12 md:h-15 md:px-5 md:text-base"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#0e9f89]">
                      Secret Key
                    </span>
                    <div className="relative">
                      <input
                        type={showSecret ? "text" : "password"}
                        value={secret}
                        onChange={(e) => setSecret(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Enter secret key"
                        className="h-14 w-full rounded-[20px] border border-[#dcefe9] bg-[#f7fcfb] px-4 pr-13 text-[15px] font-semibold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-[#7fd7c7] focus:bg-white focus:ring-4 focus:ring-[#16b8a1]/12 md:h-15 md:px-5 md:pr-14 md:text-base"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3.5 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full p-1.5 text-slate-400 transition-colors hover:text-[#0e9f89] md:right-4"
                        aria-label={
                          showSecret ? "Hide secret key" : "Show secret key"
                        }
                      >
                        {showSecret ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </label>
                </div>

                <div className="rounded-[22px] border border-[#dcefe9] bg-[#f8fcfb] p-4 md:flex md:items-center md:justify-between md:gap-4 xl:block">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0e9f89]">
                      Ready to activate
                    </p>
                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Sign in to unlock ordering on this tablet.
                    </p>
                  </div>

                  <motion.button
                    onClick={onLogin}
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.01 }}
                    whileTap={{ scale: loading ? 1 : 0.99 }}
                    className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-[20px] bg-linear-to-r from-[#16b8a1] via-[#0e9f89] to-[#16b8a1] text-base font-black text-white shadow-xl shadow-[#8edfd1]/45 transition-all hover:from-[#0fb39a] hover:via-[#0b8b78] hover:to-[#0fb39a] disabled:cursor-not-allowed disabled:opacity-70 md:mt-0 md:w-[220px] xl:mt-4 xl:h-16 xl:w-full xl:text-lg"
                  >
                    {loading ? (
                      "Connecting..."
                    ) : (
                      <>
                        <Wifi className="h-5 w-5" />
                        Activate Kiosk
                      </>
                    )}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-start gap-3 rounded-[22px] border border-red-100 bg-red-50 px-4 py-3"
                    >
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      <p className="text-sm font-semibold leading-5 text-red-600">
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <p className="text-center text-xs font-medium leading-5 text-slate-400 md:px-4 xl:px-0">
                  Missing credentials? Generate or verify them from the device
                  settings in the dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
