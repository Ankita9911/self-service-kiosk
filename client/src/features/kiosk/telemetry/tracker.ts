import { v4 as uuidv4 } from "uuid";
import { TELEMETRY_ENABLED, TELEMETRY_SCHEMA_VERSION } from "./constants";
import {
  enqueueTelemetryEvent,
  flushBufferedEvents,
  flushBufferedEventsUrgent,
} from "./buffer";
import {
  clearVisitorSession,
  ensureVisitorSession,
  getCurrentVisitorSession,
  incrementVisitorSequence,
} from "./session";
import type {
  BufferedTelemetryEvent,
  TelemetryPayload,
  TrackApiTimingInput,
  TrackCartMutationInput,
  TrackCheckoutInput,
  TrackClickInput,
  TrackDialogInput,
  TrackErrorInput,
  TrackEventInput,
  TrackFieldInput,
} from "./types";

let lifecycleRegistered = false;

function sanitizeNamePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "unknown";
}

function normalizeTarget(target?: string | null) {
  if (!target) return null;
  const trimmed = target.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function normalizePayload(payload?: TelemetryPayload) {
  if (!payload) return {};

  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined),
  );
}

function resolveEventName(input: TrackEventInput) {
  if (input.name?.trim()) return input.name.trim();

  const nameParts = [sanitizeNamePart(input.page)];

  if (input.component !== "page") {
    nameParts.push(sanitizeNamePart(input.component));
  }

  if (input.target) {
    nameParts.push(sanitizeNamePart(input.target));
  }

  nameParts.push(sanitizeNamePart(input.action));

  return `kiosk.${nameParts.join("_")}`;
}

function createBufferedEvent(
  input: TrackEventInput,
  visitorSessionId: string,
  seq: number,
): BufferedTelemetryEvent {
  return {
    visitorSessionId,
    eventId: uuidv4(),
    schemaVersion: TELEMETRY_SCHEMA_VERSION,
    name: resolveEventName(input),
    ts: Date.now(),
    seq,
    page: input.page,
    component: input.component,
    action: input.action,
    target: normalizeTarget(input.target),
    payload: normalizePayload(input.payload),
  };
}

function enqueueSessionStarted(meta: TelemetryPayload = {}) {
  const currentSession = getCurrentVisitorSession();
  if (!currentSession) return;

  const { session, seq } = incrementVisitorSequence();
  enqueueTelemetryEvent(
    createBufferedEvent(
      {
        name: "kiosk.session_started",
        page: "session",
        component: "session",
        action: "start",
        payload: {
          startedAt: currentSession.startedAt,
          ...meta,
        },
      },
      session.visitorSessionId,
      seq,
    ),
  );
}

function ensureLifecycleListeners() {
  if (lifecycleRegistered || typeof window === "undefined") return;

  const handlePageHide = () => {
    void flushBufferedEventsUrgent();
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      void flushBufferedEventsUrgent();
    }
  };

  const handleOnline = () => {
    void flushBufferedEvents();
  };

  window.addEventListener("pagehide", handlePageHide);
  window.addEventListener("online", handleOnline);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  lifecycleRegistered = true;
}

function enqueueTrackedEvent(
  input: TrackEventInput,
  sessionMeta: TelemetryPayload = {},
) {
  if (!TELEMETRY_ENABLED) return null;
  ensureLifecycleListeners();

  const { created } = ensureVisitorSession(sessionMeta);
  if (created) {
    enqueueSessionStarted(sessionMeta);
  }

  const { session, seq } = incrementVisitorSequence();
  const event = createBufferedEvent(input, session.visitorSessionId, seq);
  enqueueTelemetryEvent(event);
  return event;
}

export function trackEvent(
  input: TrackEventInput,
  sessionMeta: TelemetryPayload = {},
) {
  return enqueueTrackedEvent(input, sessionMeta);
}

export function startVisitorSession(meta: TelemetryPayload = {}) {
  if (!TELEMETRY_ENABLED) return null;
  ensureLifecycleListeners();

  const { session, created } = ensureVisitorSession(meta);
  if (created) {
    enqueueSessionStarted(meta);
  }

  return session.visitorSessionId;
}

