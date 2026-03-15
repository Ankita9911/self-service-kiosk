import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CreditCard, Banknote, Smartphone } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import PaymentOption from "./PaymentOption";

type PaymentStep = "SELECTION" | "DETAILS";
type PaymentMethod = "CASH" | "CARD" | "UPI" | "";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;

  paymentStep: PaymentStep;
  setPaymentStep: (v: PaymentStep) => void;

  selectedMethod: PaymentMethod;
  setSelectedMethod: (v: PaymentMethod) => void;

  totalPrice: number;
  onConfirm: () => void;
}

export default function PaymentDialog({
  open,
  onOpenChange,
  paymentStep,
  setPaymentStep,
  selectedMethod,
  setSelectedMethod,
  totalPrice,
  onConfirm,
}: PaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-3xl border-4 border-orange-500 shadow-2xl">
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-500 p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tight mb-2">
              Checkout
            </DialogTitle>
            <DialogDescription className="text-orange-100 font-bold text-base">
              Total Amount:
              <span className="text-white text-2xl ml-2 font-black">
                ₹{(totalPrice * 1.05).toFixed(2)}
              </span>
            </DialogDescription>
          </div>
        </div>

        <div className="p-8 bg-white">
          <AnimatePresence mode="wait">
            {paymentStep === "SELECTION" ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <p className="text-sm font-black text-gray-500 text-center mb-6">
                  SELECT PAYMENT METHOD
                </p>

                <div className="grid grid-cols-1 gap-4">
                  <PaymentOption
                    icon={<CreditCard className="w-6 h-6" />}
                    label="Card Payment"
                    sub="Visa, Mastercard, RuPay"
                    gradient="from-blue-500 to-blue-600"
                    onClick={() => {
                      setSelectedMethod("CARD");
                      setPaymentStep("DETAILS");
                    }}
                  />

                  <PaymentOption
                    icon={<Smartphone className="w-6 h-6" />}
                    label="UPI / QR Scan"
                    sub="GPay, PhonePe, Paytm"
                    gradient="from-purple-500 to-purple-600"
                    onClick={() => {
                      setSelectedMethod("UPI");
                      setPaymentStep("DETAILS");
                    }}
                  />

                  <PaymentOption
                    icon={<Banknote className="w-6 h-6" />}
                    label="Cash at Counter"
                    sub="Pay on Collection"
                    gradient="from-green-500 to-green-600"
                    onClick={() => {
                      setSelectedMethod("CASH");
                      setPaymentStep("DETAILS");
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <button
                  onClick={() => setPaymentStep("SELECTION")}
                  className="flex items-center gap-2 text-sm font-black text-orange-600 hover:text-orange-700 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={3} />
                  GO BACK
                </button>

                {selectedMethod === "UPI" && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl border-4 border-dashed border-purple-300 text-center"
                  >
                    <div className="w-48 h-48 bg-white mx-auto rounded-2xl flex items-center justify-center p-4 border-4 border-purple-200 shadow-xl">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=hyperkitchen@upi"
                        alt="UPI QR Code"
                        className="w-full h-full"
                      />
                    </div>
                    <div className="mt-6 space-y-2">
                      <p className="text-lg font-black text-purple-900">
                        Scan QR Code to Pay
                      </p>
                      <p className="text-sm text-purple-700 font-semibold">
                        Open any UPI app and scan
                      </p>
                    </div>
                  </motion.div>
                )}

                {selectedMethod === "CARD" && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl border-4 border-blue-200 text-center"
                  >
                    <CreditCard className="w-20 h-20 mx-auto text-blue-600 mb-4" />
                    <p className="text-lg font-black text-blue-900 mb-2">
                      Insert or Tap Your Card
                    </p>
                    <p className="text-sm text-blue-700 font-semibold">
                      Follow the instructions on the card reader
                    </p>
                  </motion.div>
                )}

                {selectedMethod === "CASH" && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-3xl border-4 border-green-200 text-center"
                  >
                    <Banknote className="w-20 h-20 mx-auto text-green-600 mb-4" />
                    <p className="text-lg font-black text-green-900 mb-2">
                      Pay at Counter
                    </p>
                    <p className="text-sm text-green-700 font-semibold">
                      Show your order number to the cashier
                    </p>
                  </motion.div>
                )}

                <Button
                  className="w-full h-16 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 text-white font-black text-xl rounded-2xl shadow-xl"
                  onClick={onConfirm}
                >
                  Confirm Order
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
