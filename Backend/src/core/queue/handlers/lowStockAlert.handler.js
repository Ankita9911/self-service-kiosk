import { notifyLowStock } from "../../modules/stockTransactions/services/lowStockAlert.service.js";
import Ingredient from "../../modules/ingredients/model/ingredient.model.js";
import Outlet from "../../modules/outlets/model/outlet.model.js";
import Franchise from "../../modules/franchises/model/franchise.model.js";

export async function handleLowStockAlertQueue(payload) {
  const { ingredientId, outletId, franchiseId } = payload;

  console.log(
    `[lowStockAlert] Processing low stock notification for ingredient ${ingredientId} in outlet ${outletId}`,
  );

  try {
    // Fetch all required data
    const ingredient = await Ingredient.findById(ingredientId);
    const outlet = await Outlet.findById(outletId);
    const franchise = await Franchise.findById(franchiseId);

    // If any data is missing, silently return
    if (!ingredient || !outlet || !franchise) {
      console.warn(
        `[lowStockAlert] Missing data — ingredient: ${!!ingredient}, outlet: ${!!outlet}, franchise: ${!!franchise}`,
      );
      return;
    }

    // Send notification
    await notifyLowStock({
      ingredient: ingredient.toObject(),
      outlet: outlet.toObject(),
      franchise: franchise.toObject(),
    });
  } catch (err) {
    console.error(
      `[lowStockAlert] Error processing notification for ingredient ${ingredientId}:`,
      err.message,
    );
  }
}
