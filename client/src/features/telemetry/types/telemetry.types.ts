export interface KioskTelemetryFilters {
  from: string;
  to: string;
  outletId: string;
  deviceId: string;
  page: string;
  component: string;
}

export interface KioskTelemetryWindow {
  from: string;
  to: string;
}

export interface KioskTelemetryOverview {
  window: KioskTelemetryWindow;
  summary: {
    sessions: number;
    uniqueDevices: number;
    avgSessionDurationMs: number;
    bounceRate: number;
    cartCreationRate: number;
    checkoutStartRate: number;
    completionRate: number;
    failureRate: number;
    forceLogoutRate: number;
  };
  topDropOff: {
    step: string;
    count: number;
  } | null;
}

export interface KioskTelemetryFunnelRow {
  step: string;
  sessions: number;
  conversionFromPrevious: number;
}

export interface KioskTelemetryFunnel {
  window: KioskTelemetryWindow;
  totalSessions: number;
  funnel: KioskTelemetryFunnelRow[];
}

export interface KioskTelemetryPageMetric {
  page: string;
  totalEvents: number;
  pageViews: number;
  pageExits: number;
}

export interface KioskTelemetryPages {
  window: KioskTelemetryWindow;
  items: KioskTelemetryPageMetric[];
}

export interface KioskTelemetryComponentMetric {
  page: string;
  component: string;
  action: string;
  count: number;
  uniqueTargets: number;
}

export interface KioskTelemetryComponents {
  window: KioskTelemetryWindow;
  items: KioskTelemetryComponentMetric[];
}

export interface KioskTelemetryDeviceMetric {
  deviceId: string;
  sessionCount: number;
  completedSessions: number;
  failedSessions: number;
  checkoutStartedSessions: number;
  avgSessionDurationMs: number;
  completionRate: number;
}

export interface KioskTelemetryDevices {
  window: KioskTelemetryWindow;
  items: KioskTelemetryDeviceMetric[];
}

export interface KioskTelemetryErrorMetric {
  page: string;
  component: string;
  errorCode: string;
  count: number;
}

export interface KioskTelemetryErrors {
  window: KioskTelemetryWindow;
  items: KioskTelemetryErrorMetric[];
}

export interface KioskTelemetrySessionItem {
  visitorSessionId: string;
  deviceId: string;
  status: string;
  startedAt: string;
  endedAt: string | null;
  lastEventAt: string;
  entryPage: string | null;
  exitPage: string | null;
  eventCount: number;
  errorCount: number;
  cartCreated: boolean;
  checkoutStarted: boolean;
  orderCompleted: boolean;
  orderFailed: boolean;
  forceLoggedOut: boolean;
  funnelSteps: string[];
  dropOffStep: string | null;
}

export interface KioskTelemetrySessions {
  window: KioskTelemetryWindow;
  items: KioskTelemetrySessionItem[];
  pagination: {
    limit: number;
    hasNext: boolean;
    nextCursor: string | null;
    totalMatching: number;
  };
}

export interface KioskTelemetrySessionDetail {
  visitorSessionId: string;
  deviceId: string;
  status: string;
  startedAt: string;
  lastEventAt: string;
  endedAt: string | null;
  entryPage: string | null;
  exitPage: string | null;
  pagesVisited: string[];
  funnelSteps: string[];
  eventCount: number;
  errorCount: number;
  cartCreated: boolean;
  checkoutStarted: boolean;
  orderCompleted: boolean;
  orderFailed: boolean;
  forceLoggedOut: boolean;
  appVersion: string | null;
}

export interface KioskTelemetrySessionEvent {
  eventId: string;
  name: string;
  page: string | null;
  component: string | null;
  action: string | null;
  target: string | null;
  payload: Record<string, unknown> | null;
  seq: number;
  eventAt: string;
  receivedAt: string;
}

export interface KioskTelemetrySessionEvents {
  visitorSessionId: string;
  items: KioskTelemetrySessionEvent[];
}

export interface KioskTelemetryDashboardData {
  status: KioskTelemetryStatus;
  overview: KioskTelemetryOverview;
  funnel: KioskTelemetryFunnel;
  pages: KioskTelemetryPages;
  components: KioskTelemetryComponents;
  devices: KioskTelemetryDevices;
  errors: KioskTelemetryErrors;
  sessions: KioskTelemetrySessions;
}

export interface KioskTelemetryStatus {
  checkedAt: string;
  windowHours: number;
  ingestEnabled: boolean;
  readCacheEnabled: boolean;
  rawRetentionDays: number;
  eventCount: number;
  sessionCount: number;
  latestEventAt: string | null;
  latestEventName: string | null;
  latestEventDeviceId: string | null;
  latestSessionStartedAt: string | null;
  latestSessionDeviceId: string | null;
  latestVisitorSessionId: string | null;
  latestSessionStatus: string | null;
  freshness: {
    state: "healthy" | "warning" | "idle" | "disabled";
    idleMinutes: number | null;
    message: string;
  };
}
