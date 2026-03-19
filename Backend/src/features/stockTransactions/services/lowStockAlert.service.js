import User from "../../users/model/user.model.js";
import Outlet from "../../outlets/model/outlet.model.js";
import Franchise from "../../franchises/model/franchise.model.js";
import { sendLowStockAlert } from "../../core/email/email.service.js";
import { USER_ROLE, USER_STATUS } from "../../users/constant/user.constants.js";

async function getRecipientsForOutlet(outletId, franchiseId) {
  try {
    // Find outlet manager for this outlet
    const outletManager = await User.findOne({
      outletId,
      role: USER_ROLE.OUTLET_MANAGER,
      status: USER_STATUS.ACTIVE,
      isDeleted: false,
    }).select("email");

    // Find franchise admin for this franchise
    const franchiseAdmin = await User.findOne({
      franchiseId,
      role: USER_ROLE.FRANCHISE_ADMIN,
      status: USER_STATUS.ACTIVE,
      isDeleted: false,
    }).select("email");

    return {
      outletManagerEmail: outletManager?.email || null,
      franchiseAdminEmail: franchiseAdmin?.email || null,
    };
  } catch (err) {
    console.error(
      `[LowStockAlert] Error fetching recipients for outlet ${outletId}:`,
      err.message,
    );
    return {
      outletManagerEmail: null,
      franchiseAdminEmail: null,
    };
  }
}
function shouldNotifyLowStock(currentStock, minThreshold) {
  return currentStock < minThreshold && minThreshold > 0;
}
export async function notifyLowStock({ ingredient, outlet, franchise }) {
  try {
    // Validate inputs
    if (!ingredient || !outlet || !franchise) {
      console.warn("[LowStockAlert] Missing required data for notification");
      return;
    }

    // Validate if notification should be sent
    if (
      !shouldNotifyLowStock(ingredient.currentStock, ingredient.minThreshold)
    ) {
      return;
    }

    // Get recipients
    const { outletManagerEmail, franchiseAdminEmail } =
      await getRecipientsForOutlet(outlet._id, franchise._id);

    // If no outlet manager, don't send email (franchise admin in CC only)
    if (!outletManagerEmail) {
      console.warn(
        `[LowStockAlert] No outlet manager found for outlet ${outlet._id}`,
      );
      return;
    }

    // Send email (fire-and-forget — never block the main request)
    await sendLowStockAlert({
      to: outletManagerEmail,
      cc: franchiseAdminEmail,
      ingredientName: ingredient.name,
      currentStock: ingredient.currentStock,
      minThreshold: ingredient.minThreshold,
      unit: ingredient.unit,
      outletName: outlet.name,
      franchiseName: franchise.name,
    });

    console.info(
      `[LowStockAlert] Notification sent for "${ingredient.name}" in outlet ${outlet._id}`,
    );
  } catch (err) {
    // Log error but never throw — non-fatal
    console.error("[LowStockAlert] Failed to send notification:", err.message);
  }
}
export async function getAlertRecipients(outletId, franchiseId) {
  return getRecipientsForOutlet(outletId, franchiseId);
}
