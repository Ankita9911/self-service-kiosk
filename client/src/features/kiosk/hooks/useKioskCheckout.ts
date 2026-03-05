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
type CheckoutFailureKind = "ORDER_FAILED" | "ORDER_UNCONFIRMED";

interface UseKioskCheckoutReturn {
  showPaymentDialog: boolean;
  setShowPaymentDialog: (v: boolean) => void;
  showProcessingDialog: boolean;

  showSuccessDialog: boolean;
  setShowSuccessDialog: (v: boolean) => void;
  showFailedDialog: boolean;
  setShowFailedDialog: (v: boolean) => void;
  failedMessage: string;

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

interface CheckoutFailure extends Error {
  kind?: CheckoutFailureKind;
}

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
  const [showProcessingDialog, setShowProcessingDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showFailedDialog, setShowFailedDialog] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");

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
        const err = new Error(message) as CheckoutFailure;
        err.kind = "ORDER_FAILED";
        reject(err);
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
            const timeoutError = new Error(
              "Unable to confirm your order. Please try again."
            ) as CheckoutFailure;
            timeoutError.kind = "ORDER_UNCONFIRMED";
            settled = true;
            cleanup();
            reject(timeoutError);
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
    setShowProcessingDialog(true);

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
          const failedError = new Error(
            queuedOrder.errorMessage || "Order could not be completed"
          ) as CheckoutFailure;
          failedError.kind = "ORDER_FAILED";
          throw failedError;
        }

        if (queuedOrder.status === "SUCCESS") {
          setShowProcessingDialog(false);
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

        setShowProcessingDialog(false);
        setOrderNumber(outcome.orderNumber.toString());
        setShowSuccessDialog(true);
        setCart([]);

        toast.success("Order placed successfully!", { duration: 3000 });

        await reloadMenu(true);
      } catch (error: unknown) {
        const maybeError = error as {
          message?: string;
          response?: { data?: { message?: string } };
          kind?: CheckoutFailureKind;
        };
        const hasResponse = !!maybeError.response;
        const errorMessage = maybeError.message || "Order failed";
        const failureKind = maybeError.kind;

        if (failureKind === "ORDER_FAILED" || failureKind === "ORDER_UNCONFIRMED") {
          setShowProcessingDialog(false);
          toast.error(errorMessage);
          setFailedMessage(errorMessage);
          setShowFailedDialog(true);
          await reloadMenu(true);
          return;
        }

        if (!hasResponse) {
          setShowProcessingDialog(false);
          await addToQueue(orderData);
          toast.error("Offline: Order queued");
          setCart([]);
        } else {
          setShowProcessingDialog(false);
          const serverMessage = maybeError.response?.data?.message || "Order failed";
          toast.error(serverMessage);
          setFailedMessage(serverMessage);
          setShowFailedDialog(true);
        }
      }
    } finally {
      setShowProcessingDialog(false);
      setIsProcessing(false);
      setSelectedMethod("");
    }
  };

  return {
    showPaymentDialog,
    setShowPaymentDialog,
    showProcessingDialog,

    showSuccessDialog,
    setShowSuccessDialog,
    showFailedDialog,
    setShowFailedDialog,
    failedMessage,

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
