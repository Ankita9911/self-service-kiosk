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
      <DialogContent className="sm:max-w-4xl h-[84vh] p-0 overflow-hidden rounded-[30px] border border-[#cdebe4] shadow-[0_24px_70px_rgba(14,159,137,0.2)] bg-white">
        <div className="border-b border-[#dff1ec] bg-linear-to-r from-[#f4fbf9] via-white to-[#eef9f6] px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-800">
                Checkout
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-semibold text-sm mt-1">
                Select payment method and confirm your order
              </DialogDescription>
            </div>
            <div className="rounded-2xl border border-[#cdebe4] bg-white px-4 py-2 text-right shadow-sm">
              <p className="text-[11px] font-semibold tracking-wide uppercase text-slate-400">
                Total
              </p>
              <p className="text-2xl font-black text-[#0e9f89] leading-none">
                ₹{(totalPrice * 1.05).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="h-[calc(84vh-100px)] overflow-y-auto p-8 bg-white">
          <AnimatePresence mode="wait">
            {paymentStep === "SELECTION" ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col"
              >
                <p className="text-[11px] font-black tracking-[0.08em] text-slate-400 text-center uppercase mb-3">
                  Payment Method
                </p>
                <h3 className="text-5xl font-medium text-slate-700 text-center mb-10">
                  Where do you wish to pay?
                </h3>

                <div className="mx-auto w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <PaymentOption
                    icon={<CreditCard className="w-6 h-6" />}
                    label="Pay via Card"
                    sub="At Kiosk"
                    gradient="from-[#1fb9a4] to-[#0e9f89]"
                    square
                    onClick={() => {
                      setSelectedMethod("CARD");
                      setPaymentStep("DETAILS");
                    }}
                  />

                  <PaymentOption
                    icon={<Banknote className="w-6 h-6" />}
                    label="Pay via Cash"
                    sub="At Counter"
                    gradient="from-[#15b8a2] to-[#0a8e7c]"
                    square
                    onClick={() => {
                      setSelectedMethod("CASH");
                      setPaymentStep("DETAILS");
                    }}
                  />

                  <PaymentOption
                    icon={<Smartphone className="w-6 h-6" />}
                    label="Pay via UPI"
                    sub="Scan QR at Kiosk"
                    gradient="from-[#37c2ae] to-[#109a86]"
                    square
                    onClick={() => {
                      setSelectedMethod("UPI");
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
                className="space-y-6 max-w-3xl mx-auto"
              >
                <button
                  onClick={() => setPaymentStep("SELECTION")}
                  className="flex items-center gap-2 text-sm font-black text-[#0e9f89] hover:text-[#0b8b78] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={3} />
                  GO BACK
                </button>

                {selectedMethod === "UPI" && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 bg-linear-to-br from-[#ecfaf6] to-[#e1f5f0] rounded-3xl border-2 border-dashed border-[#9adfd2] text-center"
                  >
                    <div className="w-48 h-48 bg-white mx-auto rounded-2xl flex items-center justify-center p-4 border-2 border-[#b8e7de] shadow-xl">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=hyperkitchen@upi"
                        alt="UPI QR Code"
                        className="w-full h-full"
                      />
                    </div>
                    <div className="mt-6 space-y-2">
                      <p className="text-lg font-black text-[#0e9f89]">
                        Scan QR Code to Pay
                      </p>
                      <p className="text-sm text-[#267e72] font-semibold">
                        Open any UPI app and scan
                      </p>
                    </div>
                  </motion.div>
                )}

                {selectedMethod === "CARD" && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 bg-linear-to-br from-[#ecfaf6] to-[#e1f5f0] rounded-3xl border-2 border-[#b8e7de] text-center"
                  >
                    <CreditCard className="w-20 h-20 mx-auto text-[#0e9f89] mb-4" />
                    <p className="text-lg font-black text-[#0e9f89] mb-2">
                      Insert or Tap Your Card
                    </p>
                    <p className="text-sm text-[#267e72] font-semibold">
                      Follow the instructions on the card reader
                    </p>
                  </motion.div>
                )}

                {selectedMethod === "CASH" && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-8 bg-linear-to-br from-[#ecfaf6] to-[#e1f5f0] rounded-3xl border-2 border-[#b8e7de] text-center"
                  >
                    <Banknote className="w-20 h-20 mx-auto text-[#0e9f89] mb-4" />
                    <p className="text-lg font-black text-[#0e9f89] mb-2">
                      Pay at Counter
                    </p>
                    <p className="text-sm text-[#267e72] font-semibold">
                      Show your order number to the cashier
                    </p>
                  </motion.div>
                )}

                <Button
                  className="w-full h-15 bg-linear-to-r from-[#16b8a1] via-[#0e9f89] to-[#16b8a1] hover:from-[#0fb39a] hover:via-[#0b8b78] hover:to-[#0fb39a] text-white font-black text-xl rounded-2xl shadow-xl shadow-[#8edfd1]/40"
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
