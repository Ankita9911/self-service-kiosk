import { getIO } from "../../../realtime/realtime.manager.js";

export async function handleLowStockAlert(payload) {
  const { ingredientId, ingredientName, currentStock, minThreshold, franchiseId, outletId } = payload;

  console.log(`[inventory] LOW STOCK: "${ingredientName}" — current: ${currentStock}, threshold: ${minThreshold} (outlet: ${outletId})`);

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
}
