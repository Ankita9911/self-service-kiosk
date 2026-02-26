import * as analyticsService from "./analytics.service.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

export const getOverview = asyncHandler(async (req, res) => {
    const data = await analyticsService.getAnalyticsOverview(req.tenant);

    return sendSuccess(res, {
        message: "Analytics fetched successfully",
        data,
    });
});
