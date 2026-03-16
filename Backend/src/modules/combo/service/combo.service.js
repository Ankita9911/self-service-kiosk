import Combo from "../model/combo.model.js";
import { enqueue } from "../../../core/queue/queue.producer.js";

export async function getCombos(tenant) {
  const combos = await Combo.find({
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
  }).lean();
  return combos;
}

export async function createCombo(data, tenant) {
  await enqueue("COMBO_CREATE", { data, tenant });
  return { queued: true };
}

export async function updateCombo(id, data, tenant) {
  await enqueue("COMBO_UPDATE", { id, data, tenant });
  return { queued: true };
}

export async function deleteCombo(id, tenant) {
  await enqueue("COMBO_DELETE", { id, tenant });
  return { queued: true };
}
