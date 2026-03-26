import mongoose from "mongoose";
import AppError from "../../../shared/errors/AppError.js";
import KioskTelemetrySession from "../model/kioskTelemetrySession.model.js";
import KioskTelemetryRollup from "../model/kioskTelemetryRollup.model.js";
import KioskTelemetryEvent from "../model/kioskTelemetryEvent.model.js";
import {
  TELEMETRY_INGEST_ENABLED,
  TELEMETRY_GRANULARITY,
  TELEMETRY_METRIC_TYPE,
  TELEMETRY_RAW_TTL_SECONDS,
  TELEMETRY_READ_CACHE_ENABLED,
  TELEMETRY_SESSION_STATUS,
} from "../constant/telemetry.constants.js";
import { withTelemetryCache } from "./telemetry.cache.service.js";
import { deriveTelemetryFreshnessStatus } from "../utils/telemetry.status.utils.js";

const DEFAULT_SESSION_LIMIT = 20;
const MAX_SESSION_LIMIT = 100;
const DEFAULT_FUNNEL_STEPS = [
  "login",
  "landing",
  "order_type",
  "menu",
  "cart",
  "checkout",
  "order_success",
  "order_failure",
];

function asObjectId(value, fieldName) {
  if (!value) return null;
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new AppError(`Invalid ${fieldName}`, 400, "INVALID_QUERY");
  }
  return new mongoose.Types.ObjectId(value);
}

function toDateOrNull(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new AppError("Invalid date filter", 400, "INVALID_QUERY");
  }
  return parsed;
}

function normalizeDateRange(query) {
  const now = new Date();
  const to = toDateOrNull(query.to) || now;
  const from =
    toDateOrNull(query.from) ||
    new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

  if (from > to) {
    throw new AppError("from must be before to", 400, "INVALID_QUERY");
  }

  return { from, to };
}

function getRollupGranularity(range) {
  const rangeMs = Math.max(0, range.to.getTime() - range.from.getTime());
  const rangeDays = rangeMs / (24 * 60 * 60 * 1000);
  if (rangeDays <= 2) return TELEMETRY_GRANULARITY.HOUR;
  return TELEMETRY_GRANULARITY.DAY;
}

function floorToGranularity(date, granularity) {
  const bucket = new Date(date);
  bucket.setSeconds(0, 0);

  if (granularity === TELEMETRY_GRANULARITY.HOUR) {
    bucket.setMinutes(0, 0, 0);
    return bucket;
  }

  bucket.setHours(0, 0, 0, 0);
  return bucket;
}

function parseSessionLimit(limit) {
  const parsed = Number.parseInt(String(limit || DEFAULT_SESSION_LIMIT), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return DEFAULT_SESSION_LIMIT;
  return Math.min(parsed, MAX_SESSION_LIMIT);
}

function encodeCursor(doc) {
  if (!doc?._id || !doc?.startedAt) return null;
  return Buffer.from(
    JSON.stringify({
      startedAt: new Date(doc.startedAt).toISOString(),
      _id: String(doc._id),
    }),
    "utf-8",
  ).toString("base64url");
}

function decodeCursor(cursor) {
  if (!cursor) return null;

  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf-8"),
    );

    if (!decoded.startedAt || !decoded._id) return null;
    return {
      startedAt: new Date(decoded.startedAt),
      _id: new mongoose.Types.ObjectId(decoded._id),
    };
  } catch {
    throw new AppError("Invalid cursor", 400, "INVALID_CURSOR");
  }
}

function buildTenantScope(tenant, query = {}) {
  const role = tenant?.role;
  const scope = {};

  if (role === "SUPER_ADMIN") {
    const franchiseId = asObjectId(query.franchiseId, "franchiseId");
    const outletId = asObjectId(query.outletId, "outletId");
    if (franchiseId) scope.franchiseId = franchiseId;
    if (outletId) scope.outletId = outletId;
    if (query.deviceId?.trim()) scope.deviceId = query.deviceId.trim();
    return scope;
  }

  if (tenant?.franchiseId) {
    scope.franchiseId = asObjectId(tenant.franchiseId, "franchiseId");
  }

  if (tenant?.outletId) {
    scope.outletId = asObjectId(tenant.outletId, "outletId");
  } else if (query.outletId) {
    scope.outletId = asObjectId(query.outletId, "outletId");
  }

  if (query.deviceId?.trim()) {
    scope.deviceId = query.deviceId.trim();
  }

  return scope;
}

