import User from "../../users/model/user.model.js";
import { sendLowStockAlert } from "../../../core/email/email.service.js";
import { USER_ROLE, USER_STATUS } from "../../users/constant/user.constants.js";

async function getRecipientsForOutlet(outletId, franchiseId) {
  try {
    const outletManager = await User.findOne({
      outletId,
      role: USER_ROLE.OUTLET_MANAGER,
      status: USER_STATUS.ACTIVE,
      isDeleted: false,
    }).select("email");

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
  } catch (error) {
    console.error(
      `[LowStockAlert] Failed to fetch recipients for outlet ${outletId}:`,
      error.message,
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
    if (!ingredient || !outlet || !franchise) {
      return;
    }

    if (
      !shouldNotifyLowStock(ingredient.currentStock, ingredient.minThreshold)
    ) {
      return;
    }

    const { outletManagerEmail, franchiseAdminEmail } =
      await getRecipientsForOutlet(outlet._id, franchise._id);

    if (!outletManagerEmail) {
      return;
    }

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
  } catch (error) {
    console.error("[LowStockAlert] Failed to send low-stock alert:", error.message);
  }
}

export async function getAlertRecipients(outletId, franchiseId) {
  return getRecipientsForOutlet(outletId, franchiseId);
}
