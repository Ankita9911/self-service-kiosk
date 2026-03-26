import { asyncHandler } from "../../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../../shared/utils/response.js";
import * as telemetryQueryService from "../service/telemetry.query.service.js";
import { applyTelemetryCacheHeaders } from "../service/telemetry.cache.service.js";

export const getOverview = asyncHandler(async (req, res) => {
  applyTelemetryCacheHeaders(res, "overview", req.query);
  const data = await telemetryQueryService.getTelemetryOverview(
    req.tenant,
    req.query,
  );
  return sendSuccess(res, { data });
});

export const getFunnel = asyncHandler(async (req, res) => {
  applyTelemetryCacheHeaders(res, "funnel", req.query);
  const data = await telemetryQueryService.getTelemetryFunnel(
    req.tenant,
    req.query,
  );
  return sendSuccess(res, { data });
});

export const getPages = asyncHandler(async (req, res) => {
  applyTelemetryCacheHeaders(res, "pages", req.query);
  const data = await telemetryQueryService.getTelemetryPages(
    req.tenant,
    req.query,
  );
  return sendSuccess(res, { data });
});

export const getComponents = asyncHandler(async (req, res) => {
  applyTelemetryCacheHeaders(res, "components", req.query);
  const data = await telemetryQueryService.getTelemetryComponents(
    req.tenant,
    req.query,
  );
  return sendSuccess(res, { data });
});

export const getDevices = asyncHandler(async (req, res) => {
  applyTelemetryCacheHeaders(res, "devices", req.query);
  const data = await telemetryQueryService.getTelemetryDevices(
    req.tenant,
    req.query,
  );
  return sendSuccess(res, { data });
});

export const getErrors = asyncHandler(async (req, res) => {
  applyTelemetryCacheHeaders(res, "errors", req.query);
  const data = await telemetryQueryService.getTelemetryErrors(
    req.tenant,
    req.query,
  );
  return sendSuccess(res, { data });
});

export const getSessions = asyncHandler(async (req, res) => {
  applyTelemetryCacheHeaders(res, "sessions", req.query);
  const data = await telemetryQueryService.getTelemetrySessions(
    req.tenant,
    req.query,
  );
  return sendSuccess(res, {
    data: data.items,
    meta: {
      window: data.window,
      pagination: data.pagination,
    },
  });
});

export const getSession = asyncHandler(async (req, res) => {
  applyTelemetryCacheHeaders(res, "session", req.query);
  const data = await telemetryQueryService.getTelemetrySession(
    req.tenant,
    req.params.visitorSessionId,
  );
  return sendSuccess(res, { data });
});

export const getSessionEvents = asyncHandler(async (req, res) => {
  applyTelemetryCacheHeaders(res, "session_events", req.query);
  const data = await telemetryQueryService.getTelemetrySessionEvents(
    req.tenant,
    req.params.visitorSessionId,
  );
  return sendSuccess(res, { data });
});

export const getStatus = asyncHandler(async (req, res) => {
  applyTelemetryCacheHeaders(res, "status", req.query);
  const data = await telemetryQueryService.getTelemetryStatus(
    req.tenant,
    req.query,
  );
  return sendSuccess(res, { data });
});
