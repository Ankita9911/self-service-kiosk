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
      <DialogContent className="sm:max-w-lg rounded-3xl p-0 overflow-hidden border-4 border-red-500 bg-white">
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
            className="w-28 h-28 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
          >
            <AlertTriangle className="w-16 h-16 text-white" strokeWidth={3} />
          </motion.div>

          <DialogTitle className="text-4xl font-black text-gray-900 tracking-tight mb-4">
            Order Failed
          </DialogTitle>

          <div className="my-8 p-6 bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl border-4 border-red-200">
            <p className="text-sm font-black text-red-600 mb-2">
              WE COULD NOT PLACE YOUR ORDER
            </p>
            <p className="text-base font-semibold text-red-800">
              Due to stock changes/availability issues
            </p>
          </div>

          <p className="text-gray-600 font-semibold mb-8">
            Please review your cart and try again.
          </p>

          <Button
            onClick={onClose}
            className="w-full h-16 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-black text-lg rounded-2xl shadow-xl"
          >
            Okay
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
