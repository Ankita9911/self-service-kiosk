import { getRedisClient } from "../../../core/cache/redis.client.js";

async function deleteByPattern(pattern) {
  const redis = getRedisClient();
  let cursor = "0";

  do {
    const [nextCursor, keys] = await redis.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      200,
    );

    cursor = nextCursor;

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } while (cursor !== "0");
}

export async function invalidateAnalyticsOverviewCache({
  franchiseId,
  outletId,
}) {
  if (!franchiseId || !outletId) return;

  const patterns = [
    `tenant:${franchiseId}:${outletId}:analytics:overview:OUTLET_MANAGER:*`,
    `tenant:${franchiseId}:${outletId}:analytics:overview:KITCHEN_STAFF:*`,
    `tenant:${franchiseId}:${outletId}:analytics:overview:PICKUP_STAFF:*`,
    `tenant:${franchiseId}:global:analytics:overview:FRANCHISE_ADMIN:*`,
  ];

  for (const pattern of patterns) {
    await deleteByPattern(pattern);
  }
}
