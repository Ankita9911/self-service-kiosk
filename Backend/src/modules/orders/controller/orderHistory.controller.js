import * as orderHistoryService from "../service/orderHistory.service.js";
import { sendSuccess } from "../../../shared/utils/response.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";

export const getOrdersPage = asyncHandler(async (req, res) => {
  const filters = {
    period: req.query.period,
    date: req.query.date,
    status: req.query.status,
    paymentMethod: req.query.paymentMethod,
    search: req.query.search,
    franchiseId: req.query.franchiseId,
    outletId: req.query.outletId,
  };

  const result = await orderHistoryService.getOrdersPage(
    req.tenant,
    filters,
    req.query.cursor,
    req.query.limit,
  );

  return sendSuccess(res, {
    message: "Orders fetched successfully",
    data: result.items,
    meta: { pagination: result.pagination },
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderHistoryService.getOrderById(req.params.id, req.tenant);

  return sendSuccess(res, {
    message: "Order fetched successfully",
    data: order,
  });
});

export const getOrderStats = asyncHandler(async (req, res) => {
  const filters = {
    period: req.query.period,
    date: req.query.date,
    status: req.query.status,
    paymentMethod: req.query.paymentMethod,
    search: req.query.search,
    franchiseId: req.query.franchiseId,
    outletId: req.query.outletId,
  };

  const result = await orderHistoryService.getOrderStats(req.tenant, filters);

  return sendSuccess(res, {
    message: "Order stats fetched successfully",
    data: result,
  });
});
