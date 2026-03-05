import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";
import kioskAxios from "@/shared/lib/kioskAxios";
import { addToQueue } from "@/shared/lib/orderQueue";
import { getKioskToken } from "@/shared/lib/kioskSession";
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

type OrderProcessingStatus = "PENDING" | "SUCCESS" | "FAILED" | "UNKNOWN";

function getSocketUrl(): string {
  const apiUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiUrl) return "http://localhost:3000";
  try {
    return new URL(apiUrl).origin;
  } catch {
    return "http://localhost:3000";
  }
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

  const fetchOrderStatus = async (clientOrderId: string) => {
    const response = await kioskAxios.get(`/orders/client/${clientOrderId}/status`);
    return response.data.data as {
      clientOrderId: string;
      orderNumber: number | null;
      status: OrderProcessingStatus;
      errorMessage: string | null;
    };
  };

  const waitForOrderOutcome = async (
    clientOrderId: string,
    fallbackOrderNumber: number,
    timeoutMs = 20000
  ): Promise<{ status: "SUCCESS"; orderNumber: number }> => {
    const socketUrl = getSocketUrl();
    const kioskToken = getKioskToken();

    return new Promise((resolve, reject) => {
      let settled = false;
      let pollInFlight = false;

      const socket = io(
        socketUrl,
        kioskToken
          ? { auth: { token: kioskToken }, transports: ["websocket"] }
          : { withCredentials: true, transports: ["websocket"] }
      );

      const cleanup = () => {
        clearInterval(pollInterval);
        clearTimeout(timeoutHandle);
        socket.disconnect();
      };

      const settleSuccess = (resolvedOrderNumber?: number) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve({
          status: "SUCCESS",
          orderNumber: resolvedOrderNumber ?? fallbackOrderNumber,
        });
      };

      const settleFailure = (message: string) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(new Error(message));
      };

      const checkStatus = async () => {
        if (settled || pollInFlight) return;
        pollInFlight = true;
        try {
          const status = await fetchOrderStatus(clientOrderId);
          if (status.status === "SUCCESS") {
            settleSuccess(status.orderNumber ?? fallbackOrderNumber);
            return;
          }
          if (status.status === "FAILED") {
            settleFailure(status.errorMessage || "Order could not be completed");
          }
        } catch {
          // Ignore transient status-check failures; socket/next poll can still resolve it.
        } finally {
          pollInFlight = false;
        }
      };

      socket.on("order:new", (order: { clientOrderId?: string; orderNumber?: number }) => {
        if (order?.clientOrderId === clientOrderId) {
          settleSuccess(order.orderNumber);
        }
      });

      socket.on(
        "order:failed",
        (payload: { clientOrderId?: string; orderNumber?: number; message?: string }) => {
          if (payload?.clientOrderId === clientOrderId) {
            settleFailure(payload.message || "Order could not be completed");
          }
        }
      );

      const pollInterval = setInterval(() => {
        void checkStatus();
      }, 2000);

      const timeoutHandle = setTimeout(() => {
        void (async () => {
          await checkStatus();
          if (!settled) {
            settleFailure("Unable to confirm your order. Please try again.");
          }
        })();
      }, timeoutMs);

      void checkStatus();
    });
  };

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
        const queuedOrder = response.data.data as {
          orderNumber: number;
          status?: OrderProcessingStatus;
          errorMessage?: string | null;
        };

        if (queuedOrder.status === "FAILED") {
          throw new Error(queuedOrder.errorMessage || "Order could not be completed");
        }

        if (queuedOrder.status === "SUCCESS") {
          setOrderNumber(queuedOrder.orderNumber.toString());
          setShowSuccessDialog(true);
          setCart([]);
          toast.success("Order placed successfully!", { duration: 3000 });
          await reloadMenu(true);
          return;
        }

        const outcome = await waitForOrderOutcome(
          clientOrderId,
          queuedOrder.orderNumber
        );

        setOrderNumber(outcome.orderNumber.toString());
        setShowSuccessDialog(true);
        setCart([]);

        toast.success("Order placed successfully!", { duration: 3000 });

        await reloadMenu(true);
      } catch (error: any) {
        if (!error.response) {
          if (error?.message?.includes("could not be completed") || error?.message?.includes("Unable to confirm")) {
            toast.error(error.message);
            await reloadMenu(true);
          } else {
            await addToQueue(orderData);
            toast.error("Offline: Order queued");
            setCart([]);
          }
        } else {
          toast.error(error.response?.data?.message || "Order failed");
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