function buildTimeMatch(fieldName, range) {
  return {
    [fieldName]: {
      $gte: range.from,
      $lte: range.to,
    },
  };
}

function buildRollupMatch(metricType, tenant, query) {
  const range = normalizeDateRange(query);
  const scope = buildTenantScope(tenant, query);
  const granularity = getRollupGranularity(range);

  return {
    ...scope,
    metricType,
    granularity,
    ...buildTimeMatch("bucketStart", {
      from: floorToGranularity(range.from, granularity),
      to: range.to,
    }),
  };
}

function buildSessionMatch(tenant, query) {
  const range = normalizeDateRange(query);
  const scope = buildTenantScope(tenant, query);
  const match = {
    ...scope,
    ...buildTimeMatch("startedAt", range),
  };

  if (query.status) {
    match.status = query.status;
  }

  return match;
}

function buildEventScope(tenant, visitorSessionId) {
  const scope = buildTenantScope(tenant, {});
  return {
    ...scope,
    visitorSessionId,
  };
}

function computeDropOffStep(session) {
  if (session.orderCompleted) return null;
  if (session.orderFailed) return "order_failure";
  if (session.forceLoggedOut) return "forced_logout";

  const steps = Array.isArray(session.funnelSteps) ? session.funnelSteps : [];
  if (steps.length === 0) return "unknown";
  return steps[steps.length - 1];
}

