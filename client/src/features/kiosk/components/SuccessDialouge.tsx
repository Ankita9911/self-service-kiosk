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
      <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden border-4 border-green-500 bg-white">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", duration: 0.6 }}
            className="w-28 h-28 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
          >
            <CheckCircle2 className="w-16 h-16 text-white" strokeWidth={3} />
          </motion.div>

          <DialogTitle className="text-4xl font-black text-gray-900 tracking-tight mb-4">
            Order Confirmed!
          </DialogTitle>

          <div className="my-8 p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border-4 border-orange-200">
            <p className="text-sm font-black text-orange-600 mb-3">
              YOUR ORDER NUMBER
            </p>

            <motion.div
              className="text-6xl font-black bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              #{orderNumber}
            </motion.div>
          </div>

          <p className="text-gray-600 font-semibold mb-8">
            Please collect your order from the counter
          </p>

          <Button
            onClick={onClose}
            className="w-full h-16 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-black text-lg rounded-2xl shadow-xl"
          >
            Start New Order
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
