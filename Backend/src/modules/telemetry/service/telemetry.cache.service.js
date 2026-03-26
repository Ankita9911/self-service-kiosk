import crypto from "crypto";
import { getRedisClient } from "../../../core/cache/redis.client.js";
import { buildTenantKey } from "../../../core/cache/cache.utils.js";
import { TELEMETRY_READ_CACHE_ENABLED } from "../constant/telemetry.constants.js";

function createFilterHash(filters) {
  return crypto
    .createHash("sha1")
    .update(JSON.stringify(filters))
    .digest("hex");
}

function getRangeDays(filters = {}) {
  if (!filters.from || !filters.to) return 60;

  const from = new Date(filters.from);
  const to = new Date(filters.to);
  const rangeMs = Math.max(0, to.getTime() - from.getTime());
  return rangeMs / (24 * 60 * 60 * 1000);
}

export function getTelemetryTtlSeconds(endpoint, filters = {}) {
  if (endpoint === "status") return 15;
  if (endpoint === "session" || endpoint === "session_events") return 0;

  const rangeDays = getRangeDays(filters);

  if (endpoint === "sessions") {
    if (rangeDays <= 1.1) return 15;
    return 30;
  }

  if (rangeDays <= 1.1) return 30;
  if (rangeDays <= 7.1) return 60;
  return 300;
}

export function applyTelemetryCacheHeaders(res, endpoint, filters = {}) {
  const ttl = getTelemetryTtlSeconds(endpoint, filters);

  res.setHeader("Vary", "Authorization");
  res.setHeader("X-Telemetry-Cache-Endpoint", endpoint);

  if (!TELEMETRY_READ_CACHE_ENABLED || ttl <= 0) {
    res.setHeader("Cache-Control", "private, no-store");
    res.setHeader("X-Telemetry-Cache-Ttl", "0");
    return;
  }

  res.setHeader("Cache-Control", `private, max-age=${ttl}`);
  res.setHeader("X-Telemetry-Cache-Ttl", String(ttl));
}

export async function withTelemetryCache(tenant, endpoint, filters, fn) {
  const ttl = getTelemetryTtlSeconds(endpoint, filters);

  if (!TELEMETRY_READ_CACHE_ENABLED || ttl <= 0) {
    return fn();
  }

  let redis;
  const cacheKey = buildTenantKey(
    `telemetry:kiosk:${endpoint}:${createFilterHash(filters)}`,
    tenant,
  );

  try {
    redis = getRedisClient();
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    // non-fatal
  }

  const result = await fn();

  try {
    if (redis) {
      await redis.setex(cacheKey, ttl, JSON.stringify(result));
    }
  } catch {
    // non-fatal
  }

  return result;
}