async function aggregateOverview(match) {
  const [summary] = await KioskTelemetrySession.aggregate([
    { $match: match },
    {
      $project: {
        deviceId: 1,
        status: 1,
        eventCount: 1,
        pagesVisitedCount: { $size: { $ifNull: ["$pagesVisited", []] } },
        cartCreated: 1,
        checkoutStarted: 1,
        orderCompleted: 1,
        orderFailed: 1,
        forceLoggedOut: 1,
        durationMs: {
          $max: [
            0,
            {
              $subtract: [
                { $ifNull: ["$endedAt", "$lastEventAt"] },
                "$startedAt",
              ],
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: null,
        sessions: { $sum: 1 },
        uniqueDevices: { $addToSet: "$deviceId" },
        avgSessionDurationMs: { $avg: "$durationMs" },
        completedSessions: {
          $sum: { $cond: ["$orderCompleted", 1, 0] },
        },
        failedSessions: {
          $sum: { $cond: ["$orderFailed", 1, 0] },
        },
        forceLogoutSessions: {
          $sum: { $cond: ["$forceLoggedOut", 1, 0] },
        },
        cartCreatedSessions: {
          $sum: { $cond: ["$cartCreated", 1, 0] },
        },
        checkoutStartedSessions: {
          $sum: { $cond: ["$checkoutStarted", 1, 0] },
        },
        bounceSessions: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $lte: ["$pagesVisitedCount", 1] },
                  { $eq: ["$cartCreated", false] },
                  { $eq: ["$checkoutStarted", false] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ]);

  return summary || {
    sessions: 0,
    uniqueDevices: [],
    avgSessionDurationMs: 0,
    completedSessions: 0,
    failedSessions: 0,
    forceLogoutSessions: 0,
    cartCreatedSessions: 0,
    checkoutStartedSessions: 0,
    bounceSessions: 0,
  };
}

async function getTopDropOff(match) {
  const sessions = await KioskTelemetrySession.find(match)
    .select("funnelSteps orderCompleted orderFailed forceLoggedOut")
    .lean();

  const counts = new Map();
  for (const session of sessions) {
    const dropOffStep = computeDropOffStep(session);
    if (!dropOffStep) continue;
    counts.set(dropOffStep, (counts.get(dropOffStep) || 0) + 1);
  }

  let topStep = null;
  let topCount = 0;
  for (const [step, count] of counts.entries()) {
    if (count > topCount) {
      topStep = step;
      topCount = count;
    }
  }

  return topStep ? { step: topStep, count: topCount } : null;
}

export async function getTelemetryOverview(tenant, query = {}) {
  const range = normalizeDateRange(query);
  const filters = {
    ...query,
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  };

  return withTelemetryCache(tenant, "overview", filters, async () => {
    const match = buildSessionMatch(tenant, query);
    const summary = await aggregateOverview(match);
    const topDropOff = await getTopDropOff(match);

    const sessions = summary.sessions || 0;
    const ratio = (value) => (sessions > 0 ? value / sessions : 0);

    return {
      window: {
        from: range.from,
        to: range.to,
      },
      summary: {
        sessions,
        uniqueDevices: summary.uniqueDevices.length,
        avgSessionDurationMs: Math.round(summary.avgSessionDurationMs || 0),
        bounceRate: ratio(summary.bounceSessions),
        cartCreationRate: ratio(summary.cartCreatedSessions),
        checkoutStartRate: ratio(summary.checkoutStartedSessions),
        completionRate: ratio(summary.completedSessions),
        failureRate: ratio(summary.failedSessions),
        forceLogoutRate: ratio(summary.forceLogoutSessions),
      },
      topDropOff,
    };
  });
}

export async function getTelemetryFunnel(tenant, query = {}) {
  const range = normalizeDateRange(query);
  const filters = {
    ...query,
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  };

  return withTelemetryCache(tenant, "funnel", filters, async () => {
    const match = buildSessionMatch(tenant, query);
    const sessions = await KioskTelemetrySession.find(match)
      .select("funnelSteps orderCompleted orderFailed")
      .lean();

    const counts = Object.fromEntries(
      DEFAULT_FUNNEL_STEPS.map((step) => [step, 0]),
    );

    for (const session of sessions) {
      const steps = new Set(session.funnelSteps || []);
      DEFAULT_FUNNEL_STEPS.forEach((step) => {
        if (steps.has(step)) counts[step] += 1;
      });
    }

    let previous = sessions.length;
    const funnel = DEFAULT_FUNNEL_STEPS.map((step) => {
      const count = counts[step] || 0;
      const conversionFromPrevious = previous > 0 ? count / previous : 0;
      const row = {
        step,
        sessions: count,
        conversionFromPrevious,
      };
      previous = count;
      return row;
    });

    return {
      window: {
        from: range.from,
        to: range.to,
      },
      totalSessions: sessions.length,
      funnel,
    };
  });
}

export async function getTelemetryPages(tenant, query = {}) {
  const range = normalizeDateRange(query);
  const filters = {
    ...query,
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  };

  return withTelemetryCache(tenant, "pages", filters, async () => {
    const match = buildRollupMatch(TELEMETRY_METRIC_TYPE.PAGE, tenant, query);
    const rows = await KioskTelemetryRollup.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$page",
          totalEvents: { $sum: "$count" },
          pageViews: {
            $sum: {
              $cond: [{ $eq: ["$name", "kiosk.page_viewed"] }, "$count", 0],
            },
          },
          pageExits: {
            $sum: {
              $cond: [{ $eq: ["$name", "kiosk.page_exited"] }, "$count", 0],
            },
          },
        },
      },
      { $sort: { totalEvents: -1, _id: 1 } },
    ]);

    return {
      window: {
        from: range.from,
        to: range.to,
      },
      items: rows.map((row) => ({
        page: row._id,
        totalEvents: row.totalEvents,
        pageViews: row.pageViews,
        pageExits: row.pageExits,
      })),
    };
  });
}

export async function getTelemetryComponents(tenant, query = {}) {
  const range = normalizeDateRange(query);
  const filters = {
    ...query,
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  };

  return withTelemetryCache(tenant, "components", filters, async () => {
    const match = buildRollupMatch(
      TELEMETRY_METRIC_TYPE.COMPONENT,
      tenant,
      query,
    );

    if (query.page) match.page = query.page;
    if (query.component) match.component = query.component;

    const rows = await KioskTelemetryRollup.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            page: "$page",
            component: "$component",
            action: "$action",
          },
          count: { $sum: "$count" },
          uniqueTargets: { $addToSet: "$target" },
        },
      },
      { $sort: { count: -1, "_id.page": 1, "_id.component": 1 } },
    ]);

    return {
      window: {
        from: range.from,
        to: range.to,
      },
      items: rows.map((row) => ({
        page: row._id.page,
        component: row._id.component,
        action: row._id.action,
        count: row.count,
        uniqueTargets: row.uniqueTargets.filter(Boolean).length,
      })),
    };
  });
}

