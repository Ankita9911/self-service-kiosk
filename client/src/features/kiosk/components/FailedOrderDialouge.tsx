import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface FailedOrderDialogProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export default function FailedOrderDialog({
  open,
  message,
  onClose,
}: FailedOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-[30px] p-0 overflow-hidden border border-[#f0d1d6] bg-white shadow-[0_24px_70px_rgba(185,28,28,0.16)]">
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
            className="w-24 h-24 bg-linear-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-7 shadow-xl shadow-red-300/60"
          >
            <AlertTriangle className="w-14 h-14 text-white" strokeWidth={3} />
          </motion.div>

          <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight mb-3">
            Order Failed
          </DialogTitle>

          <div className="my-7 p-6 bg-linear-to-br from-red-50 to-rose-50 rounded-3xl border-2 border-red-200">
            <p className="text-sm font-black text-red-600 mb-2">
              WE COULD NOT PLACE YOUR ORDER
            </p>
            <p className="text-base font-semibold text-red-800">
              {message || "Due to stock changes/availability issues"}
            </p>
          </div>

          <p className="text-slate-500 font-semibold mb-7">
            Please review your cart and try again.
          </p>

          <Button
            onClick={onClose}
            className="w-full h-14 bg-linear-to-r from-[#16b8a1] via-[#0e9f89] to-[#16b8a1] hover:from-[#0fb39a] hover:via-[#0b8b78] hover:to-[#0fb39a] text-white font-black text-lg rounded-2xl shadow-xl shadow-[#8edfd1]/40"
          >
            Okay
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
