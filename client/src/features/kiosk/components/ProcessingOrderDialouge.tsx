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
      <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden border-4 border-orange-500 bg-white [&>button]:hidden">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="p-12 text-center"
        >
          <div className="w-28 h-28 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Loader2 className="w-14 h-14 text-white animate-spin" strokeWidth={3} />
          </div>

          <DialogTitle className="text-4xl font-black text-gray-900 tracking-tight mb-4">
            Confirming Order
          </DialogTitle>

          <div className="my-8 p-6 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border-4 border-orange-200">
            <p className="text-base font-semibold text-orange-800">
              Please wait while we verify stock and process your order.
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
