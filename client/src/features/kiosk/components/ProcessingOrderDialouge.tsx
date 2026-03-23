import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/shared/components/ui/dialog";

interface ProcessingOrderDialogProps {
  open: boolean;
}

export default function ProcessingOrderDialog({
  open,
}: ProcessingOrderDialogProps) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg rounded-[30px] p-0 overflow-hidden border border-[#cdebe4] bg-white shadow-[0_24px_70px_rgba(14,159,137,0.2)] [&>button]:hidden">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="p-10 text-center"
        >
          <div className="w-24 h-24 bg-linear-to-br from-[#16b8a1] to-[#0e9f89] rounded-full flex items-center justify-center mx-auto mb-7 shadow-xl shadow-[#8edfd1]/50">
            <Loader2
              className="w-12 h-12 text-white animate-spin"
              strokeWidth={3}
            />
          </div>

          <DialogTitle className="text-3xl font-black text-slate-800 tracking-tight mb-3">
            Confirming Order
          </DialogTitle>

          <div className="my-7 p-6 bg-linear-to-br from-[#ecfaf6] to-[#e1f5f0] rounded-3xl border-2 border-[#b8e7de]">
            <p className="text-base font-semibold text-[#267e72]">
              Please wait while we verify stock and process your order.
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
