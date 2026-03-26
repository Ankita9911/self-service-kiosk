import KioskTelemetryEvent from "../model/kioskTelemetryEvent.model.js";
import KioskTelemetrySession from "../model/kioskTelemetrySession.model.js";
import KioskTelemetryRollup from "../model/kioskTelemetryRollup.model.js";
import {
  TELEMETRY_GRANULARITY,
  TELEMETRY_METRIC_TYPE,
  TELEMETRY_SESSION_STATUS,
} from "../constant/telemetry.constants.js";

const TERMINAL_SUCCESS_EVENTS = new Set([
  "kiosk.checkout_succeeded",
  "kiosk.success_dialog_opened",
]);

const TERMINAL_FAILURE_EVENTS = new Set([
  "kiosk.checkout_failed",
  "kiosk.failure_dialog_opened",
]);

const FORCE_LOGOUT_EVENTS = new Set(["kiosk.session_forced_logout"]);

const ERROR_EVENTS = new Set([
  "kiosk.login_submit_failed",
  "kiosk.checkout_failed",
  "kiosk.failure_dialog_opened",
]);

const FUNNEL_STEP_BY_EVENT = {
  "kiosk.page_viewed:login": "login",
  "kiosk.page_viewed:landing": "landing",
  "kiosk.page_viewed:order_type": "order_type",
  "kiosk.page_viewed:menu": "menu",
  "kiosk.cart_opened:menu": "cart",
  "kiosk.checkout_dialog_opened:menu": "checkout",
  "kiosk.checkout_succeeded:menu": "order_success",
  "kiosk.checkout_failed:menu": "order_failure",
  "kiosk.success_dialog_opened:menu": "order_success",
  "kiosk.failure_dialog_opened:menu": "order_failure",
};

function sortEvents(events) {
  return [...events].sort((a, b) => {
    if (a.seq !== b.seq) return a.seq - b.seq;
    return a.ts - b.ts;
  });
}

function toDate(value) {
  return new Date(value);
}

function getBucketStart(date, granularity) {
  const bucket = new Date(date);
  bucket.setSeconds(0, 0);

  if (granularity === TELEMETRY_GRANULARITY.MINUTE) {
    return bucket;
  }

  bucket.setMinutes(0);

  if (granularity === TELEMETRY_GRANULARITY.HOUR) {
    return bucket;
  }

  bucket.setHours(0, 0, 0, 0);
  return bucket;
}

function isErrorEvent(event) {
  return (
    ERROR_EVENTS.has(event.name) ||
    event.action === "error" ||
    event.payload?.success === false
  );
}

function getFunnelStep(event) {
  return FUNNEL_STEP_BY_EVENT[`${event.name}:${event.page}`] || null;
}

function getTerminalStatus(events) {
  if (events.some((event) => FORCE_LOGOUT_EVENTS.has(event.name))) {
    return TELEMETRY_SESSION_STATUS.FORCED_LOGOUT;
  }
  if (events.some((event) => TERMINAL_SUCCESS_EVENTS.has(event.name))) {
    return TELEMETRY_SESSION_STATUS.COMPLETED;
  }
  if (events.some((event) => TERMINAL_FAILURE_EVENTS.has(event.name))) {
    return TELEMETRY_SESSION_STATUS.FAILED;
  }
  return null;
}

function isTerminalStatus(status) {
  return (
    status === TELEMETRY_SESSION_STATUS.COMPLETED ||
    status === TELEMETRY_SESSION_STATUS.FAILED ||
    status === TELEMETRY_SESSION_STATUS.FORCED_LOGOUT
  );
}