export async function getTelemetryDevices(tenant, query = {}) {
  const range = normalizeDateRange(query);
  const filters = {
    ...query,
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  };

  return withTelemetryCache(tenant, "devices", filters, async () => {
    const match = buildSessionMatch(tenant, query);
    const rows = await KioskTelemetrySession.aggregate([
      { $match: match },
      {
        $project: {
          deviceId: 1,
          orderCompleted: 1,
          orderFailed: 1,
          checkoutStarted: 1,
          durationMs: {
            $max: [
              0,
              {
                $subtract: [
                  { $ifNull: ["$endedAt", "$lastEventAt"] },
                  "$startedAt",
                ],
              },
            ],
          },
        },
      },
      {
        $group: {
          _id: "$deviceId",
          sessionCount: { $sum: 1 },
          completedSessions: {
            $sum: { $cond: ["$orderCompleted", 1, 0] },
          },
          failedSessions: {
            $sum: { $cond: ["$orderFailed", 1, 0] },
          },
          checkoutStartedSessions: {
            $sum: { $cond: ["$checkoutStarted", 1, 0] },
          },
          avgSessionDurationMs: { $avg: "$durationMs" },
        },
      },
      { $sort: { sessionCount: -1, _id: 1 } },
    ]);

    return {
      window: {
        from: range.from,
        to: range.to,
      },
      items: rows.map((row) => ({
        deviceId: row._id,
        sessionCount: row.sessionCount,
        completedSessions: row.completedSessions,
        failedSessions: row.failedSessions,
        checkoutStartedSessions: row.checkoutStartedSessions,
        avgSessionDurationMs: Math.round(row.avgSessionDurationMs || 0),
        completionRate:
          row.sessionCount > 0 ? row.completedSessions / row.sessionCount : 0,
      })),
    };
  });
}

export async function getTelemetryErrors(tenant, query = {}) {
  const range = normalizeDateRange(query);
  const filters = {
    ...query,
    from: range.from.toISOString(),
    to: range.to.toISOString(),
  };

  return withTelemetryCache(tenant, "errors", filters, async () => {
    const match = buildRollupMatch(TELEMETRY_METRIC_TYPE.ERROR, tenant, query);
    const rows = await KioskTelemetryRollup.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            page: "$page",
            component: "$component",
            errorCode: "$outcome",
          },
          count: { $sum: "$count" },
        },
      },
      { $sort: { count: -1, "_id.page": 1 } },
    ]);

    return {
      window: {
        from: range.from,
        to: range.to,
      },
      items: rows.map((row) => ({
        page: row._id.page,
        component: row._id.component,
        errorCode: row._id.errorCode,
        count: row.count,
      })),
    };
  });
}

export async function getTelemetrySessions(tenant, query = {}) {
  const range = normalizeDateRange(query);
  const match = buildSessionMatch(tenant, query);
  const limit = parseSessionLimit(query.limit);
  const cursor = decodeCursor(query.cursor);

  if (cursor) {
    match.$or = [
      { startedAt: { $lt: cursor.startedAt } },
      { startedAt: cursor.startedAt, _id: { $lt: cursor._id } },
    ];
  }

  const [items, totalMatching] = await Promise.all([
    KioskTelemetrySession.find(match)
      .sort({ startedAt: -1, _id: -1 })
      .limit(limit + 1)
      .lean(),
    KioskTelemetrySession.countDocuments(buildSessionMatch(tenant, query)),
  ]);

  const hasNext = items.length > limit;
  const pageItems = hasNext ? items.slice(0, limit) : items;

  return {
    window: {
      from: range.from,
      to: range.to,
    },
    items: pageItems.map((session) => ({
      visitorSessionId: session.visitorSessionId,
      deviceId: session.deviceId,
      status: session.status,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      lastEventAt: session.lastEventAt,
      entryPage: session.entryPage,
      exitPage: session.exitPage,
      eventCount: session.eventCount,
      errorCount: session.errorCount,
      cartCreated: session.cartCreated,
      checkoutStarted: session.checkoutStarted,
      orderCompleted: session.orderCompleted,
      orderFailed: session.orderFailed,
      forceLoggedOut: session.forceLoggedOut,
      funnelSteps: session.funnelSteps || [],
      dropOffStep: computeDropOffStep(session),
    })),
    pagination: {
      limit,
      hasNext,
      nextCursor: hasNext ? encodeCursor(pageItems[pageItems.length - 1]) : null,
      totalMatching,
    },
  };
}

