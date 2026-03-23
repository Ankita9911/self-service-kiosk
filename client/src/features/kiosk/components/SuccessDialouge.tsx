import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface SuccessDialogProps {
  open: boolean;
  orderNumber: string;
  onClose: () => void;
}

export default function SuccessDialog({
  open,
  orderNumber,
  onClose,
}: SuccessDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-[30px] p-0 overflow-hidden border border-[#cdebe4] bg-white shadow-[0_24px_70px_rgba(14,159,137,0.2)]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="p-10 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
            className="w-24 h-24 bg-linear-to-br from-[#16b8a1] to-[#0e9f89] rounded-full flex items-center justify-center mx-auto mb-7 shadow-xl shadow-[#8edfd1]/50"
          >
            <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={3} />
          </motion.div>

          <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight mb-3">
            Order Confirmed!
          </DialogTitle>

          <div className="my-7 p-7 bg-linear-to-br from-[#ecfaf6] to-[#e1f5f0] rounded-3xl border-2 border-[#b8e7de]">
            <p className="text-sm font-black text-[#0e9f89] mb-3">
              YOUR ORDER NUMBER
            </p>

            <motion.div
              className="text-6xl font-black bg-linear-to-r from-[#0e9f89] to-[#16b8a1] bg-clip-text text-transparent tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              #{orderNumber}
            </motion.div>
          </div>

          <p className="text-slate-500 font-semibold mb-7">
            Please collect your order from the counter
          </p>

          <Button
            onClick={onClose}
            className="w-full h-14 bg-linear-to-r from-[#16b8a1] via-[#0e9f89] to-[#16b8a1] hover:from-[#0fb39a] hover:via-[#0b8b78] hover:to-[#0fb39a] text-white font-black text-lg rounded-2xl shadow-xl shadow-[#8edfd1]/40"
          >
            Start New Order
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
