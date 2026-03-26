import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  CreditCard,
  Banknote,
  BadgeIndianRupee,
  QrCode,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { trackCheckout, trackEvent } from "@/features/kiosk/telemetry";
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
  const payableTotal = totalPrice * 1.05;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && open) {
      trackCheckout({
        action: "close",
        payload: {
          paymentStep,
          selectedMethod: selectedMethod || null,
          reason: "dismiss",
        },
      });
    }

    onOpenChange(nextOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100%-1.25rem)] sm:w-full sm:max-w-3xl h-fit max-h-[78vh] p-0 overflow-y-auto rounded-3xl! sm:rounded-[28px]! border border-[#cdebe4] shadow-[0_18px_50px_rgba(14,159,137,0.18)] bg-white">
        <div className="border-b border-[#dff1ec] bg-linear-to-r from-[#f4fbf9] via-white to-[#eef9f6] px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg sm:text-xl font-black tracking-tight text-slate-800">
                Checkout
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-semibold text-xs sm:text-sm mt-1">
                Select payment method and confirm your order
              </DialogDescription>
            </div>
            <div className="rounded-xl border border-[#cdebe4] bg-white px-2.5 sm:px-3 py-1.5 text-right shadow-sm">
              <p className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase text-slate-400">
                Total
              </p>
              <p className="text-lg sm:text-xl font-black text-[#0e9f89] leading-none">
                ₹{payableTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-5 lg:px-6 py-4 sm:py-5 bg-white">
          <AnimatePresence mode="wait">
            {paymentStep === "SELECTION" ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex flex-col"
              >
                <p className="text-[10px] sm:text-[11px] font-black tracking-[0.08em] text-slate-400 text-center uppercase mb-2 sm:mb-3">
                  Payment Method
                </p>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-700 text-center mb-4 sm:mb-5 lg:mb-6 leading-tight">
                  Where do you wish to pay?
                </h3>

                <div className="mx-auto w-full max-w-3xl flex flex-col gap-2.5 sm:gap-3">
                  <div className="mx-auto w-full max-w-[320px]">
                    <PaymentOption
                      icon={<CreditCard className="w-6 h-6" />}
                      label="Pay via Card"
                      sub="At Kiosk"
                      gradient="from-[#1fb9a4] to-[#0e9f89]"
                      square
                      onClick={() => {
                        trackCheckout({
                          action: "select_method",
                          method: "CARD",
                        });
                        setSelectedMethod("CARD");
                        setPaymentStep("DETAILS");
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                    <PaymentOption
                      icon={<BadgeIndianRupee className="w-6 h-6" />}
                      label="Pay via Cash"
                      sub="At Counter"
                      gradient="from-[#15b8a2] to-[#0a8e7c]"
                      square
                      onClick={() => {
                        trackCheckout({
                          action: "select_method",
                          method: "CASH",
                        });
                        setSelectedMethod("CASH");
                        setPaymentStep("DETAILS");
                      }}
                    />

                    <PaymentOption
                      icon={<QrCode className="w-6 h-6" />}
                      label="Pay via UPI"
                      sub="Scan QR at Kiosk"
                      gradient="from-[#37c2ae] to-[#109a86]"
                      square
                      onClick={() => {
                        trackCheckout({
                          action: "select_method",
                          method: "UPI",
                        });
                        setSelectedMethod("UPI");
                        setPaymentStep("DETAILS");
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3 sm:space-y-4 max-w-2xl mx-auto"
              >
                <button
                  onClick={() => {
                    trackEvent({
                      name: "kiosk.checkout_back_clicked",
                      page: "menu",
                      component: "payment_dialog",
                      action: "back",
                      target: selectedMethod || null,
                    });
                    setPaymentStep("SELECTION");
                  }}
                  className="flex items-center gap-2 text-sm font-black text-[#0e9f89] hover:text-[#0b8b78] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" strokeWidth={3} />
                  GO BACK
                </button>

                {selectedMethod === "UPI" && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3.5 sm:p-5 bg-linear-to-br from-[#ecfaf6] to-[#e1f5f0] rounded-3xl border-2 border-dashed border-[#9adfd2] text-center"
                  >
                    <div className="w-30 h-30 sm:w-40 sm:h-40 bg-white mx-auto rounded-2xl flex items-center justify-center p-2.5 sm:p-3 border-2 border-[#b8e7de] shadow-lg">
                      <img
                        src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=hyperkitchen@upi"
                        alt="UPI QR Code"
                        className="w-full h-full"
                      />
                    </div>
                    <div className="mt-3 space-y-1">
                      <p className="text-base sm:text-lg font-black text-[#0e9f89]">
                        Scan QR Code to Pay
                      </p>
                      <p className="text-xs sm:text-sm text-[#267e72] font-semibold">
                        Open any UPI app and scan
                      </p>
                    </div>
                  </motion.div>
                )}

                {selectedMethod === "CARD" && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3.5 sm:p-5 bg-linear-to-br from-[#ecfaf6] to-[#e1f5f0] rounded-3xl border-2 border-[#b8e7de] text-center"
                  >
                    <CreditCard className="w-13 h-13 sm:w-16 sm:h-16 mx-auto text-[#0e9f89] mb-3" />
                    <p className="text-base sm:text-lg font-black text-[#0e9f89] mb-2">
                      Insert or Tap Your Card
                    </p>
                    <p className="text-xs sm:text-sm text-[#267e72] font-semibold">
                      Follow the instructions on the card reader
                    </p>
                  </motion.div>
                )}

                {selectedMethod === "CASH" && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3.5 sm:p-5 bg-linear-to-br from-[#ecfaf6] to-[#e1f5f0] rounded-3xl border-2 border-[#b8e7de] text-center"
                  >
                    <Banknote className="w-13 h-13 sm:w-16 sm:h-16 mx-auto text-[#0e9f89] mb-3" />
                    <p className="text-base sm:text-lg font-black text-[#0e9f89] mb-2">
                      Pay at Counter
                    </p>
                    <p className="text-xs sm:text-sm text-[#267e72] font-semibold">
                      Show your order number to the cashier
                    </p>
                  </motion.div>
                )}

                <Button
                  className="w-full h-12 sm:h-13 bg-linear-to-r from-[#16b8a1] via-[#0e9f89] to-[#16b8a1] hover:from-[#0fb39a] hover:via-[#0b8b78] hover:to-[#0fb39a] text-white font-black text-base sm:text-lg rounded-2xl shadow-lg shadow-[#8edfd1]/35"
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
