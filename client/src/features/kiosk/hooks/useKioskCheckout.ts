import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import kioskAxios from "@/shared/lib/kioskAxios";
import { addToQueue } from "@/shared/lib/orderQueue";
import type { CartItem } from "../types/cartItem.types";

type PaymentStep = "SELECTION" | "DETAILS";
type PaymentMethod = "CASH" | "CARD" | "UPI" | "";

interface UseKioskCheckoutReturn {
  showPaymentDialog: boolean;
  setShowPaymentDialog: (v: boolean) => void;

  showSuccessDialog: boolean;
  setShowSuccessDialog: (v: boolean) => void;

  paymentStep: PaymentStep;
  setPaymentStep: (v: PaymentStep) => void;

  selectedMethod: PaymentMethod;
  setSelectedMethod: (v: PaymentMethod) => void;

  isProcessing: boolean;
  orderNumber: string;

  handleOpenCheckout: () => void;
  handleConfirmOrder: () => Promise<void>;
}

export function useKioskCheckout(
  cart: CartItem[],
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  reloadMenu: (silent?: boolean) => Promise<void>,
): UseKioskCheckoutReturn {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const [paymentStep, setPaymentStep] = useState<PaymentStep>("SELECTION");

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("");

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const handleOpenCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setPaymentStep("SELECTION");
    setSelectedMethod("");
    setShowPaymentDialog(true);
  };

  const handleConfirmOrder = async () => {
    if (!selectedMethod) {
      toast.error("Select a payment method");
      return;
    }

    setIsProcessing(true);
    setShowPaymentDialog(false);

    const loadingToast = toast.loading("Processing your order...");

    try {
      const clientOrderId = uuidv4();

      const orderData = {
        clientOrderId,
        paymentMethod: selectedMethod,
        items: cart.map((item) => ({
          itemId: item.itemId,
          quantity: item.quantity,
        })),
      };

      try {
        const response = await kioskAxios.post("/orders", orderData);
        setOrderNumber(response.data.data.orderNumber.toString());

        setShowSuccessDialog(true);
        setCart([]);

        toast.success("Order placed successfully!", {
          duration: 3000,
        });

        await reloadMenu(true);
      } catch (error: any) {
       

        if (!error.response) {
          await addToQueue(orderData);

          toast.error("Offline: Order queued");

          setCart([]);
        } else {
          toast.error("Order failed");
        }
      }
    } finally {
      toast.dismiss(loadingToast);
      setIsProcessing(false);
      setSelectedMethod("");
    }
  };

  return {
    showPaymentDialog,
    setShowPaymentDialog,

    showSuccessDialog,
    setShowSuccessDialog,

    paymentStep,
    setPaymentStep,

    selectedMethod,
    setSelectedMethod,

    isProcessing,
    orderNumber,

    handleOpenCheckout,
    handleConfirmOrder,
  };
}
