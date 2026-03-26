import { sendSuccess } from "../../../shared/utils/response.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";
import * as telemetryIngestService from "../service/telemetry.ingest.service.js";

export const createTelemetryBatch = asyncHandler(async (req, res) => {
  const result = await telemetryIngestService.queueTelemetryBatch(req.body, {
    tenant: req.tenant,
    user: req.user,
  });

  return sendSuccess(res, {
    statusCode: 202,
    message: "Telemetry batch accepted",
    data: result,
  });
});

