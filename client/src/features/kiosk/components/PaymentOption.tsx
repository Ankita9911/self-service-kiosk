import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

interface PaymentOptionProps {
  icon: React.ReactNode;
  label: string;
  sub: string;
  gradient: string;
  onClick: () => void;
}

export default function PaymentOption({
  icon,
  label,
  sub,
  gradient,
  onClick,
}: PaymentOptionProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center justify-between p-6 rounded-2xl border-2 border-gray-200 hover:border-orange-500 bg-white hover:bg-gradient-to-r hover:from-orange-50 hover:to-transparent transition-all shadow-lg hover:shadow-xl w-full"
    >
      <div className="flex items-center gap-4 text-left">
        <div
          className={`p-4 bg-gradient-to-br ${gradient} rounded-2xl text-white shadow-lg`}
        >
          {icon}
        </div>
        <div>
          <p className="font-black text-lg text-gray-900">{label}</p>
          <p className="text-sm font-semibold text-gray-500 mt-1">{sub}</p>
        </div>
      </div>
      <ChevronLeft
        className="w-6 h-6 text-gray-400 rotate-180"
        strokeWidth={3}
      />
    </motion.button>
  );
}