export function endVisitorSession(reason: string, payload: TelemetryPayload = {}) {
  if (!TELEMETRY_ENABLED) return;
  if (!getCurrentVisitorSession()) return;

  ensureLifecycleListeners();

  const { session, seq } = incrementVisitorSequence();
  enqueueTelemetryEvent(
    createBufferedEvent(
      {
        name: "kiosk.session_ended",
        page: "session",
        component: "session",
        action: "end",
        target: reason,
        payload: {
          reason,
          ...payload,
        },
      },
      session.visitorSessionId,
      seq,
    ),
  );

  clearVisitorSession();
  void flushBufferedEventsUrgent();
}

export function trackPageView(page: string, payload: TelemetryPayload = {}) {
  if (!TELEMETRY_ENABLED) return null;
  trackEvent(
    {
      name: "kiosk.page_viewed",
      page,
      component: "page",
      action: "view",
      payload,
    },
    { entryPage: page },
  );
}

export function trackClick(input: TrackClickInput) {
  if (!TELEMETRY_ENABLED) return null;
  trackEvent({
    name: input.name,
    page: input.page,
    component: input.component,
    action: input.action || "click",
    target: input.target,
    payload: input.payload,
  });
}

export function trackField(input: TrackFieldInput) {
  if (!TELEMETRY_ENABLED) return null;
  trackEvent({
    name: input.name,
    page: input.page,
    component: input.component,
    action: input.action,
    target: input.field,
    payload: input.payload,
  });
}

export function trackDialog(input: TrackDialogInput) {
  if (!TELEMETRY_ENABLED) return null;
  trackEvent({
    name: input.name,
    page: input.page,
    component: input.component,
    action: input.action,
    target: input.target,
    payload: input.payload,
  });
}

export function trackCartMutation(input: TrackCartMutationInput) {
  if (!TELEMETRY_ENABLED) return null;
  const defaultNameByAction: Record<string, string> = {
    add: "kiosk.cart_item_added",
    remove: "kiosk.cart_item_removed",
    change: "kiosk.cart_quantity_changed",
  };

  enqueueTrackedEvent({
    name: input.name || defaultNameByAction[input.action] || "kiosk.cart_updated",
    page: "menu",
    component: "cart",
    action: input.action,
    target: input.itemId,
    payload: {
      quantityBefore: input.quantityBefore,
      quantityAfter: input.quantityAfter,
      ...input.payload,
    },
  });
}

export function trackCheckout(input: TrackCheckoutInput) {
  if (!TELEMETRY_ENABLED) return null;
  const defaultNameByAction: Record<string, string> = {
    open: "kiosk.checkout_dialog_opened",
    close: "kiosk.checkout_dialog_closed",
    select_method: "kiosk.checkout_method_selected",
    confirm: "kiosk.checkout_confirm_clicked",
    success: "kiosk.checkout_succeeded",
    failure: "kiosk.checkout_failed",
  };

  enqueueTrackedEvent({
    name: input.name || defaultNameByAction[input.action] || "kiosk.checkout_event",
    page: "menu",
    component: "checkout",
    action: input.action,
    target: input.method ?? null,
    payload: input.payload,
  });
}

export function trackApiTiming(input: TrackApiTimingInput) {
  if (!TELEMETRY_ENABLED) return null;
  enqueueTrackedEvent({
    name: input.name || "kiosk.api_timed",
    page: input.page || "system",
    component: input.component || "network",
    action: "timing",
    target: input.target || input.apiName,
    payload: {
      apiName: input.apiName,
      durationMs: input.durationMs,
      success: input.success,
      ...input.payload,
    },
  });
}

export function trackError(input: TrackErrorInput) {
  if (!TELEMETRY_ENABLED) return null;
  enqueueTrackedEvent({
    name: input.name || "kiosk.error",
    page: input.page,
    component: input.component,
    action: "error",
    target: input.target || input.code,
    payload: {
      code: input.code,
      message: input.message,
      ...input.payload,
    },
  });
}

export function flush() {
  if (!TELEMETRY_ENABLED) return Promise.resolve(true);
  return flushBufferedEvents();
}

export function flushUrgent() {
  if (!TELEMETRY_ENABLED) return Promise.resolve(true);
  return flushBufferedEventsUrgent();
}