function createRollupAccumulator(payload) {
  const map = new Map();
  const base = {
    franchiseId: payload.franchiseId,
    outletId: payload.outletId,
    deviceId: payload.deviceId,
  };

  function add(doc) {
    const key = [
      doc.granularity,
      doc.metricType,
      doc.bucketStart.toISOString(),
      doc.franchiseId,
      doc.outletId,
      doc.deviceId || "",
      doc.page || "",
      doc.component || "",
      doc.action || "",
      doc.target || "",
      doc.name || "",
      doc.outcome || "",
    ].join("|");

    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
      if (!existing.lastEventAt || doc.lastEventAt > existing.lastEventAt) {
        existing.lastEventAt = doc.lastEventAt;
      }
      return;
    }

    map.set(key, { ...doc, count: 1 });
  }

  function addEvent(event) {
    const eventAt = toDate(event.ts);
    const granularities = Object.values(TELEMETRY_GRANULARITY);
    const step = getFunnelStep(event);
    const isError = isErrorEvent(event);

    for (const granularity of granularities) {
      const bucketStart = getBucketStart(eventAt, granularity);

      add({
        ...base,
        granularity,
        metricType: TELEMETRY_METRIC_TYPE.PAGE,
        bucketStart,
        page: event.page,
        name: event.name,
        outcome: null,
        component: null,
        action: null,
        target: null,
        lastEventAt: eventAt,
      });

      add({
        ...base,
        granularity,
        metricType: TELEMETRY_METRIC_TYPE.COMPONENT,
        bucketStart,
        page: event.page,
        component: event.component,
        action: event.action,
        target: event.target ?? null,
        name: event.name,
        outcome: null,
        lastEventAt: eventAt,
      });

      add({
        ...base,
        granularity,
        metricType: TELEMETRY_METRIC_TYPE.DEVICE,
        bucketStart,
        page: null,
        component: null,
        action: null,
        target: null,
        name: event.name,
        outcome: null,
        lastEventAt: eventAt,
      });

      if (step) {
        add({
          ...base,
          granularity,
          metricType: TELEMETRY_METRIC_TYPE.FUNNEL,
          bucketStart,
          page: event.page,
          component: null,
          action: null,
          target: null,
          name: step,
          outcome: null,
          lastEventAt: eventAt,
        });
      }

      if (isError) {
        add({
          ...base,
          granularity,
          metricType: TELEMETRY_METRIC_TYPE.ERROR,
          bucketStart,
          page: event.page,
          component: event.component,
          action: event.action,
          target: null,
          name: event.name,
          outcome: String(event.payload?.errorCode || event.payload?.code || "unknown"),
          lastEventAt: eventAt,
        });
      }
    }
  }

  return {
    addEvent,
    values: () => [...map.values()],
  };
}

function buildRawEventDocs(payload, events) {
  const receivedAt = toDate(payload.receivedAt);
  return events.map((event) => ({
    eventId: event.eventId,
    visitorSessionId: payload.visitorSessionId,
    franchiseId: payload.franchiseId,
    outletId: payload.outletId,
    deviceId: payload.deviceId,
    schemaVersion: event.schemaVersion,
    name: event.name,
    seq: event.seq,
    page: event.page,
    component: event.component,
    action: event.action,
    target: event.target ?? null,
    payload: event.payload ?? {},
    appVersion: payload.appVersion || null,
    eventAt: toDate(event.ts),
    receivedAt,
  }));
}

function isDuplicateOnlyInsertError(error) {
  if (!error) return false;
  if (error.code === 11000) return true;
  if (Array.isArray(error.writeErrors) && error.writeErrors.length > 0) {
    return error.writeErrors.every((writeError) => writeError.code === 11000);
  }
  return false;
}

async function filterFreshRawDocs(rawDocs) {
  if (rawDocs.length === 0) return [];

  const existing = await KioskTelemetryEvent.find({
    eventId: { $in: rawDocs.map((doc) => doc.eventId) },
  })
    .select("eventId")
    .lean();

  const existingIds = new Set(existing.map((doc) => doc.eventId));
  return rawDocs.filter((doc) => !existingIds.has(doc.eventId));
}

