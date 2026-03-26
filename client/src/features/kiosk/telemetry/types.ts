export type TelemetryPayload = Record<string, unknown>;

export interface TelemetryEvent {
  eventId: string;
  schemaVersion: number;
  name: string;
  ts: number;
  seq: number;
  page: string;
  component: string;
  action: string;
  target: string | null;
  payload: TelemetryPayload;
}

export interface BufferedTelemetryEvent extends TelemetryEvent {
  visitorSessionId: string;
}

export interface TelemetryBatchRequest {
  visitorSessionId: string;
  appVersion?: string;
  events: TelemetryEvent[];
}

export interface VisitorSessionState {
  visitorSessionId: string;
  sequence: number;
  startedAt: number;
  meta: TelemetryPayload;
}

export interface TelemetryFlushOptions {
  keepalive?: boolean;
}

export type TelemetryTransportStatus = "sent" | "unauthenticated" | "failed";

export interface TrackEventInput {
  name?: string;
  page: string;
  component: string;
  action: string;
  target?: string | null;
  payload?: TelemetryPayload;
}

export interface TrackClickInput {
  name?: string;
  page: string;
  component: string;
  action?: string;
  target?: string | null;
  payload?: TelemetryPayload;
}

export interface TrackFieldInput {
  name?: string;
  page: string;
  component: string;
  field: string;
  action: string;
  payload?: TelemetryPayload;
}

export interface TrackDialogInput {
  name?: string;
  page: string;
  component: string;
  action: string;
  target?: string | null;
  payload?: TelemetryPayload;
}

export interface TrackCartMutationInput {
  name?: string;
  action: string;
  itemId: string;
  quantityBefore: number;
  quantityAfter: number;
  payload?: TelemetryPayload;
}

export interface TrackCheckoutInput {
  name?: string;
  action: string;
  method?: string;
  payload?: TelemetryPayload;
}

export interface TrackApiTimingInput {
  name?: string;
  apiName: string;
  durationMs: number;
  success: boolean;
  page?: string;
  component?: string;
  target?: string | null;
  payload?: TelemetryPayload;
}

export interface TrackErrorInput {
  name?: string;
  page: string;
  component: string;
  code: string;
  message?: string;
  target?: string | null;
  payload?: TelemetryPayload;
}