async function findSessionOrThrow(tenant, visitorSessionId) {
  const session = await KioskTelemetrySession.findOne(
    buildEventScope(tenant, visitorSessionId),
  ).lean();

  if (!session) {
    throw new AppError("Telemetry session not found", 404, "NOT_FOUND");
  }

  return session;
}

export async function getTelemetrySession(tenant, visitorSessionId) {
  return findSessionOrThrow(tenant, visitorSessionId);
}

export async function getTelemetrySessionEvents(tenant, visitorSessionId) {
  await findSessionOrThrow(tenant, visitorSessionId);

  const events = await KioskTelemetryEvent.find(
    buildEventScope(tenant, visitorSessionId),
  )
    .sort({ seq: 1, eventAt: 1, _id: 1 })
    .lean();

  return {
    visitorSessionId,
    items: events.map((event) => ({
      eventId: event.eventId,
      name: event.name,
      page: event.page,
      component: event.component,
      action: event.action,
      target: event.target,
      payload: event.payload,
      seq: event.seq,
      eventAt: event.eventAt,
      receivedAt: event.receivedAt,
    })),
  };
}

export async function getTelemetryStatus(tenant, query = {}) {
  const windowHours = Math.min(
    168,
    Math.max(1, Number.parseInt(String(query.windowHours || 24), 10) || 24),
  );

  const now = new Date();
  const from = new Date(now.getTime() - windowHours * 60 * 60 * 1000);
  const scope = buildTenantScope(tenant, query);

  const [eventCount, sessionCount, latestEvent, latestSession] = await Promise.all([
    KioskTelemetryEvent.countDocuments({
      ...scope,
      eventAt: { $gte: from, $lte: now },
    }),
    KioskTelemetrySession.countDocuments({
      ...scope,
      startedAt: { $gte: from, $lte: now },
    }),
    KioskTelemetryEvent.findOne(scope)
      .sort({ eventAt: -1, _id: -1 })
      .select("eventAt deviceId name visitorSessionId")
      .lean(),
    KioskTelemetrySession.findOne(scope)
      .sort({ startedAt: -1, _id: -1 })
      .select("startedAt deviceId visitorSessionId status")
      .lean(),
  ]);

  const freshness = deriveTelemetryFreshnessStatus({
    ingestEnabled: TELEMETRY_INGEST_ENABLED,
    latestEventAt: latestEvent?.eventAt || null,
    now,
  });

  return withTelemetryCache(
    tenant,
    "status",
    {
      ...query,
      windowHours,
      outletId: query.outletId,
      deviceId: query.deviceId,
    },
    async () => ({
      checkedAt: now,
      windowHours,
      ingestEnabled: TELEMETRY_INGEST_ENABLED,
      readCacheEnabled: TELEMETRY_READ_CACHE_ENABLED,
      rawRetentionDays: Math.round(TELEMETRY_RAW_TTL_SECONDS / (24 * 60 * 60)),
      eventCount,
      sessionCount,
      latestEventAt: latestEvent?.eventAt || null,
      latestEventName: latestEvent?.name || null,
      latestEventDeviceId: latestEvent?.deviceId || null,
      latestSessionStartedAt: latestSession?.startedAt || null,
      latestSessionDeviceId: latestSession?.deviceId || null,
      latestVisitorSessionId: latestSession?.visitorSessionId || null,
      latestSessionStatus: latestSession?.status || null,
      freshness,
    }),
  );
}
