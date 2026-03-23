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
        className="relative w-full aspect-square p-5 rounded-3xl border border-[#d9eee8] hover:border-[#86d8c8] bg-white hover:bg-linear-to-br hover:from-[#eef9f6] hover:to-transparent transition-all shadow-sm hover:shadow-[0_12px_28px_rgba(14,159,137,0.16)] text-left"
      >
        <div
          className={`inline-flex items-center justify-center h-14 w-14 bg-linear-to-br ${gradient} rounded-2xl text-white shadow-md`}
        >
          {icon}
        </div>

        <div className="absolute left-5 right-5 bottom-5">
          <p className="font-black text-[28px] leading-tight text-slate-800">
            {label}
          </p>
          <p className="text-base font-semibold text-slate-500 mt-1">{sub}</p>
        </div>

        <ChevronLeft
          className="absolute top-5 right-5 w-7 h-7 text-slate-300 rotate-180"
          strokeWidth={3}
        />
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