async function insertRawEvents(rawDocs) {
  if (rawDocs.length === 0) return [];

  const freshDocs = await filterFreshRawDocs(rawDocs);
  if (freshDocs.length === 0) return [];

  try {
    await KioskTelemetryEvent.insertMany(freshDocs, { ordered: false });
    return freshDocs;
  } catch (error) {
    if (!isDuplicateOnlyInsertError(error)) {
      throw error;
    }
    return await filterFreshRawDocs(freshDocs);
  }
}

async function upsertSessionSummary(payload, events) {
  if (events.length === 0) return;

  const sortedEvents = sortEvents(events);
  const firstEvent = sortedEvents[0];
  const lastEvent = sortedEvents[sortedEvents.length - 1];
  const terminalStatus = getTerminalStatus(sortedEvents);
  const funnelSteps = [...new Set(sortedEvents.map(getFunnelStep).filter(Boolean))];
  const pagesVisited = [...new Set(sortedEvents.map((event) => event.page))];
  const errorCount = sortedEvents.filter(isErrorEvent).length;

  const update = {
    $setOnInsert: {
      visitorSessionId: payload.visitorSessionId,
      franchiseId: payload.franchiseId,
      outletId: payload.outletId,
      deviceId: payload.deviceId,
      startedAt: toDate(firstEvent.ts),
      entryPage: firstEvent.page,
    },
    $set: {
      appVersion: payload.appVersion || null,
      lastEventAt: toDate(lastEvent.ts),
      exitPage: lastEvent.page,
      status: TELEMETRY_SESSION_STATUS.ACTIVE,
    },
    $inc: {
      eventCount: sortedEvents.length,
      errorCount,
    },
    $addToSet: {
      pagesVisited: { $each: pagesVisited },
      funnelSteps: { $each: funnelSteps },
    },
  };

  if (
    sortedEvents.some(
      (event) =>
        event.name === "kiosk.cart_opened" ||
        event.name === "kiosk.cart_item_added" ||
        event.name === "kiosk.cart_item_removed" ||
        event.name === "kiosk.cart_quantity_changed",
    )
  ) {
    update.$set.cartCreated = true;
  }

  if (
    sortedEvents.some(
      (event) =>
        event.name === "kiosk.checkout_dialog_opened" ||
        event.name === "kiosk.checkout_confirm_clicked",
    )
  ) {
    update.$set.checkoutStarted = true;
  }

  if (terminalStatus === TELEMETRY_SESSION_STATUS.COMPLETED) {
    update.$set.status = TELEMETRY_SESSION_STATUS.COMPLETED;
    update.$set.endedAt = toDate(lastEvent.ts);
    update.$set.orderCompleted = true;
  }

  if (terminalStatus === TELEMETRY_SESSION_STATUS.FAILED) {
    update.$set.status = TELEMETRY_SESSION_STATUS.FAILED;
    update.$set.endedAt = toDate(lastEvent.ts);
    update.$set.orderFailed = true;
  }

  if (terminalStatus === TELEMETRY_SESSION_STATUS.FORCED_LOGOUT) {
    update.$set.status = TELEMETRY_SESSION_STATUS.FORCED_LOGOUT;
    update.$set.endedAt = toDate(lastEvent.ts);
    update.$set.forceLoggedOut = true;
  }

  const existing = await KioskTelemetrySession.findOne({
    visitorSessionId: payload.visitorSessionId,
  })
    .select("status")
    .lean();

  if (existing?.status && isTerminalStatus(existing.status) && !terminalStatus) {
    delete update.$set.status;
    delete update.$set.endedAt;
  }

  await KioskTelemetrySession.findOneAndUpdate(
    { visitorSessionId: payload.visitorSessionId },
    update,
    { upsert: true, new: true },
  );
}

