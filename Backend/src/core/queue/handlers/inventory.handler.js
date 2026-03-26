import { getIO } from "../../../realtime/realtime.manager.js";
import { enqueue } from "../queue.producer.js";

export async function handleLowStockAlert(payload) {
  const {
    ingredientId,
    ingredientName,
    currentStock,
    minThreshold,
    franchiseId,
    outletId,
  } = payload;

  console.log(
    `[inventory] LOW STOCK: "${ingredientName}" — current: ${currentStock}, threshold: ${minThreshold} (outlet: ${outletId})`,
  );

  try {
    const io = getIO();
    io.to(`outlet:${outletId}`).emit("ingredient:lowStock", {
      ingredientId,
      ingredientName,
      currentStock,
      minThreshold,
      franchiseId,
      outletId,
      message: `Low stock alert: "${ingredientName}" is below minimum threshold (${currentStock} remaining, minimum ${minThreshold})`,
    });
  } catch {
    // non-fatal
  }

  // Fail-safe: ensure order-driven LOW_STOCK_ALERT also fan-outs to email notifications.
  if (ingredientId && outletId && franchiseId) {
    await enqueue("LOW_STOCK_ALERT_EMAIL", {
      ingredientId: String(ingredientId),
      outletId: String(outletId),
      franchiseId: String(franchiseId),
    }).catch((err) =>
      console.error(
        "[inventory] Failed to enqueue LOW_STOCK_ALERT_EMAIL:",
        err.message,
      ),
    );
  }
}
