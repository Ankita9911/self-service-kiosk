import {
  TELEMETRY_ENABLED,
  TELEMETRY_FLUSH_BATCH_SIZE,
  TELEMETRY_FLUSH_INTERVAL_MS,
  TELEMETRY_REQUEST_MAX_EVENTS,
} from "./constants";
import { postTelemetryBatch } from "./transport";
import type {
  BufferedTelemetryEvent,
  TelemetryBatchRequest,
  TelemetryEvent,
  TelemetryFlushOptions,
} from "./types";

let bufferedEvents: BufferedTelemetryEvent[] = [];
let flushTimer: ReturnType<typeof window.setTimeout> | null = null;
let activeFlushPromise: Promise<boolean> | null = null;

function clearFlushTimer() {
  if (flushTimer === null) return;
  window.clearTimeout(flushTimer);
  flushTimer = null;
}

function scheduleFlush() {
  if (flushTimer !== null || bufferedEvents.length === 0) return;

  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flushBufferedEvents();
  }, TELEMETRY_FLUSH_INTERVAL_MS);
}

function stripBufferedEvent(event: BufferedTelemetryEvent): TelemetryEvent {
  return {
    eventId: event.eventId,
    schemaVersion: event.schemaVersion,
    name: event.name,
    ts: event.ts,
    seq: event.seq,
    page: event.page,
    component: event.component,
    action: event.action,
    target: event.target,
    payload: event.payload,
  };
}

function chunkEvents(events: BufferedTelemetryEvent[]) {
  const chunks: BufferedTelemetryEvent[][] = [];

  for (let index = 0; index < events.length; index += TELEMETRY_REQUEST_MAX_EVENTS) {
    chunks.push(events.slice(index, index + TELEMETRY_REQUEST_MAX_EVENTS));
  }

  return chunks;
}

function buildTelemetryBatches(): TelemetryBatchRequest[] {
  const groupedEvents = new Map<string, BufferedTelemetryEvent[]>();

  for (const event of bufferedEvents) {
    const group = groupedEvents.get(event.visitorSessionId);
    if (group) {
      group.push(event);
      continue;
    }
    groupedEvents.set(event.visitorSessionId, [event]);
  }

  const batches: TelemetryBatchRequest[] = [];

  for (const [visitorSessionId, sessionEvents] of groupedEvents.entries()) {
    for (const chunk of chunkEvents(sessionEvents)) {
      batches.push({
        visitorSessionId,
        events: chunk.map(stripBufferedEvent),
      });
    }
  }

  return batches;
}

function pruneBufferedEvents(sentEventIds: Set<string>) {
  if (sentEventIds.size === 0) return;
  bufferedEvents = bufferedEvents.filter((event) => !sentEventIds.has(event.eventId));
}

export function enqueueTelemetryEvent(event: BufferedTelemetryEvent) {
  if (!TELEMETRY_ENABLED) return;
  bufferedEvents.push(event);

  if (bufferedEvents.length >= TELEMETRY_FLUSH_BATCH_SIZE) {
    void flushBufferedEvents();
    return;
  }

  scheduleFlush();
}

export async function flushBufferedEvents(
  options: TelemetryFlushOptions = {},
): Promise<boolean> {
  if (!TELEMETRY_ENABLED) {
    bufferedEvents = [];
    clearFlushTimer();
    return true;
  }
  if (bufferedEvents.length === 0) return true;
  if (activeFlushPromise) return activeFlushPromise;

  clearFlushTimer();

  activeFlushPromise = (async () => {
    const sentEventIds = new Set<string>();
    let retryableFailure = false;
    let unauthenticatedBatch = false;

    for (const batch of buildTelemetryBatches()) {
      const status = await postTelemetryBatch(batch, options);

      if (status === "sent") {
        batch.events.forEach((event) => sentEventIds.add(event.eventId));
        continue;
      }

      if (status === "unauthenticated") {
        unauthenticatedBatch = true;
        continue;
      }

      retryableFailure = true;
    }

    pruneBufferedEvents(sentEventIds);

    if (retryableFailure && bufferedEvents.length > 0 && !options.keepalive) {
      scheduleFlush();
    }

    return !retryableFailure && !unauthenticatedBatch;
  })();

  try {
    return await activeFlushPromise;
  } finally {
    activeFlushPromise = null;
  }
}

export function flushBufferedEventsUrgent() {
  return flushBufferedEvents({ keepalive: true });
}

export function getBufferedTelemetryEventCount() {
  return bufferedEvents.length;
}