async function upsertRollups(payload, events) {
  if (events.length === 0) return;

  const accumulator = createRollupAccumulator(payload);
  events.forEach((event) => accumulator.addEvent(event));

  const ops = accumulator.values().map((doc) => ({
    updateOne: {
      filter: {
        granularity: doc.granularity,
        metricType: doc.metricType,
        bucketStart: doc.bucketStart,
        franchiseId: doc.franchiseId,
        outletId: doc.outletId,
        deviceId: doc.deviceId ?? null,
        page: doc.page ?? null,
        component: doc.component ?? null,
        action: doc.action ?? null,
        target: doc.target ?? null,
        name: doc.name ?? null,
        outcome: doc.outcome ?? null,
      },
      update: {
        $setOnInsert: {
          granularity: doc.granularity,
          metricType: doc.metricType,
          bucketStart: doc.bucketStart,
          franchiseId: doc.franchiseId,
          outletId: doc.outletId,
          deviceId: doc.deviceId ?? null,
          page: doc.page ?? null,
          component: doc.component ?? null,
          action: doc.action ?? null,
          target: doc.target ?? null,
          name: doc.name ?? null,
          outcome: doc.outcome ?? null,
        },
        $inc: { count: doc.count },
        $max: { lastEventAt: doc.lastEventAt },
      },
      upsert: true,
    },
  }));

  if (ops.length > 0) {
    await KioskTelemetryRollup.bulkWrite(ops, { ordered: false });
  }
}

export async function recordTelemetryBatch(payload) {
  const events = sortEvents(payload.events || []);
  if (events.length === 0) return;

  const rawDocs = buildRawEventDocs(payload, events);
  const freshRawDocs = await insertRawEvents(rawDocs);
  if (freshRawDocs.length === 0) return;

  const freshEventIds = new Set(freshRawDocs.map((doc) => doc.eventId));
  const freshEvents = events.filter((event) => freshEventIds.has(event.eventId));

  await upsertSessionSummary(payload, freshEvents);
  await upsertRollups(payload, freshEvents);
}

export async function backfillTelemetryAggregatesFromRawEvents(filters = {}) {
  const match = {};

  if (filters.visitorSessionId) {
    match.visitorSessionId = filters.visitorSessionId;
  }
  if (filters.franchiseId) {
    match.franchiseId = filters.franchiseId;
  }
  if (filters.outletId) {
    match.outletId = filters.outletId;
  }
  if (filters.deviceId) {
    match.deviceId = filters.deviceId;
  }

  const sessionGroups = await KioskTelemetryEvent.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$visitorSessionId",
        franchiseId: { $first: "$franchiseId" },
        outletId: { $first: "$outletId" },
        deviceId: { $first: "$deviceId" },
        appVersion: { $max: "$appVersion" },
        receivedAt: { $max: "$receivedAt" },
      },
    },
    { $sort: { receivedAt: -1 } },
  ]);

  let processedSessions = 0;
  let processedEvents = 0;

  for (const group of sessionGroups) {
    const sessionMatch = {
      visitorSessionId: group._id,
      franchiseId: group.franchiseId,
      outletId: group.outletId,
      deviceId: group.deviceId,
    };

    const rawEvents = await KioskTelemetryEvent.find(sessionMatch)
      .sort({ seq: 1, eventAt: 1, _id: 1 })
      .select(
        "eventId schemaVersion name eventAt seq page component action target payload",
      )
      .lean();

    if (rawEvents.length === 0) {
      continue;
    }

    const payload = {
      visitorSessionId: group._id,
      franchiseId: group.franchiseId,
      outletId: group.outletId,
      deviceId: group.deviceId,
      appVersion: group.appVersion || null,
      receivedAt: group.receivedAt || new Date().toISOString(),
      events: rawEvents.map((event) => ({
        eventId: event.eventId,
        schemaVersion: event.schemaVersion,
        name: event.name,
        ts: new Date(event.eventAt).getTime(),
        seq: event.seq,
        page: event.page,
        component: event.component,
        action: event.action,
        target: event.target ?? null,
        payload: event.payload ?? {},
      })),
    };

    await upsertSessionSummary(payload, payload.events);
    await upsertRollups(payload, payload.events);

    processedSessions += 1;
    processedEvents += rawEvents.length;
  }

  return {
    processedSessions,
    processedEvents,
  };
}
