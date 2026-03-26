import { v4 as uuidv4 } from "uuid";
import { TELEMETRY_SESSION_STORAGE_KEY } from "./constants";
import type { TelemetryPayload, VisitorSessionState } from "./types";

function canUseSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function isTelemetryPayload(value: unknown): value is TelemetryPayload {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readStoredSession(): VisitorSessionState | null {
  if (!canUseSessionStorage()) return null;

  try {
    const raw = window.sessionStorage.getItem(TELEMETRY_SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<VisitorSessionState>;
    if (
      typeof parsed.visitorSessionId !== "string" ||
      typeof parsed.sequence !== "number" ||
      typeof parsed.startedAt !== "number"
    ) {
      return null;
    }

    return {
      visitorSessionId: parsed.visitorSessionId,
      sequence: parsed.sequence,
      startedAt: parsed.startedAt,
      meta: isTelemetryPayload(parsed.meta) ? parsed.meta : {},
    };
  } catch {
    return null;
  }
}

function writeStoredSession(session: VisitorSessionState) {
  if (!canUseSessionStorage()) return;

  try {
    window.sessionStorage.setItem(
      TELEMETRY_SESSION_STORAGE_KEY,
      JSON.stringify(session),
    );
  } catch {
    // Non-fatal. Telemetry can still operate in-memory for the current page.
  }
}

export function getCurrentVisitorSession() {
  return readStoredSession();
}

export function ensureVisitorSession(meta: TelemetryPayload = {}) {
  const existing = readStoredSession();
  if (existing) {
    if (Object.keys(meta).length === 0) {
      return { session: existing, created: false };
    }

    const mergedSession = {
      ...existing,
      meta: { ...existing.meta, ...meta },
    };
    writeStoredSession(mergedSession);
    return { session: mergedSession, created: false };
  }

  const session: VisitorSessionState = {
    visitorSessionId: uuidv4(),
    sequence: 0,
    startedAt: Date.now(),
    meta: { ...meta },
  };

  writeStoredSession(session);
  return { session, created: true };
}

export function incrementVisitorSequence(meta: TelemetryPayload = {}) {
  const { session, created } = ensureVisitorSession(meta);
  const nextSession = {
    ...session,
    sequence: session.sequence + 1,
    meta: Object.keys(meta).length === 0 ? session.meta : { ...session.meta, ...meta },
  };

  writeStoredSession(nextSession);
  return { session: nextSession, seq: nextSession.sequence, created };
}

export function clearVisitorSession() {
  if (!canUseSessionStorage()) return;

  try {
    window.sessionStorage.removeItem(TELEMETRY_SESSION_STORAGE_KEY);
  } catch {
    // non-fatal
  }
}
