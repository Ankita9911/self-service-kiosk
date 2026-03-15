import * as recommendationService from "../service/recommendation.service.js";
import { sendSuccess } from "../../../shared/utils/response.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";

export const getTrending = asyncHandler(async (req, res) => {
  const windowHours = req.query.windowHours ? Number(req.query.windowHours) : 4;
  const limit = req.query.limit ? Number(req.query.limit) : 8;

  const data = await recommendationService.getTrending(req.tenant, {
    windowHours,
    limit,
  });

  return sendSuccess(res, {
    message: "Trending items fetched successfully",
    data,
  });
});

export const getFrequentlyBoughtTogether = asyncHandler(async (req, res) => {
  // itemIds passed as comma-separated query param: ?itemIds=id1,id2
  const rawIds = req.query.itemIds ?? "";
  const itemIds = rawIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const limit = req.query.limit ? Number(req.query.limit) : 5;
  const windowDays = req.query.windowDays ? Number(req.query.windowDays) : 30;

  const data = await recommendationService.getFrequentlyBoughtTogether(
    req.tenant,
    itemIds,
    { limit, windowDays },
  );

  return sendSuccess(res, {
    message: "Frequently bought together fetched successfully",
    data,
  });
});

export const getCompleteMeal = asyncHandler(async (req, res) => {
  // cartItemIds and cartCategoryIds as comma-separated query params
  const rawItemIds = req.query.cartItemIds ?? "";
  const rawCategoryIds = req.query.cartCategoryIds ?? "";

  const cartItemIds = rawItemIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const cartCategoryIds = rawCategoryIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const limit = req.query.limit ? Number(req.query.limit) : 4;
  const windowDays = req.query.windowDays ? Number(req.query.windowDays) : 30;

  const data = await recommendationService.getCompleteMeal(
    req.tenant,
    cartItemIds,
    cartCategoryIds,
    { limit, windowDays },
  );

  return sendSuccess(res, {
    message: "Complete meal suggestions fetched successfully",
    data,
  });
});
