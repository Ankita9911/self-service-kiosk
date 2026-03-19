import {
  recordOrderPlacedAggregate,
  recordOrderStatusChangeAggregate,
} from "../../../modules/analytics/service/analytics.aggregate.service.js";
import { invalidateAnalyticsOverviewCache } from "../../../modules/analytics/service/analytics.cache.service.js";

export async function handleAnalyticsOrderPlaced(payload) {
  await recordOrderPlacedAggregate(payload);

  await invalidateAnalyticsOverviewCache({
    franchiseId: payload.franchiseId,
    outletId: payload.outletId,
  });
}

export async function handleAnalyticsOrderStatusChanged(payload) {
  await recordOrderStatusChangeAggregate(payload);

  await invalidateAnalyticsOverviewCache({
    franchiseId: payload.franchiseId,
    outletId: payload.outletId,
  });
}
