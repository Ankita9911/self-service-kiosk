import * as orderService from "../service/order.service.js";
import { sendSuccess } from "../../../shared/utils/response.js";
import { asyncHandler } from "../../../shared/utils/asyncHandler.js";

export const createOrder = asyncHandler(async (req, res) => {
  const result = await orderService.createOrder(
    req.body,
    req.tenant,
    req.user.role,
  );

  return sendSuccess(res, {
    statusCode: 202,
    message: "Order accepted and queued for processing",
    data: result,
  });
});

export const getOrderProcessingStatus = asyncHandler(async (req, res) => {
  const result = await orderService.getOrderProcessingStatus(
    req.params.clientOrderId,
    req.tenant,
  );

  return sendSuccess(res, {
    message: "Order status fetched successfully",
    data: result,
  });
});

export const listOrders = asyncHandler(async (req, res) => {
  const statusArray = req.query.statuses
    ? req.query.statuses.split(",").filter(Boolean)
    : null;

  const result = await orderService.listOrders(req.tenant, statusArray);

  return sendSuccess(res, {
    message: "Orders fetched successfully",
    data: result,
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const result = await orderService.updateOrderStatus(
    req.params.id,
    req.body.status,
    req.tenant,
  );

  return sendSuccess(res, {
    message: "Order status updated successfully",
    data: result,
  });
});
