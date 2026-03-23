import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

interface PaymentOptionProps {
  icon: React.ReactNode;
  label: string;
  sub: string;
  gradient: string;
  onClick: () => void;
  square?: boolean;
}

export default function PaymentOption({
  icon,
  label,
  sub,
  gradient,
  onClick,
  square = false,
}: PaymentOptionProps) {
  if (square) {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="group relative w-full min-h-32 p-3.5 sm:p-4 rounded-2xl border border-[#d9eee8] hover:border-[#86d8c8] bg-white hover:bg-linear-to-br hover:from-[#eef9f6] hover:to-transparent transition-all shadow-sm hover:shadow-[0_10px_20px_rgba(14,159,137,0.14)] text-left flex flex-col justify-between gap-3"
      >
        <div className="flex items-start justify-between gap-2">
          <div
            className={`inline-flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 bg-linear-to-br ${gradient} rounded-xl text-white shadow-md shrink-0`}
          >
            {icon}
          </div>
          <ChevronLeft
            className="w-4 h-4 text-slate-300 rotate-180 mt-0.5 shrink-0 transition-colors group-hover:text-slate-400"
            strokeWidth={3}
          />
        </div>

        <div>
          <p className="font-black text-base sm:text-lg lg:text-xl leading-tight text-slate-800">
            {label}
          </p>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1 leading-snug">
            {sub}
          </p>
        </div>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center justify-between p-6 rounded-3xl border border-[#d9eee8] hover:border-[#86d8c8] bg-white hover:bg-linear-to-r hover:from-[#eef9f6] hover:to-transparent transition-all shadow-sm hover:shadow-[0_12px_28px_rgba(14,159,137,0.16)] w-full"
    >
      <div className="flex items-center gap-4 text-left">
        <div
          className={`p-4 bg-linear-to-br ${gradient} rounded-2xl text-white shadow-md`}
        >
          {icon}
        </div>
        <div>
          <p className="font-black text-lg text-slate-800">{label}</p>
          <p className="text-sm font-semibold text-slate-500 mt-1">{sub}</p>
        </div>
      </div>
      <ChevronLeft
        className="w-6 h-6 text-slate-300 rotate-180"
        strokeWidth={3}
      />
    </motion.button>
  );
}
